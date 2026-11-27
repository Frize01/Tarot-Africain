<?php
// app/Events/AllPlayersAnnounced.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class AllPlayersAnnounced implements ShouldBroadcastNow
// class AllPlayersAnnounced implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string $roomId,
        public readonly array  $announcements, // {"playerId": count}
    ) {}
}
