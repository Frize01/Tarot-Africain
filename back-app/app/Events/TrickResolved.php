<?php
// app/Events/TrickResolved.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class TrickResolved implements ShouldBroadcastNow
// class TrickResolved implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string $roomId,
        public readonly string $winnerId,
        public readonly array  $trick,  // [{playerId, card}, ...]
    ) {}
}
