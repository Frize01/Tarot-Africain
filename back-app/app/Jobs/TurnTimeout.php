<?php

// app/Jobs/TurnTimeout.php
namespace App\Jobs;

use App\Contracts\GameServiceContract;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

// Fin du minuteur d'un tour : si le joueur n'a toujours pas agi, l'IA joue à sa place.
// $turnSeq identifie le tour visé : si le joueur a joué entre-temps, le tour a changé et le job ne fait rien.
class TurnTimeout implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $roomId,
        public readonly int    $turnSeq,
    ) {}

    public function handle(GameServiceContract $game): void
    {
        $game->autoPlay($this->roomId, $this->turnSeq);
    }
}
