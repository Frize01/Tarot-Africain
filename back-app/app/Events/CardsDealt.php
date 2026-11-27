<?php
// app/Events/CardsDealt.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class CardsDealt implements ShouldBroadcastNow
// class CardsDealt implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string $roomId,
        public readonly int    $cardsPerPlayer,
        // Pas les mains ici — chaque joueur fetch sa main via HTTP
        // pour ne pas exposer les cartes des autres
    ) {}
}
