<?php
// app/Events/GameStarted.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToLobby;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class GameStarted implements ShouldBroadcastNow
// class GameStarted implements ShouldBroadcastNow
{
    use BroadcastsToLobby;

    public function __construct(
        public readonly string $roomId,
    ) {}
}
