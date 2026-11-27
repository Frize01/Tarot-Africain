<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GameState extends Model
{
    protected $fillable = ['room_id', 'phase', 'round', 'lives', 'state'];

    protected $casts = [
        'lives' => 'array',
        'state' => 'array',
        'round' => 'integer',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    // Helpers pour ne pas manipuler le JSON brut partout

    public function getStateKey(string $key): mixed
    {
        return $this->state[$key] ?? null;
    }

    public function setStateKey(string $key, mixed $value): void
    {
        $state = $this->state ?? [];
        $state[$key] = $value;
        $this->state = $state;
    }

    public function getLife(string $userId): int
    {
        return $this->lives[$userId] ?? 0;
    }

    public function setLife(string $userId, int $value): void
    {
        $lives = $this->lives ?? [];
        $lives[$userId] = max(0, $value);
        $this->lives = $lives;
    }

    public function isAlive(string $userId): bool
    {
        return $this->getLife($userId) > 0;
    }
}
