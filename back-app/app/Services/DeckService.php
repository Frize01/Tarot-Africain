<?php

// app/Services/DeckService.php
namespace App\Services;

class DeckService
{
    public function fresh(): array
    {
        return collect(config('game.cards'))
            ->map(fn($c) => [
                'id'    => $c['id'],
                'name'  => $c['name'],
                'value' => $c['value'],
                'image' => $c['image'],
            ])
            ->shuffle()
            ->values()
            ->all();
    }

    public function deal(array $deck, array $players, int $cardsPerPlayer, array $lives): array
    {
        $hands    = collect($players)->mapWithKeys(fn($p) => [$p['id'] => []])->all();
        $shuffled = collect($deck)->shuffle();
        $alive    = collect($players)->filter(fn($p) => ($lives[$p['id']] ?? 0) > 0)->values();

        for ($i = 0; $i < $cardsPerPlayer; $i++) {
            foreach ($alive as $player) {
                $card = $shuffled->pop();
                if ($card) {
                    $hands[$player['id']][] = $card;
                }
            }
        }

        return $hands;
    }

    public function effectiveValue(array $card, ?int $excuseValue): int
    {
        // excuse : 0 ou 22
        $isExcuse = $card['value'] === null || $card['id'] === 0;
        return $isExcuse ? ($excuseValue ?? 0) : $card['value'];
    }

    public function resolveTrick(array $trick): string
    {
        $winner = collect($trick)->reduce(function ($best, $play) {
            if ($best === null) {
                return $play;
            }
            $bestVal = $this->effectiveValue($best['card'], $best['excuseValue'] ?? null);
            $playVal = $this->effectiveValue($play['card'], $play['excuseValue'] ?? null);
            return $playVal > $bestVal ? $play : $best;
        });

        return $winner['playerId'];
    }
}
