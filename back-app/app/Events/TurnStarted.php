<?php
// app/Events/TurnStarted.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

// Début du minuteur d'un tour (annonce ou carte). Les horodatages sont en ms (horloge serveur) :
// le front corrige le décalage avec serverNow avant d'animer l'anneau.
class TurnStarted implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string $roomId,
        public readonly int    $currentPlayerIndex,
        public readonly int    $startsAt,   // début du décompte (après l'animation de fin de pli)
        public readonly int    $deadline,   // au-delà, l'IA joue à la place du joueur
        public readonly int    $serverNow,
    ) {}
}
