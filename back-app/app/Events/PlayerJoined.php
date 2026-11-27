<?php
namespace App\Events;

use App\Events\Concerns\BroadcastsToLobby;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class PlayerJoined implements ShouldBroadcastNow
// class PlayerJoined implements ShouldBroadcastNow
{
    use BroadcastsToLobby;

    public function __construct(
        public readonly string $roomId,
        public readonly array  $player,  // id, firstname, lastname, isHost
    ) {}
}
