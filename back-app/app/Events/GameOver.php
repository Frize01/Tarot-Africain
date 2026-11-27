<?php
// app/Events/GameOver.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class GameOver implements ShouldBroadcastNow
// class GameOver implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string  $roomId,
        public readonly ?string $winnerId,
        public readonly array   $survivors, // [playerId, ...]
    ) {}
}
