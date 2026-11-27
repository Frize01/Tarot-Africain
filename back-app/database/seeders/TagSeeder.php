<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = ['Famille', 'Jeux de Cartes', 'Rapide', 'Stratégie', 'Ambiance', 'Compétitif', 'Coopératif', 'Party Game', 'Jeu de Rôle', 'Jeu de Plateau'];

        foreach ($tags as $tag) {
            \App\Models\Tag::create(['name' => $tag, 'color' => '#' . substr(md5($tag), 0, 6)]);
        }

        \App\Models\GameTags::create(['game_id' => 1,'tag_id' => 1,]);
        \App\Models\GameTags::create(['game_id' => 1,'tag_id' => 2,]);
        \App\Models\GameTags::create(['game_id' => 1,'tag_id' => 3,]);
    }
}
