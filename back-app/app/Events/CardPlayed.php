<?php
// app/Events/CardPlayed.php
namespace App\Events;

use App\Events\Concerns\BroadcastsToGame;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class CardPlayed implements ShouldBroadcastNow
// class CardPlayed implements ShouldBroadcastNow
{
    use BroadcastsToGame;

    public function __construct(
        public readonly string $roomId,
        public readonly string $playerId,
        public readonly array  $card,           // id, name, value, image
        public readonly ?int   $excuseValue,    // 0 ou 22, null si pas l'excuse
        public readonly int    $nextPlayerIndex,
    ) {}
}
