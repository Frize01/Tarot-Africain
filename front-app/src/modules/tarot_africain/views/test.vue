<script setup lang="ts">
// import { onMounted } from 'vue'
// import { useGameStore } from '../stores/useGameStore'

// const gameStore = useGameStore()

// import { useDeckStore } from '../stores/useDeckStore'
// const deckStore = useDeckStore()

// onMounted(() => {
//   gameStore.initGame([
//     { id: '1', name: 'Alice', color: 'red' },
//     { id: '2', name: 'Bob', color: 'blue' },
//     { id: '3', name: 'Charlie', color: 'green' },
//     { id: '4', name: 'Dave', color: 'yellow' },
//   ])
//   console.log('== INIT ==')
//   console.log('players', gameStore.players)
//   console.log('roundSequence', gameStore.roundSequence)
//   console.log('cardsPerPlayer', gameStore.cardsPerPlayer)
//   console.log('phase', gameStore.phase)

//   // Dealer
//   gameStore.setDealer(0)
//   console.log('== DEALER ==')
//   console.log('dealer', gameStore.dealer)
//   console.log('currentPlayer', gameStore.currentPlayer)

//   // Distribution
//   const hands = deckStore.deal(4, gameStore.cardsPerPlayer)
//   gameStore.dealCards(hands)
//   console.log('== DEAL ==')
//   console.log('hands', gameStore.players.map(p => ({ name: p.name, hand: p.hand })))
//   console.log('phase', gameStore.phase)

//   // Annonces
//   gameStore.announce('1', 1)
//   gameStore.announce('2', 2)
//   gameStore.announce('3', 1)
//   const ok = !gameStore.announce('4', 0)
//   console.log('== ANNONCES ==')
//   console.log('announce interdit ?', ok)
//   console.log('announced', gameStore.players.map(p => ({ name: p.name, announced: p.announced })))
//   console.log('phase', gameStore.phase)

//   // Jouer un pli complet
//   gameStore.players.forEach(p => {
//     const card = p.hand[0]
//     gameStore.playCard(p.id, card)
//   })
//   console.log('== PLI ==')
//   console.log('trickHistory', gameStore.trickHistory)
//   console.log('tricksWon', gameStore.players.map(p => ({ name: p.name, tricksWon: p.tricksWon })))

//   // Scoring
//   gameStore.applyScoring()
//   console.log('== SCORING ==')
//   console.log('lives', gameStore.players.map(p => ({ name: p.name, lives: p.lives })))
//   console.log('phase', gameStore.phase)
//   console.log('roundHistory', gameStore.roundHistory)
// })

import { GAMES_DATA } from '../data/games'


import { Card } from '@/modules/tarot_africain/models/Card'
import CardHand from '@/modules/components/CardHand.vue'
import GameTable from '@/modules/components/GameTable.vue'

import OpponentHand from '@/modules/components/OpponentHand.vue'

const cards=GAMES_DATA['tarot_africain'].cards

</script>

<template>
  <div class="bg-[#064e3b] text-black min-h-screen justify-center items-center">
    <h1 class="text-3xl font-bold text-center py-4 text-white">Test Tarot Africain</h1>
    <CardHand :cards="[cards[0], cards[1], cards[2], cards[3], cards[4],cards[5],cards[6],cards[7]]" :isMyTurn="true" @play-card="card => console.log('Played card:', card)" />
    <OpponentHand :nbCards="8" />
  </div>
</template>

