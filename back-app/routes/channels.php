<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Room;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// check si l'utilisateur fait parti de la room (=> vérif présence)
Broadcast::channel('table.{roomId}', function ($user, $roomId) {
    $isMember = Room::find($roomId)?->players()->where('user_id', $user->id)->exists();

    if (!$isMember) {
        return false;
    }

    return [
        'id'        => (string) $user->id,
        'firstname' => $user->firstname,
    ];
});

Broadcast::channel('lobby.{roomId}', function ($user, $roomId) {

    $room = Room::find($roomId);

    $member = $room?->players()->where('user_id', $user->id)->first();

    if (!$room || !$member) {
        return false;
    }

    return [
        'id' => $user->id,
        'firstname' => $user->firstname,
        'lastname' => $user->lastname,
        'isHost' => (bool) $member->pivot->is_host,
        // position : indispensable côté front pour ordonner les joueurs comme le back
        // (les index currentPlayerIndex/dealerIndex sont calculés sur les joueurs triés par position)
        'position' => (int) $member->pivot->position,
    ];
});
