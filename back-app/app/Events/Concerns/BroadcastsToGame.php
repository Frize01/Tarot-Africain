<?php
// app/Events/Concerns/BroadcastsToGame.php
namespace App\Events\Concerns;

use Illuminate\Broadcasting\Channel;

trait BroadcastsToGame
{
    public function broadcastOn(): Channel
    {
        return new Channel("game.{$this->roomId}");
    }

    public function broadcastAs(): string
    {
        return class_basename(static::class);
    }
}
