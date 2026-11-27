<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Contracts\GameServiceContract;
use App\Events\PlayerJoined;
use App\Events\GameStarted;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Game;
use Illuminate\Support\Facades\DB;
class RoomController extends Controller
{
    public function __construct(private readonly GameServiceContract $gameService) {}


    public function getAvailableRooms(Game $game, Room $room = null) {
        if ($room && $room->exists) {
            if ($room->game_id !== $game->id) {
                return response()->json(['message' => 'Cette salle n\'appartient pas à ce jeu'], 404);
            }

            return response()->json($room->load(['players', 'game']), 200);
        }

        $rooms = $game->rooms()
            ->where('is_public', true)
            ->where('status', 'waiting')
            ->with(['players', 'game'])
            ->get();

        return response()->json($rooms, 200);
    }

    public function makeRoomPublic(Request $request, Room $room) {
        if($room->status->value !== 'waiting') {
            return response()->json(['message' => 'Impossible de rendre la salle publique une fois la partie commencée'], 400);
        }
        // verifie que c'est le joueur host qui fait la requete
        $user = $request->user();
        $isHost = $room->players()->where('user_id', $user->id)->wherePivot('is_host', true)->exists();
        if (!$isHost) {
            return response()->json(['message' => 'Seul le host peut rendre la salle publique'], 403);
        }

        if($room->is_public) {
            return response()->json(['message' => 'La salle est déjà publique'], 400);
        }
        $room->update(['is_public' => true]);

        return response()->json(['message' => 'Salle rendue publique']);
    }

    public function create(Request $request) {
        $user = $request->user();

        DB::table('room_player')->where('user_id', $user->id)->delete();

        $room = Room::create([
            'code' => strtoupper(Str::random(6)),
            'status' => 'waiting',
            'game_id' => $request->input('game_id'),
            'is_public' => $request->boolean('is_public', false),
        ]);

        $room->players()->attach($user->id, [
            'position' => 0,
            'is_ready' => true,
            'is_host' => true
        ]);

        return response()->json($room->load('players'), 201);
    }

    public function join(Request $request, Room $room) {
        if ($room->status->value !== 'waiting') {
            return response()->json(['message' => 'Partie déjà commencée'], 400);
        }

        $user = $request->user();

        if ($room->players()->where('user_id', $user->id)->exists()) {
            return response()->json($room->load('players'));
        }

        DB::table('room_player')->where('user_id', $user->id)->delete();

        $room->players()->attach($user->id, [
            'position' => $room->players()->count(),
            'is_ready' => false,
            'is_host' => false
        ]);

        return response()->json($room->load('players'));
    }

    public function start(Request $request, Room $room) {
        if (!$room->isHost($request->user()->id)) {
            return response()->json(['message' => 'Seul le host peut lancer la partie.'], 403);
        }

        $room->loadMissing('game');
        if (!$room->isReady()) {
            return response()->json([
                'message' => "Il faut au moins {$room->game->min_players} joueurs pour lancer la partie.",
            ], 422);
        }

        $room->update(['status' => 'starting']);

        broadcast(new GameStarted($room->id));

        return response()->json(['message' => 'Le jeu commence !']);
    }

    public function destroy(Room $room, Request $request)
    {
        $user = $request->user();

        $isHost = $room->players()->where('user_id', $user->id)->wherePivot('is_host', true)->exists();
        if (!$isHost) {
            return response()->json(['message' => 'Seul le host peut détruire ce salon'], 403);
        }

        $room->players()->detach();
        $room->delete();

        return response()->json(['message' => 'Le salon a été fermé avec succès.']);
    }


}
