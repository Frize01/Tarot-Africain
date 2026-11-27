<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Enums\RoomStatus;

class Room extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = ['code', 'status', 'game_id','is_public'];

    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'status' => RoomStatus::class, // enum PHP
        'is_public' => 'boolean'
    ];

    // public function getRouteKeyName(): string
    // {
    //     return 'id';
    // }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'room_player')
            ->withPivot('position', 'is_ready', 'is_host')
            ->using(RoomPlayer::class);
    }

    public function gameState(): HasOne
    {
        return $this->hasOne(GameState::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(GameLog::class);
    }

    // Helpers
    public function alivePlayers(array $lives): \Illuminate\Support\Collection
    {
        return $this->players->filter(fn($p) => ($lives[$p->id] ?? 0) > 0)->values();
    }

    public function isHost(int|string $userId): bool
    {
        return $this->players()->where('user_id', $userId)->wherePivot('is_host', true)->exists();
    }

    public function isReady(): bool
    {
        return $this->players()->count() >= $this->game->min_players;
    }
}
