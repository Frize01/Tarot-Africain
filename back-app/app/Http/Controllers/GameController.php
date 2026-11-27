<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Contracts\GameServiceContract;
use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function __construct(private readonly GameServiceContract $gameService) {}

    public function getAllGames() {
        $games = Game::with('tags')->get();
        return response()->json($games, 200);
    }

    public function getGameDetails($id) {
        $game = Game::with('tags')->find($id);
        if (!$game) {
            return response()->json(['message' => 'Jeu non trouvé'], 404);
        }
        return response()->json($game, 200);
    }

    // public function setDealer(Room $room) {
    //     $this->gameService->setDealer($room->id);
    //     return response()->json(['message' => 'Donneur initialisé']);
    // }

    // public function deal(Request $request, Room $room) {
    //     // Distribue les cartes et retourne la main du joueur qui a cliqué
    //     $hand = $this->gameService->deal($room->id, (string) $request->user()->id);
    //     return response()->json(['hand' => $hand]);
    // }

    // public function announce(Request $request, Room $room) {
    //     $request->validate(['count' => 'required|integer|min:0']);

    //     $success = $this->gameService->announce(
    //         $room->id,
    //         (string) $request->user()->id,
    //         $request->input('count')
    //     );

    //     if (!$success) {
    //         return response()->json(['message' => 'Annonce invalide (Règle du dernier ou pas votre tour)'], 400);
    //     }

    //     return response()->json(['message' => 'Annonce enregistrée']);
    // }

    // public function playCard(Request $request, Room $room) {
    //     $request->validate([
    //         'card_id' => 'required|integer',
    //         'excuse_value' => 'nullable|integer'
    //     ]);

    //     $this->gameService->playCard(
    //         $room->id,
    //         (string) $request->user()->id,
    //         $request->input('card_id'),
    //         $request->input('excuse_value')
    //     );

    //     return response()->json(['message' => 'Carte jouée']);
    // }
}
