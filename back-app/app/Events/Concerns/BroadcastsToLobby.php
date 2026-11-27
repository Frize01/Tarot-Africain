<?php
namespace App\Events\Concerns;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PresenceChannel;

trait BroadcastsToLobby
{
    public function broadcastOn(): PresenceChannel
    {
        // dd($this->roomId);
        return new PresenceChannel("lobby.{$this->roomId}");
    }

    public function broadcastAs(): string
    {
        return class_basename(static::class);
    }
}
