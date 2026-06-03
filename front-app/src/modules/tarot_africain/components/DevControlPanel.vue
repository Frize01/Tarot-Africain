<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/useGameStore'
import { useLobbyStore } from '../stores/useLobbyStore'
import { api } from '@/api/mockApi'

const gameStore = useGameStore()
const lobbyStore = useLobbyStore()
const isCollapsed = ref(false)
const isFullscreen = ref(false)

const allPlayers = computed(() => gameStore.players)

const announce = async (playerId: string, count: number) => {
  await api.announce(lobbyStore.roomId, { playerId, count })
}

const playCard = async (playerId: string) => {
  const debugData = api._debugRoom(lobbyStore.roomId)
  const playerHand = debugData.game?.hands.get(playerId)

  if (playerHand && playerHand.length > 0) {
    const cardToPlay = playerHand[0]
    await api.playCard(
      lobbyStore.roomId,
      { playerId, cardId: cardToPlay.id }
    )
  }
}

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen()
    } catch (err: any) {
      console.error(`Erreur plein écran: ${err.message}`)
    }
  } else {
    document.exitFullscreen()
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] bg-slate-800">

    <button
      @click="toggleFullscreen"
      class="btn-fullscreen absolute top-0 right-12 w-12 h-12 flex items-center justify-center border-y border-l border-white/20 bg-slate-800/50 text-white/70 hover:text-white transition-colors"
      title="Mode Plein Écran"
    >
      <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
      </svg>
    </button>

    <button
      @click="isCollapsed = !isCollapsed"
      class="absolute top-0 right-0 w-12 h-12 flex items-center justify-center text-xl z-10 border border-white/20 bg-slate-800/50"
    >
      {{ isCollapsed ? 'D' : 'X' }}
    </button>

    <div v-if="!isCollapsed" class="p-4 flex flex-col h-full mt-12">
      <div class="flex items-center justify-between mb-4 border-b border-white pb-2 pt-2 pr-10 gap-2">
        <h4 class="font-bold uppercase text-xs">Dev mode</h4>
        <span class="bg-slate-500/10 text-[10px] text-white px-2 py-0.5 rounded border border-white">
          State: {{ gameStore.phase }}
        </span>
      </div>

      <div class="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <div
          v-for="player in allPlayers"
          :key="player.id"
          class="p-2 border transition-colors border-white"
        >
          <div class="flex justify-between items-center text-[11px] mb-1.5">
            <span class="flex items-center gap-1" :style="{ color: player.color }">
              {{ player.name }}
              <span v-if="player.id === lobbyStore.myId"> &lt;= </span>
            </span>
            <span class="text-gray-400">
              {{ player.announced !== null ? `Annonce: ${player.announced}` : '...' }}
            </span>
          </div>

          <div class="flex flex-wrap gap-3">
            <template v-if="gameStore.phase === 'announcing'">
              <button v-if="player.id !== lobbyStore.myId" class="bg-black p-1 rounded"
                v-for="n in (gameStore.cardsPerPlayer + 1)"
                :key="n-1"
                @click="announce(player.id, n-1)">
                {{ n-1 }}
              </button>
            </template>

            <template v-if="gameStore.phase === 'playing'">
              <button
                v-if="player.id === gameStore.currentPlayer?.id && gameStore.phase === 'playing'"
                @click="playCard(player.id)"
                class="w-full text-left px-2 py-1 bg-sky-600/10 hover:bg-sky-600 border border-sky-500/30 flex justify-between"
              >
                <span>Forcer l'action</span>
                <span class="text-[9px] opacity-60">Poser 1ère carte</span>
              </button>
            </template>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-2 text-white">
        Tour de : <span :style="{ color: gameStore.currentPlayer?.color }">{{ gameStore.currentPlayer?.name || '?' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* hide si fullscreen ou pwa */
@media (display-mode: fullscreen) or (display-mode: standalone) {
  .btn-fullscreen {
    display: none !important;
  }
}
</style>
