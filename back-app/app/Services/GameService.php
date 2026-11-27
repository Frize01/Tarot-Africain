<?php

// app/Services/GameService.php
namespace App\Services;

use App\Contracts\GameServiceContract;
use App\Events\{
    DealerSet, CardsDealt, PlayerAnnounced, AllPlayersAnnounced,
    CardPlayed, TrickResolved, RoundScored, GameOver, TurnStarted
};
use App\Jobs\{BroadcastNextDealer, TurnTimeout};
use App\Models\{GameLog, GameState, Room};
use Illuminate\Support\Facades\{Cache, Log};
use Symfony\Component\HttpKernel\Exception\HttpException;


class GameService implements GameServiceContract
{
    private const TTL = 3600;

    public function __construct(
        private readonly DeckService $deck,
        private readonly TarotBot $bot = new TarotBot(),
    ) {}

    // =========================================================================
    // Cache helpers
    // =========================================================================

    private function cacheKey(string $roomId): string
    {
        return "game:{$roomId}";
    }

    private function getState(string $roomId): array
    {
        $cached = Cache::get($this->cacheKey($roomId));

        if ($cached) {
            return $cached;
        }

        // Fallback DB si Redis a perdu l'état (redémarrage, etc.)
        $gs = GameState::where('room_id', $roomId)->firstOrFail();

        return array_merge(
            ['phase' => $gs->phase, 'round' => $gs->round, 'lives' => $gs->lives],
            $gs->state
        );
    }

    private function saveState(string $roomId, array $state): void
    {
        Cache::put($this->cacheKey($roomId), $state, self::TTL);
    }

    // Persistance DB aux points clés (fin de pli, fin de manche, fin de partie)
    private function persistState(string $roomId, array $state): void
    {
        $this->saveState($roomId, $state);

        $lives = $state['lives'] ?? [];
        $phase = $state['phase'] ?? 'playing';
        $round = $state['round'] ?? 1;

        // Tout sauf les champs communs va dans state
        $stateBlob = collect($state)
            ->except(['lives', 'phase', 'round'])
            ->all();

        GameState::updateOrCreate(
            ['room_id' => $roomId],
            ['phase' => $phase, 'round' => $round, 'lives' => $lives, 'state' => $stateBlob]
        );
    }

    // =========================================================================
    // Helpers joueurs
    // =========================================================================

    private function alivePlayers(array $players, array $lives): array
    {
        return collect($players)
            ->filter(fn($p) => ($lives[$p['id']] ?? 0) > 0)
            ->values()
            ->all();
    }

    private function nextAliveIndex(int $current, array $players, array $lives): int
    {
        $n = count($players);
        for ($i = 1; $i <= $n; $i++) {
            $next = ($current + $i) % $n;
            if (($lives[$players[$next]['id']] ?? 0) > 0) {
                return $next;
            }
        }
        return $current;
    }

    private function assertCurrentPlayer(array $state, array $players, string $playerId): bool
    {
        $expected = collect($players)->search(fn($p) => $p['id'] === $playerId);
        return $state['currentPlayerIndex'] === $expected;
    }

    // évite la double actions
    private function withGameLock(string $roomId, callable $fn): mixed
    {
        return Cache::lock("game-action:{$roomId}", 10)->block(5, $fn);
    }

    // =========================================================================
    // Minuteur de tour + IA pour les joueurs absents
    // =========================================================================

    /**
     * Démarre le minuteur du joueur courant : à l'échéance, TurnTimeout fait jouer l'IA.
     * $delaySeconds décale le départ (ex. affichage du pli terminé côté front).
     * À appeler après chaque changement de joueur courant en phase announcing/playing.
     */
    private function startTurn(string $roomId, array $state, int $delaySeconds = 0): void
    {
        $now      = now()->getTimestampMs();
        $startsAt = $now + $delaySeconds * 1000;
        $deadline = $startsAt + config('game.turn_seconds', 20) * 1000;

        $state['turnSeq']      = ($state['turnSeq'] ?? 0) + 1;
        $state['turnStartsAt'] = $startsAt;
        $state['turnDeadline'] = $deadline;
        $this->saveState($roomId, $state);

        broadcast(new TurnStarted($roomId, $state['currentPlayerIndex'], $startsAt, $deadline, $now));

        // +1 s de marge : le job ne doit pas passer avant l'échéance (sinon il ne fait rien)
        TurnTimeout::dispatch($roomId, $state['turnSeq'])
            ->delay(now()->addMilliseconds($deadline - $now + 1000));
    }

    /** Le tour $turnSeq est-il toujours en cours et son délai dépassé ? */
    private function isTurnExpired(string $roomId, int $turnSeq): bool
    {
        $state = Cache::get($this->cacheKey($roomId));

        return $state !== null
            && ($state['turnSeq'] ?? null) === $turnSeq
            && in_array($state['phase'] ?? null, ['announcing', 'playing'], true)
            && now()->getTimestampMs() >= ($state['turnDeadline'] ?? PHP_INT_MAX);
    }

    public function autoPlay(string $roomId, int $turnSeq): void
    {
        // 1re vérification sans verrou : en file « sync » (tests), le job est exécuté
        // pendant l'action qui l'a programmé, donc verrou déjà pris → on sort tout de suite.
        if (!$this->isTurnExpired($roomId, $turnSeq)) {
            return;
        }

        try {
            $this->withGameLock($roomId, function () use ($roomId, $turnSeq) {
                if (!$this->isTurnExpired($roomId, $turnSeq)) {
                    return; // le joueur a agi juste avant
                }

                $room     = Room::with('players')->findOrFail($roomId);
                $players  = $this->formatPlayers($room);
                $state    = $this->getState($roomId);
                $playerId = $players[$state['currentPlayerIndex']]['id'];
                $hand     = $state['hands'][$playerId] ?? [];
                $alive    = $this->alivePlayers($players, $state['lives']);

                $this->log($roomId, $playerId, 'turn_timeout', ['phase' => $state['phase']]);

                if ($state['phase'] === 'announcing') {
                    $isLast    = (count($alive) - count($state['announcements'])) === 1;
                    $forbidden = $isLast ? $state['cardsPerPlayer'] - array_sum($state['announcements']) : null;
                    $count     = $this->bot->announce($hand, count($alive) - 1, $state['cardsPerPlayer'], $forbidden);

                    $this->doAnnounce($roomId, $playerId, $count);
                    return;
                }

                $needed = ($state['announcements'][$playerId] ?? 0) - ($state['tricksWon'][$playerId] ?? 0);
                $choice = $this->bot->chooseCard($hand, $state['trick'] ?? [], $needed);

                $this->doPlayCard($roomId, $playerId, $choice['cardId'], $choice['excuseValue']);
            });
        } catch (HttpException $e) {
            // ne devrait pas arriver (le bot respecte les règles) : on trace sans faire échouer le job
            Log::warning("autoPlay {$roomId} : {$e->getMessage()}");
        }
    }

    // =========================================================================
    // Logging
    // =========================================================================

    private function log(string $roomId, string $playerId, string $action, array $data = []): void
    {
        GameLog::record($roomId, $playerId, $action, $data);
    }

    // =========================================================================
    // playerView — état de la partie vu par un joueur
    // =========================================================================

    public function playerView(string $roomId, string $playerId): ?array
    {
        if (!Cache::has($this->cacheKey($roomId)) && !GameState::where('room_id', $roomId)->exists()) {
            return null; // partie lancée mais donneur pas encore désigné
        }

        $room    = Room::with('players')->findOrFail($roomId);
        $players = $this->formatPlayers($room);
        $state   = $this->getState($roomId);
        $hands   = $state['hands'] ?? [];

        return [
            'phase'              => $state['phase'],
            'round'              => $state['round'],
            'dealerIndex'        => $state['dealerIndex'],
            'currentPlayerIndex' => $state['currentPlayerIndex'],
            'cardsPerPlayer'     => $state['cardsPerPlayer'],
            'playerIds'          => array_column($players, 'id'),
            'lives'              => $state['lives'],
            'announcements'      => (object) ($state['announcements'] ?? []),
            'tricksWon'          => $state['tricksWon'] ?? [],
            'trick'              => $state['trick'] ?? [],
            // les mains adverses restent cachées : seulement le nombre de cartes
            'handCounts'         => collect($players)->mapWithKeys(fn($p) => [$p['id'] => count($hands[$p['id']] ?? [])])->all(),
            'myHand'             => array_values($hands[$playerId] ?? []),
            // minuteur du tour en cours (ms, horloge serveur) : l'anneau reprend au bon endroit après un refresh
            'turnStartsAt'       => $state['turnStartsAt'] ?? null,
            'turnDeadline'       => $state['turnDeadline'] ?? null,
            'serverNow'          => now()->getTimestampMs(),
        ];
    }

    // =========================================================================
    // setDealer
    // =========================================================================

    public function setDealer(string $roomId): void
    {
        $room    = Room::with('players', 'game')->findOrFail($roomId);
        $players = $this->formatPlayers($room);
        $n       = count($players);
        $config  = config("game.config.{$n}");

        if ($room->status->value === 'finished') {
            abort(409, 'La partie est terminée.');
        }
        if (Cache::has($this->cacheKey($roomId)) || GameState::where('room_id', $roomId)->exists()) {
            abort(409, 'La partie est déjà en cours.');
        }

        if ($config === null) {
            abort(422, "Nombre de joueurs non supporté ({$n}). Il faut entre 3 et 5 joueurs.");
        }

        $dealerIndex      = random_int(0, $n - 1);
        $nextPlayerIndex  = ($dealerIndex + 1) % $n;

        $state = [
            'phase'               => 'dealing',
            'round'               => 1,
            'lives'               => collect($players)->mapWithKeys(fn($p) => [$p['id'] => $config['lives']])->all(),
            'deck'                => $this->deck->fresh(),
            'hands'               => [],
            'trick'               => [],
            'announcements'       => [],
            'tricksWon'           => collect($players)->mapWithKeys(fn($p) => [$p['id'] => 0])->all(),
            'dealerIndex'         => $dealerIndex,
            'currentPlayerIndex'  => $nextPlayerIndex,
            'cardsPerPlayer'      => $config['startCards'],
        ];

        $this->persistState($roomId, $state);
        $this->log($roomId, $players[$dealerIndex]['id'], 'dealer_set', ['dealerIndex' => $dealerIndex]);

        broadcast(new DealerSet($roomId, $dealerIndex, 1, $nextPlayerIndex, array_column($players, 'id')));
    }

    // =========================================================================
    // deal
    // =========================================================================

    public function deal(string $roomId, string $callerId): array
    {
        return Cache::lock("deal:{$roomId}", 10)->block(10, function () use ($roomId, $callerId) {
            $room    = Room::with('players')->findOrFail($roomId);
            $players = $this->formatPlayers($room);
            $state   = $this->getState($roomId);

            // phase 'dealing' = distribution pas encore faite pour cette manche.
            if (($state['phase'] ?? null) === 'dealing') {
                $state['hands']         = $this->deck->deal($state['deck'], $players, $state['cardsPerPlayer'], $state['lives']);
                $state['announcements'] = [];
                $state['trick']         = [];
                $state['tricksWon']     = collect($players)->mapWithKeys(fn($p) => [$p['id'] => 0])->all();
                $state['phase']         = 'announcing';

                // currentPlayerIndex = joueur après le dealer
                $state['currentPlayerIndex'] = $this->nextAliveIndex($state['dealerIndex'], $players, $state['lives']);

                $this->saveState($roomId, $state);

                $this->log($roomId, $callerId, 'cards_dealt', ['cardsPerPlayer' => $state['cardsPerPlayer']]);

                broadcast(new CardsDealt($roomId, $state['cardsPerPlayer']));

                $this->startTurn($roomId, $state);
                $state = $this->getState($roomId);
            }

            return $state['hands'][$callerId] ?? [];
        });
    }

    // =========================================================================
    // announce
    // =========================================================================

    public function announce(string $roomId, string $playerId, int $count): bool
    {
        return $this->withGameLock($roomId, fn() => $this->doAnnounce($roomId, $playerId, $count));
    }

    private function doAnnounce(string $roomId, string $playerId, int $count): bool
    {
        $room    = Room::with('players')->findOrFail($roomId);
        $players = $this->formatPlayers($room);
        $state   = $this->getState($roomId);

        if (($state['phase'] ?? null) !== 'announcing') {
            abort(400, "Ce n'est pas le moment d'annoncer.");
        }

        if (!$this->assertCurrentPlayer($state, $players, $playerId)) {
            abort(400, "Ce n'est pas votre tour.");
        }

        if ($count < 0 || $count > $state['cardsPerPlayer']) {
            abort(400, "Annonce impossible : entre 0 et {$state['cardsPerPlayer']}.");
        }

        $alive          = $this->alivePlayers($players, $state['lives']);
        $totalAnnounced = array_sum($state['announcements']);
        $isLast         = (count($alive) - count($state['announcements'])) === 1;

        // Règle : le dernier ne peut pas compléter exactement le total
        if ($isLast && $count === $state['cardsPerPlayer'] - $totalAnnounced) {
            return false;
        }

        $state['announcements'][$playerId] = $count;
        $state['currentPlayerIndex']       = $this->nextAliveIndex(
            $state['currentPlayerIndex'], $players, $state['lives']
        );

        $this->saveState($roomId, $state);
        $this->log($roomId, $playerId, 'announced', ['count' => $count]);

        broadcast(new PlayerAnnounced($roomId, $playerId, $count, $state['currentPlayerIndex']));

        if (count($state['announcements']) === count($alive)) {
            $state['phase'] = 'playing';
            $this->saveState($roomId, $state);
            broadcast(new AllPlayersAnnounced($roomId, $state['announcements']));
        }

        // prochain annonceur, ou 1er joueur du 1er pli
        $this->startTurn($roomId, $state);

        return true;
    }

    // =========================================================================
    // playCard
    // =========================================================================

    public function playCard(string $roomId, string $playerId, int $cardId, ?int $excuseValue): void
    {
        $this->withGameLock($roomId, fn() => $this->doPlayCard($roomId, $playerId, $cardId, $excuseValue));
    }

    private function doPlayCard(string $roomId, string $playerId, int $cardId, ?int $excuseValue): void
    {
        $room    = Room::with('players')->findOrFail($roomId);
        $players = $this->formatPlayers($room);
        $state   = $this->getState($roomId);

        if (($state['phase'] ?? null) !== 'playing') {
            abort(400, "Ce n'est pas le moment de jouer une carte.");
        }

        if (!$this->assertCurrentPlayer($state, $players, $playerId)) {
            abort(400, "Ce n'est pas votre tour.");
        }

        // Retirer la carte de la main
        $hand    = $state['hands'][$playerId] ?? [];
        $cardIdx = collect($hand)->search(fn($c) => $c['id'] === $cardId);

        if ($cardIdx === false) {
            abort(400, 'Carte introuvable dans votre main.');
        }

        $card = $hand[$cardIdx];

        // excuse = 0 ou 22
        $isExcuse = $card['value'] === null;
        if ($isExcuse && !in_array($excuseValue, [0, 22], true)) {
            abort(400, "Choisissez la valeur de l'Excuse : 0 ou 22.");
        }
        $excuseValue = $isExcuse ? $excuseValue : null;
        array_splice($state['hands'][$playerId], $cardIdx, 1);

        $state['trick'][] = ['playerId' => $playerId, 'card' => $card, 'excuseValue' => $excuseValue];
        $state['currentPlayerIndex'] = $this->nextAliveIndex(
            $state['currentPlayerIndex'], $players, $state['lives']
        );

        $this->saveState($roomId, $state);
        $this->log($roomId, $playerId, 'card_played', ['cardId' => $cardId, 'excuseValue' => $excuseValue]);

        broadcast(new CardPlayed($roomId, $playerId, $card, $excuseValue, $state['currentPlayerIndex']));

        $alive = $this->alivePlayers($players, $state['lives']);

        // Pli incomplet — on attend les autres joueurs
        if (count($state['trick']) < count($alive)) {
            $this->startTurn($roomId, $state);
            return;
        }

        $this->resolveTrick($roomId, $state, $players, $alive);
    }

    // =========================================================================
    // resolveTrick — privé
    // =========================================================================

    private function resolveTrick(string $roomId, array $state, array $players, array $alive): void
    {
        $winnerId = $this->deck->resolveTrick($state['trick']);

        $state['tricksWon'][$winnerId] = ($state['tricksWon'][$winnerId] ?? 0) + 1;
        $state['currentPlayerIndex']   = collect($players)->search(fn($p) => $p['id'] === $winnerId);

        $trick       = $state['trick'];
        $state['trick'] = [];

        // Persist DB à chaque fin de pli
        $this->persistState($roomId, $state);
        $this->log($roomId, $winnerId, 'trick_resolved', ['trick' => $trick]);

        broadcast(new TrickResolved($roomId, $winnerId, collect($trick)->pluck('card')->all()));

        $handsLeft = collect($alive)->some(fn($p) => count($state['hands'][$p['id']] ?? []) > 0);

        if ($handsLeft) {
            // le gagnant entame, après le temps d'affichage du pli côté front
            $this->startTurn($roomId, $state, config('game.trick_display_seconds', 2));
            return;
        }

        $this->scoreRound($roomId, $state, $players);
    }

    // =========================================================================
    // scoreRound — privé
    // =========================================================================

    private function scoreRound(string $roomId, array $state, array $players): void
    {
        $results = collect($players)->map(function ($p) use (&$state) {
            $announced  = $state['announcements'][$p['id']] ?? 0;
            $won        = $state['tricksWon'][$p['id']] ?? 0;
            $lost       = abs($announced - $won);
            $remaining  = max(0, ($state['lives'][$p['id']] ?? 0) - $lost);

            $state['lives'][$p['id']] = $remaining;

            return [
                'id'              => $p['id'],
                'announced'       => $announced,
                'tricksWon'       => $won,
                'livesLost'       => $lost,
                'livesRemaining'  => $remaining,
            ];
        })->all();

        $state['phase']        = 'scoring';
        $state['turnDeadline'] = null; // plus de minuteur jusqu'à la prochaine distribution

        // Persist DB à chaque fin de manche
        $this->persistState($roomId, $state);
        $this->log($roomId, 'system', 'round_scored', ['results' => $results]);

        broadcast(new RoundScored($roomId, $results));

        $survivors = collect($players)->filter(fn($p) => ($state['lives'][$p['id']] ?? 0) > 0)->values();

        // ── Fin de partie ─────────────────────────────────────────────────
        if ($survivors->count() <= 1) {
            $winner = $survivors->sortByDesc(fn($p) => $state['lives'][$p['id']])->first();

            $this->log($roomId, $winner['id'] ?? 'system', 'game_over', [
                'winnerId'  => $winner['id'] ?? null,
                'survivors' => $survivors->pluck('id')->all(),
            ]);

            GameState::where('room_id', $roomId)->delete();
            Cache::forget($this->cacheKey($roomId));
            Room::whereKey($roomId)->update(['status' => 'finished']);

            broadcast(new GameOver($roomId, $winner['id'] ?? null, $survivors->pluck('id')->all()));
            return;
        }

        // ── Manche suivante ───────────────────────────────────────────────
        $numAlive = $survivors->count();
        $config   = config("game.config.{$numAlive}");

        $state['cardsPerPlayer']      = $state['cardsPerPlayer'] === 1
                                            ? $config['startCards']
                                            : $state['cardsPerPlayer'] - 1;
        $state['round']++;
        $state['phase']               = 'dealing';
        $state['dealerIndex']         = $this->nextAliveIndex($state['dealerIndex'], $players, $state['lives']);
        $state['currentPlayerIndex']  = $this->nextAliveIndex($state['dealerIndex'], $players, $state['lives']);

        $this->persistState($roomId, $state);

        // Délai 4s avant le prochain DealerSet (comme dans le mock)
        BroadcastNextDealer::dispatch(
            $roomId,
            $state['dealerIndex'],
            $state['currentPlayerIndex'],
            $state['round'],
            array_column($players, 'id'),
        )->delay(now()->addSeconds(4));
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private function formatPlayers(Room $room): array
    {
        return $room->players->map(fn($u) => [
            'id'       => (string) $u->id,
            'name'     => $u->firstname,
            'color'    => $u->pivot->color ?? '#ffffff',
            'position' => $u->pivot->position,
            'isHost'   => (bool) $u->pivot->is_host,
        ])->sortBy('position')->values()->all();
    }
}
