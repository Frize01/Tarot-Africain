<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    protected $fillable = ['name','slug', 'min_players', 'max_players', 'url','description'];

    // public function getRouteKeyName(): string
    // {
    //     return 'slug';
    // }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'game_tags');
    }
}
