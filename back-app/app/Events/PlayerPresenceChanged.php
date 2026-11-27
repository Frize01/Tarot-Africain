<?php

namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

/**
 * Présence générique au niveau room (réutilisable par tous les jeux) :
 * un joueur a quitté l'écran de jeu (away = true) ou est revenu (away = false).
 * L'IA joue déjà ses tours via le timeout existant ; cet event sert à l'affichage
 * (icône IA sur sa plaque) chez les autres joueurs.
 */
class PlayerPresenceChanged implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string $roomId,
        public readonly string $playerId,
        public readonly bool   $away,
    ) {}
}
