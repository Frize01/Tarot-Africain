<?php

// Tests de l'IA à règles (TarotBot) : classe pure, pas de base ni de cache.

use App\Services\TarotBot;

function card(int $id, ?int $value = null): array
{
    return ['id' => $id, 'value' => $id === 0 ? null : ($value ?? $id)];
}

function play(string $playerId, array $card, ?int $excuseValue = null): array
{
    return ['playerId' => $playerId, 'card' => $card, 'excuseValue' => $excuseValue];
}

// ── Annonce ─────────────────────────────────────────────────────────────────

it('annonce peu avec des petites cartes et beaucoup avec des grosses', function () {
    $bot = new TarotBot();
    expect($bot->announce([card(1), card(2), card(3)], 2, 3))->toBe(0)
        ->and($bot->announce([card(21), card(20), card(0)], 2, 3))->toBe(3);
});

it("compte l'excuse comme un pli gagné", function () {
    expect((new TarotBot())->announce([card(0)], 4, 1))->toBe(1);
});

it('est plus prudent quand il y a plus d’adversaires', function () {
    $bot  = new TarotBot();
    $hand = [card(15), card(16), card(14), card(13)];
    expect($bot->announce($hand, 1, 4))->toBeGreaterThan($bot->announce($hand, 4, 4));
});

it("respecte la règle du dernier annonceur (valeur interdite)", function () {
    $bot  = new TarotBot();
    $hand = [card(1), card(2), card(3)];
    expect($bot->announce($hand, 2, 3))->toBe(0)
        ->and($bot->announce($hand, 2, 3, forbidden: 0))->toBe(1);
});

it('reste dans les bornes 0..cartes', function () {
    $bot = new TarotBot();
    foreach (range(0, 3) as $forbidden) {
        $count = $bot->announce([card(21), card(20), card(19)], 1, 3, $forbidden);
        expect($count)->toBeGreaterThanOrEqual(0)->toBeLessThanOrEqual(3)->not->toBe($forbidden);
    }
});

// ── Jeu ─────────────────────────────────────────────────────────────────────

it("entame fort quand il lui faut des plis, faible sinon", function () {
    $bot  = new TarotBot();
    $hand = [card(5), card(18), card(10)];
    expect($bot->chooseCard($hand, [], 1)['cardId'])->toBe(18)
        ->and($bot->chooseCard($hand, [], 0)['cardId'])->toBe(5);
});

it('gagne avec la plus petite carte suffisante quand il lui faut un pli', function () {
    $hand = [card(5), card(18), card(13)];
    expect((new TarotBot())->chooseCard($hand, [play('a', card(12))], 1)['cardId'])->toBe(13);
});

it('se défausse de la plus faible quand il ne peut pas gagner', function () {
    $hand = [card(5), card(3), card(8)];
    expect((new TarotBot())->chooseCard($hand, [play('a', card(20))], 1)['cardId'])->toBe(3);
});

it('perd avec la plus forte carte possible quand il a son compte', function () {
    $hand = [card(5), card(18), card(11)];
    expect((new TarotBot())->chooseCard($hand, [play('a', card(12))], 0)['cardId'])->toBe(11);
});

it('sacrifie la plus forte quand il gagne forcément', function () {
    $hand = [card(15), card(18), card(16)];
    expect((new TarotBot())->chooseCard($hand, [play('a', card(4))], 0)['cardId'])->toBe(18);
});

it("joue l'excuse à 22 pour gagner et à 0 pour perdre", function () {
    $bot  = new TarotBot();
    $hand = [card(0), card(2)];

    expect($bot->chooseCard($hand, [play('a', card(21))], 1))->toBe(['cardId' => 0, 'excuseValue' => 22])
        ->and($bot->chooseCard([card(0), card(19)], [play('a', card(20))], 0))->toBe(['cardId' => 19, 'excuseValue' => null])
        ->and($bot->chooseCard([card(0), card(21)], [play('a', card(20))], 0))->toBe(['cardId' => 0, 'excuseValue' => 0]);
});

it("tient compte d'une excuse adverse jouée à 22", function () {
    $hand = [card(21), card(3)];
    // rien ne bat l'excuse à 22 : il se défausse du 3
    expect((new TarotBot())->chooseCard($hand, [play('a', card(0), 22)], 1)['cardId'])->toBe(3);
});
