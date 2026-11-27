<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Contracts\GameServiceContract;
use App\Models\Game;
use App\Models\GameLog;
use Illuminate\Http\Request;

class TarotAfricainController extends Controller
{
    public function __construct(private readonly GameServiceContract $gameService) {}

    // Reprise après refresh : infos du salon + état de la partie vu par ce joueur.
    public function state(Request $request, Room $room) {
        $userId = (string) $request->user()->id;
        $room->load('players');

        if (!$room->players->contains('id', (int) $userId)) {
            return response()->json(['message' => "Vous ne faites pas partie de cette partie."], 403);
        }

        return response()->json([
            'room'  => [
                'id'      => $room->id,
                'code'    => $room->code,
                'status'  => $room->status,
                'players' => $room->players->sortBy(fn($u) => $u->pivot->position)->values()->map(fn($u) => [
                    'id'        => $u->id,
                    'firstname' => $u->firstname,
                    'lastname'  => $u->lastname,
                    'position'  => (int) $u->pivot->position,
                    'pivot'     => ['is_host' => (bool) $u->pivot->is_host],
                ]),
            ],
            'myId'  => (int) $userId,
            'state' => $this->gameService->playerView($room->id, $userId),
            // partie terminée : résultat final (l'état de jeu est supprimé au GameOver)
            'gameOver' => $room->status->value === 'finished'
                ? GameLog::where('room_id', $room->id)->where('action_type', 'game_over')->latest('id')->first()?->action_data
                : null,
        ]);
    }

    public function setDealer(Request $request, Room $room) {
        if (!$room->isHost($request->user()->id)) {
            return response()->json(['message' => 'Seul le host peut lancer la donne.'], 403);
        }

        $this->gameService->setDealer($room->id);
        return response()->json(['message' => 'Donneur initialisé']);
    }

    public function deal(Request $request, Room $room) {
        // Distribue les cartes et retourne la main du joueur qui a cliqué
        $hand = $this->gameService->deal($room->id, (string) $request->user()->id);
        return response()->json(['hand' => $hand]);
    }

    public function announce(Request $request, Room $room) {
        $request->validate(['count' => 'required|integer|min:0']);

        $success = $this->gameService->announce(
            $room->id,
            (string) $request->user()->id,
            $request->input('count')
        );

        if (!$success) {
            return response()->json(['message' => 'Annonce invalide (Règle du dernier ou pas votre tour)'], 400);
        }

        return response()->json(['message' => 'Annonce enregistrée']);
    }

    public function playCard(Request $request, Room $room) {
        $request->validate([
            'card_id' => 'required|integer',
            'excuse_value' => 'nullable|integer'
        ]);

        $this->gameService->playCard(
            $room->id,
            (string) $request->user()->id,
            $request->input('card_id'),
            $request->input('excuse_value')
        );

        return response()->json(['message' => 'Carte jouée']);
    }
}
