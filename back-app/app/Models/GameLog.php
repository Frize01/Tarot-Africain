<?php

// app/Models/GameLog.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameLog extends Model
{
    protected $table = 'logs';

    public $timestamps = false;

    protected $fillable = ['room_id', 'user_id', 'action_type', 'action_data', 'created_at'];

    protected $casts = [
        'action_data' => 'array'
    ];

    public static function record(string $roomId, string $userId, string $actionType, array $data = []): void
    {
        $id = is_numeric($userId) ? (int) $userId : null;

        self::create([
            'room_id' => $roomId,
            'user_id' => $id,
            'action_type' => $actionType,
            'action_data' => $data,
            'created_at' => now(),
        ]);
    }
}
