<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import TarotTable3D from './components/TarotTable3D.vue'
import TarotHud from './components/TarotHud.vue'
import { useTarotGame } from './game/useTarotGame'

// Couleurs dans l'esprit de ton UI (bleu, rouge, …)
const game = useTarotGame([
  { name: 'Tom', color: '#29a8e0', isHuman: true },
  { name: 'Nadia', color: '#f0435f' },
  { name: 'Kofi', color: '#3fb56b' },
  { name: 'Awa', color: '#f29a2e' },
  { name: 'Yao', color: '#9b5de5' },
])
const { state } = game

const canPlay = computed(() => state.phase === 'playing' && state.current === state.me)

function onPlay(id: string) {
  game.playCard(state.me, id)
}

onMounted(() => game.start())
onBeforeUnmount(() => game.dispose())
</script>

<template>
  <div class="app">
    <TarotTable3D :game="state" :can-play="canPlay" @play="onPlay" />
    <TarotHud
      :game="state"
      :forbidden-bet="game.forbiddenBet.value"
      @bet="(n) => game.placeBet(state.me, n)"
      @excuse="game.chooseExcuse"
      @restart="game.start"
    />
  </div>
</template>

<style>
.app {
  position: fixed; inset: 0; overflow: hidden;
  background: #0d0705;
  user-select: none; -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
</style>
