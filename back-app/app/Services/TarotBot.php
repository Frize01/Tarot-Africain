<?php

// app/Services/TarotBot.php
namespace App\Services;

/**
 * IA à règles du Tarot Africain : décide à la place d'un joueur absent (minuteur expiré).
 * Classe pure (aucun accès cache/DB) → réutilisable pour de futurs bots et testable seule.
 *
 * Une carte = ['id' => int, 'value' => int|null, ...] ; value null = l'Excuse (0 ou 22 au choix).
 * Un pli   = [['playerId' => string, 'card' => carte, 'excuseValue' => 0|22|null], ...]
 */
class TarotBot
{
    private const MAX_VALUE = 21;

    // =========================================================================
    // Annonce
    // =========================================================================

    /**
     * Estime le nombre de plis que la main peut gagner.
     *
     * @param int      $opponents nombre d'adversaires encore en vie
     * @param int|null $forbidden valeur interdite (règle du dernier annonceur), null sinon
     */
    public function announce(array $hand, int $opponents, int $cardsPerPlayer, ?int $forbidden = null): int
    {
        $expected = collect($hand)->sum(fn($card) => $this->winChance($card, $opponents));

        $count = (int) round($expected);
        $count = max(0, min($cardsPerPlayer, $count));

        if ($forbidden !== null && $count === $forbidden) {
            // valeur autorisée la plus proche de l'estimation, dans les bornes
            $candidates = array_filter(
                [$count - 1, $count + 1],
                fn($c) => $c >= 0 && $c <= $cardsPerPlayer
            );
            usort($candidates, fn($a, $b) => abs($a - $expected) <=> abs($b - $expected));
            $count = $candidates[0];
        }

        return $count;
    }

    /**
     * Probabilité grossière qu'une carte remporte un pli contre $opponents cartes au hasard.
     * L'Excuse jouée à 22 gagne à coup sûr.
     */
    public function winChance(array $card, int $opponents): float
    {
        if ($card['value'] === null) {
            return 1.0;
        }

        // chance qu'un adversaire ait moins : (v - 1) cartes plus faibles sur les 21 autres
        $beatOne = ($card['value'] - 1) / self::MAX_VALUE;

        return $beatOne ** max(1, $opponents);
    }

    // =========================================================================
    // Jeu
    // =========================================================================

    /**
     * Choisit la carte à jouer.
     *
     * @param int $needed plis encore nécessaires pour tenir l'annonce (annoncés - gagnés)
     * @return array{cardId: int, excuseValue: int|null}
     */
    public function chooseCard(array $hand, array $trick, int $needed): array
    {
        $wantsTrick = $needed > 0;

        // L'Excuse prend la valeur qui sert l'objectif : 22 pour gagner, 0 pour perdre.
        $options = collect($hand)->map(fn($card) => [
            'card'  => $card,
            'value' => $card['value'] ?? ($wantsTrick ? 22 : 0),
        ]);

        $best = collect($trick)->max(fn($play) => $play['card']['value'] ?? ($play['excuseValue'] ?? 0));

        if ($best === null) {
            // on entame : fort si on a besoin de plis, faible sinon
            $pick = $wantsTrick
                ? $options->sortByDesc('value')->first()
                : $options->sortBy('value')->first();
        } elseif ($wantsTrick) {
            // la plus petite carte qui gagne, sinon on se défausse de la plus faible
            $pick = $options->filter(fn($o) => $o['value'] > $best)->sortBy('value')->first()
                ?? $options->sortBy('value')->first();
        } else {
            // la plus forte carte qui perd (garde les petites pour plus tard),
            // sinon on gagne forcément : autant sacrifier la plus forte
            $pick = $options->filter(fn($o) => $o['value'] < $best)->sortByDesc('value')->first()
                ?? $options->sortByDesc('value')->first();
        }

        return [
            'cardId'      => $pick['card']['id'],
            'excuseValue' => $pick['card']['value'] === null ? $pick['value'] : null,
        ];
    }
}
