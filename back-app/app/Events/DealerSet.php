<?php
// app/Events/DealerSet.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class DealerSet implements ShouldBroadcastNow
// class DealerSet implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string $roomId,
        public readonly int    $dealerIndex,
        public readonly int    $round,
        public readonly int    $nextPlayerIndex,
        // Ordre des joueurs côté serveur : les index ci-dessus s'y réfèrent.
        public readonly array  $playerIds = [],
    ) {}
}
