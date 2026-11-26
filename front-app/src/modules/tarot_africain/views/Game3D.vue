<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TarotTable3D from '../3d/components/TarotTable3D.vue'
import TarotHud from '../3d/components/TarotHud.vue'
import DevControlPanel from '../components/DevControlPanel.vue'
import { useTarotStoreGame } from '../3d/game/useStoreBridge'

const router = useRouter()

// Jeu réel (store + mockApi/Reverb) exposé au format GameState de la scène 3D
const game = useTarotStoreGame()
const { state, canPlay } = game

function onPlay(id: string) {
  game.playCard(state.me, id)
}

onMounted(() => game.init())
</script>

<template>
  <div class="game3d-wrapper">
    <button class="game3d-back" @click="router.push({ name: 'home' })">← Retour</button>

    <!-- Panneau dev : pilote les annonces / coups des autres joueurs (comme la vue 2D) -->
    <DevControlPanel />

    <template v-if="state.players.length">
      <TarotTable3D :game="state" :can-play="canPlay" @play="onPlay" />
      <TarotHud
        :game="state"
        :forbidden-bet="game.forbiddenBet.value"
        @bet="(n: number) => game.placeBet(state.me, n)"
        @excuse="game.chooseExcuse"
        @restart="() => {}"
      />
    </template>
  </div>
</template>

<style scoped>
.game3d-wrapper {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #0d0705;
}

.game3d-back {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  left: max(12px, env(safe-area-inset-left));
  z-index: 50;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: rgba(13, 7, 5, 0.6);
  color: #fff;
  font-family: 'Poppins', system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.game3d-back:hover {
  background: rgba(13, 7, 5, 0.85);
}
</style>
