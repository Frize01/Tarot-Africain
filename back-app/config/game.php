<?php

return [
    'config' => [
        2 => ['startCards' => 7, 'lives' => 10],
        3 => ['startCards' => 7, 'lives' => 10],
        4 => ['startCards' => 5, 'lives' => 10],
        5 => ['startCards' => 4, 'lives' => 10],
    ],

    // Minuteur de tour : au-delà, l'IA (TarotBot) joue à la place du joueur absent.
    'turn_seconds' => 20,
    // Pause d'affichage du pli terminé côté front avant que le gagnant ne rejoue.
    'trick_display_seconds' => 2,

    'cards' => [
        ['id' => 0, 'name' => "L'Excuse", 'value' => null, 'image' => '/tarot_card/0.jpg'],
        ['id' => 1, 'name' => 'Le Bateleur', 'value' => 1, 'image' => '/tarot_card/1.jpg'],
        ['id' => 2, 'name' => 'La Papesse', 'value' => 2, 'image' => '/tarot_card/2.jpg'],
        ['id' => 3, 'name' => "L'Impératrice", 'value' => 3, 'image' => '/tarot_card/3.jpg'],
        ['id' => 4, 'name' => "L'Empereur", 'value' => 4, 'image' => '/tarot_card/4.jpg'],
        ['id' => 5, 'name' => 'Le Pape', 'value' => 5, 'image' => '/tarot_card/5.jpg'],
        ['id' => 6, 'name' => "L'Amoureux", 'value' => 6, 'image' => '/tarot_card/6.jpg'],
        ['id' => 7, 'name' => 'Le Chariot', 'value' => 7, 'image' => '/tarot_card/7.jpg'],
        ['id' => 8, 'name' => 'La Justice', 'value' => 8, 'image' => '/tarot_card/8.jpg'],
        ['id' => 9, 'name' => "L'Ermite", 'value' => 9, 'image' => '/tarot_card/9.jpg'],
        ['id' => 10, 'name' => 'La Roue de Fortune', 'value' => 10, 'image' => '/tarot_card/10.jpg'],
        ['id' => 11, 'name' => 'La Force', 'value' => 11, 'image' => '/tarot_card/11.jpg'],
        ['id' => 12, 'name' => 'Le Pendu', 'value' => 12, 'image' => '/tarot_card/12.jpg'],
        ['id' => 13, 'name' => 'La Mort', 'value' => 13, 'image' => '/tarot_card/13.jpg'],
        ['id' => 14, 'name' => 'La Tempérance', 'value' => 14, 'image' => '/tarot_card/14.jpg'],
        ['id' => 15, 'name' => 'Le Diable', 'value' => 15, 'image' => '/tarot_card/15.jpg'],
        ['id' => 16, 'name' => 'La Maison Dieu', 'value' => 16, 'image' => '/tarot_card/16.jpg'],
        ['id' => 17, 'name' => "L'Étoile", 'value' => 17, 'image' => '/tarot_card/17.jpg'],
        ['id' => 18, 'name' => 'La Lune', 'value' => 18, 'image' => '/tarot_card/18.jpg'],
        ['id' => 19, 'name' => 'Le Soleil', 'value' => 19, 'image' => '/tarot_card/19.jpg'],
        ['id' => 20, 'name' => 'Le Jugement', 'value' => 20, 'image' => '/tarot_card/20.jpg'],
        ['id' => 21, 'name' => 'Le Monde', 'value' => 21, 'image' => '/tarot_card/21.jpg'],
    ],
];
