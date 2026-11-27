<?php
// app/Events/RoundScored.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class RoundScored implements ShouldBroadcastNow
// class RoundScored implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string $roomId,
        public readonly array  $results,
        // [{ id, announced, tricksWon, livesLost, livesRemaining }, ...]
    ) {}
}
