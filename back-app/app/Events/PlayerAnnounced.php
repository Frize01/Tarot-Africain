<?php
// app/Events/PlayerAnnounced.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class PlayerAnnounced implements ShouldBroadcastNow
// class PlayerAnnounced implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string $roomId,
        public readonly string $playerId,
        public readonly int    $count,
        public readonly int    $nextPlayerIndex,
    ) {}
}
