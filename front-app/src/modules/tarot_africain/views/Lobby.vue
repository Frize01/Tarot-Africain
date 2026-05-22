<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GAMES_DATA } from '../data/games'
import { useLobbyStore } from '../stores/useLobbyStore'

import { api } from '@/api/mockApi'

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import QrcodeVue from 'qrcode.vue'
import DungeonSection from '@/components/DungeonSection.vue'
import ReturnBtn from '@/components/ReturnBtn.vue'
import VButton from '@/components/VButton.vue'

const route = useRoute()
const router = useRouter()
const lobbyStore = useLobbyStore()

const gameId = route.params.gameId as string
const qrUrl = ref(`${window.location.origin}/tarot_africain`)

const game = GAMES_DATA['tarot_africain']

const simulateJoin = () => {
  api.joinRoom(lobbyStore.roomId, {
    playerId: 'bot_' + Math.random().toString(36).substring(2, 5),
    name: 'player ' + (lobbyStore.players.length + 1),
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  })
}

onMounted(() => {
  if (!lobbyStore.roomId) {
    lobbyStore.bindEvents(gameId)
    lobbyStore.roomId = gameId
  }
})

lobbyStore.$subscribe((mutation, state) => {
  if (state.status === 'starting') {
    router.push(`/tarot_africain/game/${gameId}`)
  }
})

const handleStartGame = async () => {
  await lobbyStore.startGame()
}
</script>

<template>
  <AppNavbar />
  <DungeonSection vignette>
    <div class="flex items-center justify-center px-4 mt-32">

      <div class="grid md:grid-cols-2 gap-8 max-w-4xl w-full items-stretch">

        <div class="bg-black/50 p-8 rounded-xl backdrop-blur-sm flex flex-col items-center justify-center text-center gap-6 border border-white/10">
          <h2 class="text-2xl font-bold tracking-wider uppercase mt-8 sm:mt-0">
            Code : {{ gameId }}
          </h2>
          <div class="p-3 bg-white rounded-lg shadow-xl">
            <QrcodeVue :value="qrUrl" :size="200" />
          </div>
          <p class="text-base font-medium text-gray-200 balance">
            Partagez ce QR code pour inviter vos amis !<br />
            Ou utilisez le code pour rejoindre la partie depuis l'application.
          </p>
          <VButton @click="simulateJoin()">Simuler l'entrée</VButton>
          <ReturnBtn route-name="TarotAfricain" class="absolute left-4 top-4 "/>
        </div>

        <div class="bg-black/50 p-8 rounded-xl backdrop-blur-sm flex flex-col gap-4 border border-white/10">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-2xl font-bold tracking-wider uppercase">Joueurs</h2>
              <span class="bg-amber-500/20 text-sm font-bold px-3 py-1 rounded-full border border-amber-500/30">
                {{ lobbyStore.players.length }} / {{ game.playerCount.max }}
              </span>
            </div>

            <div class="space-y-3 flex-1 flex flex-col">
              <div v-for="player in lobbyStore.players" :key="player.id"
                  class="flex items-center justify-between p-4 rounded-lg bg-white/10 border border-white/20">
                <div class="flex items-center gap-3">
                  <div class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                  <span class="font-semibold" :style="{ color: player.color }">
                    {{ player.name }} {{ player.id === lobbyStore.myId ? '(Vous)' : '' }}
                  </span>
                  <span v-if="player.isHost" class="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase">Host</span>
                </div>
              </div>

              <div v-for="i in (game.playerCount.max - lobbyStore.players.length)" :key="'empty-' + i"
                  class="flex items-center justify-center p-4 rounded-lg bg-black/30 border border-dashed border-white/20 text-gray-500 italic text-sm">
                En attente d'un joueur...
              </div>
            </div>

            <!-- Bouton Lancer (visible uniquement par le host) -->
            <div v-if="lobbyStore.isHost" class="mt-6">
              <VButton
              @click="handleStartGame"
              :disabled="lobbyStore.players.length < 3"
              class="w-full"
            >
              {{ lobbyStore.players.length < 3 ? 'Attente de joueurs (min. 3)' : 'Lancer la partie' }}
            </VButton>
          </div>
        </div>

      </div>

    </div>
  </DungeonSection>
  <AppFooter />
</template>
