<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Game::create([
            'id' => 1,
            'name' => 'Tarot Africain',
            'slug' => 'tarot_africain',
            'min_players' => 3,
            'max_players' => 5,
            'url' => '/tarot_africain',
            'description' => 'Un jeu d’atouts pour 3 à 5 joueurs : annoncez vos plis, gérez vos vies et adaptez votre stratégie à chaque manche. Prédisez, bluffez, et restez le dernier en lice pour gagner la partie !'
        ]);


    }
}
