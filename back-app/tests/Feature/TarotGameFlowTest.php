<?php

// Test de bout en bout du Tarot Africain via les routes HTTP réelles.
// Pas de pdo_sqlite sous Laragon → base MySQL dédiée (créée une fois : CREATE DATABASE tarot_api_test).
// Lancer (Git Bash) :
//   DB_CONNECTION=mysql DB_DATABASE=tarot_api_test php artisan test --filter=TarotGameFlow

use App\Events\{AllPlayersAnnounced, CardPlayed, DealerSet, GameOver, RoundScored, TrickResolved};
use App\Contracts\GameServiceContract;
use App\Jobs\TurnTimeout;
use App\Models\{Game, Room, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Cache, Event};
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    Event::fake([DealerSet::class, AllPlayersAnnounced::class, CardPlayed::class, TrickResolved::class, RoundScored::class, GameOver::class]);

    $GLOBALS['gameId'] = Game::create([
        'name' => 'Tarot Africain', 'slug' => 'tarot-africain',
        'min_players' => 3, 'max_players' => 5, 'url' => '/tarot_africain', 'description' => 'test',
    ])->id;
});

function makeUsers(int $n): array
{
    // (UserFactory obsolète : il remplit encore 'name', colonne supprimée)
    return collect(range(1, $n))->map(fn($i) => User::create([
        'firstname' => "P$i", 'lastname' => 'T', 'email' => uniqid("p$i") . '@test.local', 'password' => 'secret',
    ]))->all();
}

function as_(User $u): void
{
    Sanctum::actingAs($u);
}

/** Crée un salon avec $n joueurs (le 1er est host) et le lance. */
function setupRoom(array $users, bool $start = true): Room
{
    as_($users[0]);
    $room = test()->postJson('/api/rooms', ['game_id' => $GLOBALS['gameId']])->assertCreated()->json();
    foreach (array_slice($users, 1) as $u) {
        as_($u);
        test()->postJson("/api/rooms/{$room['code']}/join")->assertOk();
    }
    if ($start) {
        as_($users[0]);
        test()->postJson("/api/rooms/{$room['id']}/start")->assertOk();
    }
    return Room::findOrFail($room['id']);
}

function state(Room $room): array
{
    return Cache::get("game:{$room->id}") ?? [];
}

function orderedPlayers(Room $room): array
{
    // même ordre que GameService::formatPlayers
    return $room->fresh()->players->sortBy(fn($u) => $u->pivot->position)->values()->all();
}

/** Distribue : chaque joueur appelle /deal, comme le front. */
function dealAll(Room $room, array $users): void
{
    foreach ($users as $u) {
        as_($u);
        test()->postJson("/api/rooms/{$room->id}/deal")->assertOk();
    }
}

/** Fait annoncer tous les vivants dans l'ordre du serveur, en respectant la règle du dernier. */
function announceAll(Room $room, array $byId): void
{
    $s = state($room);
    $alive = collect($s['lives'])->filter(fn($l) => $l > 0)->count();
    for ($k = 0; $k < $alive; $k++) {
        $s       = state($room);
        $players = orderedPlayers($room);
        $cur     = $players[$s['currentPlayerIndex']];
        $isLast  = $k === $alive - 1;
        $forbid  = $s['cardsPerPlayer'] - array_sum($s['announcements']);
        $count   = random_int(0, $s['cardsPerPlayer']);
        if ($isLast && $count === $forbid) {
            $count = $count > 0 ? $count - 1 : $count + 1;
        }
        as_($byId[(string) $cur->id]);
        test()->postJson("/api/rooms/{$room->id}/announce", ['count' => $count])->assertOk();
    }
}

/** Joue toutes les cartes de la manche ; renvoie le nb de cartes jouées. */
function playRound(Room $room, array $byId): int
{
    $played = 0;
    while ((state($room)['phase'] ?? null) === 'playing') {
        $s       = state($room);
        $players = orderedPlayers($room);
        $cur     = (string) $players[$s['currentPlayerIndex']]->id;
        $card    = $s['hands'][$cur][0] ?? null;
        expect($card)->not->toBeNull("le joueur courant $cur n'a plus de carte");
        as_($byId[$cur]);
        test()->postJson("/api/rooms/{$room->id}/play", [
            'card_id' => $card['id'],
            'excuse_value' => $card['value'] === null ? [0, 22][random_int(0, 1)] : null,
        ])->assertOk();
        $played++;
        expect($played)->toBeLessThan(200);
    }
    return $played;
}

// =============================================================================

it('refuse de lancer une partie à 2 joueurs', function () {
    $users = makeUsers(2);
    $room  = setupRoom($users, start: false);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/start")->assertStatus(422);
});

foreach ([3, 4, 5] as $n) {
    it("joue une partie complète à $n joueurs jusqu'à GameOver", function () use ($n) {
        $users = makeUsers($n);
        $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
        $room  = setupRoom($users);

        as_($users[0]);
        $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();

        $rounds = 0;
        while (!Event::dispatched(GameOver::class)->count()) {
            $rounds++;
            expect($rounds)->toBeLessThan(300, 'boucle infinie : la partie ne finit jamais');

            $s = state($room);
            expect($s['phase'])->toBe('dealing', "manche $rounds : phase attendue 'dealing'");

            dealAll($room, $users);
            $s = state($room);
            $aliveCount = collect($s['lives'])->filter(fn($l) => $l > 0)->count();
            expect($aliveCount)->toBeGreaterThanOrEqual(2);
            if ($aliveCount === 2) {
                $duelRounds = ($duelRounds ?? 0) + 1;
                expect($s['cardsPerPlayer'])->toBeLessThanOrEqual(7, 'à 2 joueurs : 7 cartes max');
            }
            foreach ($s['lives'] as $id => $l) {
                expect(count($s['hands'][$id] ?? []))->toBe($l > 0 ? $s['cardsPerPlayer'] : 0, "main du joueur $id, manche $rounds");
            }

            announceAll($room, $byId);
            expect(state($room)['phase'])->toBe('playing');

            $before = Event::dispatched(RoundScored::class)->count();
            playRound($room, $byId);
            expect(Event::dispatched(RoundScored::class)->count())->toBe($before + 1, "RoundScored manquant manche $rounds");
        }

        // Chaque manche (sauf la dernière) doit relancer un DealerSet (job BroadcastNextDealer, queue sync)
        expect(Event::dispatched(DealerSet::class)->count())->toBe($rounds);
        Event::assertDispatched(DealerSet::class, fn($e) => count($e->playerIds) === $n);

        // fin de partie = au plus 1 survivant
        $over = Event::dispatched(GameOver::class)->first()[0];
        expect(count($over->survivors))->toBeLessThanOrEqual(1);

        // après GameOver : salon 'finished', pas de relance, résultat dispo pour un refresh
        expect($room->fresh()->status->value)->toBe('finished');
        as_($users[0]);
        $this->postJson("/api/rooms/{$room->id}/dealer")->assertStatus(409);
        $this->getJson("/api/rooms/{$room->code}/state")->assertOk()
            ->assertJsonPath('state', null)
            ->assertJsonPath('gameOver.winnerId', $over->winnerId);

        dump("$n joueurs : partie terminée en $rounds manche(s), dont " . ($duelRounds ?? 0) . " en duel");
    });
}

// ----- Garde-fous attendus (chaque échec = bug) ------------------------------

it('refuse une annonce supérieure au nombre de cartes', function () {
    $users = makeUsers(3);
    $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);

    $s   = state($room);
    $cur = (string) orderedPlayers($room)[$s['currentPlayerIndex']]->id;
    as_($byId[$cur]);
    $this->postJson("/api/rooms/{$room->id}/announce", ['count' => 99])->assertStatus(400);
});

it('refuse de jouer une carte pendant la phase d\'annonce', function () {
    $users = makeUsers(3);
    $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);

    $s   = state($room);
    $cur = (string) orderedPlayers($room)[$s['currentPlayerIndex']]->id;
    as_($byId[$cur]);
    $this->postJson("/api/rooms/{$room->id}/play", ['card_id' => $s['hands'][$cur][0]['id']]);
    expect(count(state($room)['hands'][$cur]))->toBe($s['cardsPerPlayer'], 'une carte a été jouée pendant les annonces');
});

it('refuse une annonce pendant la phase de jeu', function () {
    $users = makeUsers(3);
    $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);
    announceAll($room, $byId);

    $s   = state($room);
    $cur = (string) orderedPlayers($room)[$s['currentPlayerIndex']]->id;
    as_($byId[$cur]);
    $this->postJson("/api/rooms/{$room->id}/announce", ['count' => 0])->assertStatus(400);
});

it('renvoie une erreur quand on joue hors de son tour', function () {
    $users = makeUsers(3);
    $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);
    announceAll($room, $byId);

    $s       = state($room);
    $players = orderedPlayers($room);
    $other   = (string) $players[($s['currentPlayerIndex'] + 1) % 3]->id;
    as_($byId[$other]);
    $this->postJson("/api/rooms/{$room->id}/play", ['card_id' => $s['hands'][$other][0]['id']])
        ->assertStatus(400);
});

it('ne réinitialise pas une partie en cours si /dealer est rappelé (refresh du host)', function () {
    $users = makeUsers(3);
    $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);
    announceAll($room, $byId);

    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer");
    expect(state($room)['phase'])->toBe('playing', 'la partie a été remise à zéro');
});

it('refuse /dealer par un joueur non-host', function () {
    $users = makeUsers(3);
    $room  = setupRoom($users);
    as_($users[1]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertStatus(403);
});

it('refuse /start par un joueur non-host', function () {
    $users = makeUsers(3);
    $room  = setupRoom($users, start: false);
    as_($users[1]);
    $this->postJson("/api/rooms/{$room->id}/start")->assertStatus(403);
});

it("exige une valeur 0 ou 22 pour l'Excuse", function () {
    $users = makeUsers(3);
    $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);
    announceAll($room, $byId);

    // on place l'Excuse dans la main du joueur courant
    $s   = state($room);
    $cur = (string) orderedPlayers($room)[$s['currentPlayerIndex']]->id;
    $s['hands'][$cur][0] = ['id' => 0, 'name' => "L'Excuse", 'value' => null, 'image' => '/tarot_card/0.jpg'];
    Cache::put("game:{$room->id}", $s, 3600);

    as_($byId[$cur]);
    $this->postJson("/api/rooms/{$room->id}/play", ['card_id' => 0])->assertStatus(400);
    $this->postJson("/api/rooms/{$room->id}/play", ['card_id' => 0, 'excuse_value' => 5])->assertStatus(400);
    $this->postJson("/api/rooms/{$room->id}/play", ['card_id' => 0, 'excuse_value' => 22])->assertOk();
    expect(state($room)['trick'][0]['excuseValue'])->toBe(22);
});

it("renvoie l'état de la partie pour reprendre après un refresh", function () {
    $users = makeUsers(3);
    $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
    $room  = setupRoom($users);

    // avant /dealer : state null
    as_($users[1]);
    $this->getJson("/api/rooms/{$room->code}/state")->assertOk()->assertJsonPath('state', null);

    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);
    announceAll($room, $byId);

    as_($users[1]);
    $res = $this->getJson("/api/rooms/{$room->code}/state")->assertOk()->json();
    $s   = state($room);
    expect($res['myId'])->toBe($users[1]->id)
        ->and($res['room']['id'])->toBe($room->id)
        ->and(count($res['room']['players']))->toBe(3)
        ->and($res['state']['phase'])->toBe('playing')
        ->and($res['state']['currentPlayerIndex'])->toBe($s['currentPlayerIndex'])
        ->and(count($res['state']['announcements']))->toBe(3)
        ->and($res['state']['myHand'])->toBe($s['hands'][(string) $users[1]->id])
        ->and(array_values($res['state']['handCounts']))->toBe([$s['cardsPerPlayer'], $s['cardsPerPlayer'], $s['cardsPerPlayer']]);

    // un étranger n'y a pas accès
    as_(makeUsers(1)[0]);
    $this->getJson("/api/rooms/{$room->code}/state")->assertStatus(403);
});

it('fonctionne avec le UserFactory', function () {
    $u = User::factory()->create();
    expect($u->firstname)->not->toBeEmpty();
});

it('redistribue 7 cartes en duel après la manche à 1 carte', function () {
    $users = makeUsers(3);
    $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();

    // On force : un joueur éliminé, manche à 1 carte, vies hautes pour que personne ne meure
    $s = state($room);
    $dead = (string) $users[2]->id;
    foreach ($s['lives'] as $id => $l) $s['lives'][$id] = ((string) $id === $dead) ? 0 : 10;
    $s['cardsPerPlayer'] = 1;
    // le donneur ne doit pas pointer sur le mort
    $players = orderedPlayers($room);
    $s['dealerIndex'] = collect($players)->search(fn($p) => (string) $p->id !== $dead);
    Cache::put("game:{$room->id}", $s, 3600);

    dealAll($room, $users);
    $s = state($room);
    expect(count($s['hands'][$dead]))->toBe(0);
    announceAll($room, $byId);
    playRound($room, $byId);

    // une seule perte de vie max (1 carte) → les 2 survivants continuent, en duel à 7 cartes
    Event::assertNotDispatched(GameOver::class);
    $s = state($room);
    expect($s['phase'])->toBe('dealing')
        ->and($s['cardsPerPlayer'])->toBe(7);
    dealAll($room, $users);
    $s = state($room);
    foreach ($s['lives'] as $id => $l) {
        expect(count($s['hands'][$id]))->toBe($l > 0 ? 7 : 0);
    }
});

// ----- Minuteur de tour + IA (joueur absent) ----------------------------------

/** Simule l'expiration du minuteur du tour en cours (comme le worker de queue après 20 s). */
function expireTurn(Room $room): void
{
    // on se place juste après l'échéance (qui inclut la pause d'affichage du pli éventuelle)
    test()->travelTo(\Illuminate\Support\Carbon::createFromTimestampMs(state($room)['turnDeadline'] + 1));
    (new TurnTimeout($room->id, state($room)['turnSeq']))->handle(app(GameServiceContract::class));
}

it('démarre un minuteur à chaque tour et l’expose dans /state', function () {
    $users = makeUsers(3);
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);

    $s = state($room);
    expect($s['turnSeq'])->toBe(1)
        ->and($s['turnDeadline'] - $s['turnStartsAt'])->toBe(config('game.turn_seconds') * 1000);

    $view = $this->getJson("/api/rooms/{$room->code}/state")->assertOk()->json('state');
    expect($view['turnDeadline'])->toBe($s['turnDeadline'])
        ->and($view['serverNow'])->toBeInt();
});

it("fait annoncer puis jouer l'IA quand le minuteur expire", function () {
    $users = makeUsers(3);
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);

    $before = state($room);
    expireTurn($room);
    $after = state($room);
    expect(count($after['announcements']))->toBe(1)
        ->and($after['currentPlayerIndex'])->not->toBe($before['currentPlayerIndex'])
        ->and($after['turnSeq'])->toBe($before['turnSeq'] + 1);

    expireTurn($room);
    expireTurn($room);
    expect(state($room)['phase'])->toBe('playing');

    $cur = (string) orderedPlayers($room)[state($room)['currentPlayerIndex']]->id;
    $handBefore = count(state($room)['hands'][$cur]);
    expireTurn($room);
    expect(count(state($room)['hands'][$cur]))->toBe($handBefore - 1)
        ->and(state($room)['trick'])->toHaveCount(1);
});

it("ne fait rien si le joueur a agi avant l'échéance, ni avant l'échéance", function () {
    $users = makeUsers(3);
    $byId  = collect($users)->keyBy(fn($u) => (string) $u->id)->all();
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();
    dealAll($room, $users);

    // avant l'échéance : rien
    $seq = state($room)['turnSeq'];
    (new TurnTimeout($room->id, $seq))->handle(app(GameServiceContract::class));
    expect(state($room)['announcements'])->toBeEmpty();

    // le joueur annonce à temps → le job de son tour devient caduc
    $cur = (string) orderedPlayers($room)[state($room)['currentPlayerIndex']]->id;
    as_($byId[$cur]);
    $this->postJson("/api/rooms/{$room->id}/announce", ['count' => 0])->assertOk();

    $this->travel(config('game.turn_seconds') + 1)->seconds();
    (new TurnTimeout($room->id, $seq))->handle(app(GameServiceContract::class));
    expect(state($room)['announcements'])->toHaveCount(1);
});

it("joue une partie complète uniquement avec l'IA (aucun coup refusé)", function () {
    $users = makeUsers(4);
    $room  = setupRoom($users);
    as_($users[0]);
    $this->postJson("/api/rooms/{$room->id}/dealer")->assertOk();

    $turns = 0;
    while (!Event::dispatched(GameOver::class)->count()) {
        expect(++$turns)->toBeLessThan(3000, 'la partie ne finit jamais');

        if (state($room)['phase'] === 'dealing') {
            dealAll($room, $users);
            continue;
        }

        $seq = state($room)['turnSeq'];
        expireTurn($room);
        // un coup refusé laisserait le tour inchangé
        $after = state($room);
        expect($after === [] || ($after['turnSeq'] ?? 0) > $seq || $after['phase'] === 'dealing')
            ->toBeTrue("l'IA n'a pas pu jouer (tour $seq)");
    }

    expect($room->fresh()->status->value)->toBe('finished');
});
