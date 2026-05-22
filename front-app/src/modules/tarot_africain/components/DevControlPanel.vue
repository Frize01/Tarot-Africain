<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../stores/useGameStore'
import { useLobbyStore } from '../stores/useLobbyStore'
import { api } from '@/api/mockApi'

const gameStore = useGameStore()
const lobbyStore = useLobbyStore()
const isCollapsed = ref(false)

const allPlayers = computed(() => gameStore.players)

const announce = async (playerId: string, count: number) => {
  await api.announce(lobbyStore.roomId, { playerId, count })
}

const playCard = async (playerId: string) => {
  const debugData = api._debugRoom(lobbyStore.roomId)
  const playerHand = debugData.game?.hands.get(playerId)
  // console.log(`Player ${playerId} hand:`, playerHand)

  if (playerHand && playerHand.length > 0) {
    const cardToPlay = playerHand[0]
    // console.log(`Player ${playerId} plays card:`, cardToPlay)
    await api.playCard(
      lobbyStore.roomId,
      { playerId, cardId: cardToPlay.id }
    )
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] bg-slate-800">
    <button
      @click="isCollapsed = !isCollapsed"
      class="absolute top-0 right-0 w-12 h-12 flex items-center justify-center text-xl z-10 border border-white/20"
    >
      {{ isCollapsed ? 'D' : 'X' }}
    </button>

    <div v-if="!isCollapsed" class="p-4 flex flex-col h-full">
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
            <span class="flex items-center gap-1"
              :style="{ color: player.color }">
              {{ player.name }}
              <span v-if="player.id === lobbyStore.myId">
                <=
              </span>
            </span>
            <span class="text-gray-400">
              {{ player.announced !== null ? `Annonce: ${player.announced}` : '...' }}
            </span>
          </div>

          <div class="flex flex-wrap gap-3">
            <template v-if="gameStore.phase === 'announcing'">

              <button v-if="player.id !== lobbyStore.myId"
                v-for="n in (gameStore.cardsPerPlayer + 1)"
                :key="n-1"
                @click="announce(player.id, n-1)">
                {{ n-1 }}
              </button>

            </template>

            <template v-if="gameStore.phase === 'playing'">
              <button v-if="player.id === gameStore.currentPlayer?.id"
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
