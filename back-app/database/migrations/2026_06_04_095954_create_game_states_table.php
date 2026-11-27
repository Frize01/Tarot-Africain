<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_states', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('room_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('phase');          // dealing, announcing, playing, scoring
            $table->unsignedTinyInteger('round')->default(1);
            $table->json('lives');            // commun à tous les jeux
            $table->json('state');            // contenu libre selon le jeu
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_states');
    }
};
