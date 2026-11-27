<?php

// app/Jobs/BroadcastNextDealer.php
namespace App\Jobs;

use App\Events\DealerSet;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class BroadcastNextDealer implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $roomId,
        public readonly int    $dealerIndex,
        public readonly int    $nextPlayerIndex,
        public readonly int    $round,
        public readonly array  $playerIds = [],
    ) {}

    public function handle(): void
    {
        broadcast(new DealerSet(
            $this->roomId,
            $this->dealerIndex,
            $this->round,
            $this->nextPlayerIndex,
            $this->playerIds,
        ));
    }
}
