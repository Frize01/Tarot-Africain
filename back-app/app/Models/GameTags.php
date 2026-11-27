<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameTags extends Model
{
    protected $fillable = ['game_id', 'tag_id'];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }
}
