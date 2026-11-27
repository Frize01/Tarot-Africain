<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TarotAfricainController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Profil / sécurité
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/password', [ProfileController::class, 'updatePassword']);

    Route::post('/rooms', [RoomController::class, 'create']);
    Route::post('/rooms/{room}/open-room', [RoomController::class, 'makeRoomPublic']);
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);

    Route::post('/rooms/{room:code}/join', [RoomController::class, 'join']);
    Route::post('/rooms/{room}/start', [RoomController::class, 'start']);

    // Présence générique (réutilisable par tous les jeux) : away / retour
    Route::get('/rooms/{room}/presence', [RoomController::class, 'getPresence']);
    Route::post('/rooms/{room}/presence', [RoomController::class, 'setPresence']);
    Route::get('/rooms/{room:code}/state', [TarotAfricainController::class, 'state']);
    Route::post('/rooms/{room}/dealer', [TarotAfricainController::class, 'setDealer']);
    Route::post('/rooms/{room}/deal', [TarotAfricainController::class, 'deal']);
    Route::post('/rooms/{room}/announce', [TarotAfricainController::class, 'announce']);
    Route::post('/rooms/{room}/play', [TarotAfricainController::class, 'playCard']);
});




Route::get('/games', [GameController::class, 'getAllGames']);
Route::get('/games/{id}', [GameController::class, 'getGameDetails']);

// Route::get('/rooms/tarot_africain/available', [GameController::class, 'getAvailableAfricanTarotRooms']);
Route::get('/rooms/{game}/available-rooms/{room:id?}', [RoomController::class, 'getAvailableRooms']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/guest', [AuthController::class, 'guest']);
Route::post('/logout', [AuthController::class, 'logout']);
