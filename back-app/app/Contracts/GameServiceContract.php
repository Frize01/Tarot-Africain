<?php

// app/Contracts/GameServiceContract.php
namespace App\Contracts;

interface GameServiceContract
{
    public function setDealer(string $roomId): void;
    public function deal(string $roomId, string $callerId): array;
    public function announce(string $roomId, string $playerId, int $count): bool;
    public function playCard(string $roomId, string $playerId, int $cardId, ?int $excuseValue): void;
    public function playerView(string $roomId, string $playerId): ?array;
    public function autoPlay(string $roomId, int $turnSeq): void;
}
