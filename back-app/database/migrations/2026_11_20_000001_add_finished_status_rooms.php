<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // 'finished' : partie terminée (GameOver) → un refresh ne doit pas relancer de partie.
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->enum('status', ['waiting', 'ready', 'starting', 'finished'])->default('waiting')->change();
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->enum('status', ['waiting', 'ready', 'starting'])->default('waiting')->change();
        });
    }
};
