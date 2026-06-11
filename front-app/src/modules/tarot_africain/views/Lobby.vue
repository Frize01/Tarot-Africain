<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GAMES_DATA } from '../data/games'
import { useLobbyStore } from '../stores/useLobbyStore'
import apiMethods from '@/api'

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import QrcodeVue from 'qrcode.vue'
import DungeonSection from '@/components/DungeonSection.vue'
import ReturnBtn from '@/components/ReturnBtn.vue'
import VButton from '@/components/VButton.vue'

const route = useRoute()
const router = useRouter()
const lobbyStore = useLobbyStore()

// code url
const roomCodeUrl = route.params.gameId as string
const qrUrl = ref(`${window.location.origin}/tarot_africain/lobby/${roomCodeUrl}`)

const game = GAMES_DATA['tarot_africain']

// id rooms
const makeRoomPublic = async () => {
  if (lobbyStore.roomId) {
    const response = await apiMethods.makeRoomPublic(lobbyStore.roomId)
    if (response.success) {
      alert("Le salon est désormais public !")
    } else {
      alert("Erreur : " + response.message)
    }
  } else {
    alert("Impossible de rendre public : ID de salon manquant.")
  }
}

// start
const handleStartGame = async () => {
  if (lobbyStore.roomId) {
    const response = await apiMethods.startTarotGame(lobbyStore.roomId)
    if (response.success) {
      // Sans Echo, on redirige manuellement celui qui clique sur le bouton
      router.push(`/tarot_africain/game/${roomCodeUrl}`)
    }
  }
}

onMounted(async () => {
  // TODO : faire un join
  // const response = await apiMethods.getRoomDetails(roomCodeUrl)
  // if (response.success) { lobbyStore.players = response.data.players }




  if (!lobbyStore.roomCode) {
    lobbyStore.roomCode = roomCodeUrl
  }
})
</script>

<template>
  <AppNavbar />
  <DungeonSection vignette>
    <div class="flex items-center justify-center px-4 mt-32">
      <div class="grid md:grid-cols-2 gap-8 max-w-4xl w-full items-stretch">

        <div class="bg-black/50 p-8 rounded-xl backdrop-blur-sm flex flex-col items-center justify-center text-center gap-6 border border-white/10 relative">
          <h2 class="text-2xl font-bold tracking-wider uppercase mt-8">
            Code : {{ roomCodeUrl }}
          </h2>
          <div class="p-3 bg-white rounded-lg shadow-xl">
            <QrcodeVue :value="qrUrl" :size="200" />
          </div>
          <p class="text-base font-medium text-gray-200 balance">
            Partagez ce QR code pour inviter vos amis !
          </p>

          <ReturnBtn route-name="TarotAfricain" class="absolute left-4 top-4 "/>

          <VButton @click="makeRoomPublic()" class="absolute right-4 top-4 ">
            Rendre publique
          </VButton>
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
                <span class="font-semibold text-white">{{ player.firstname }}</span>
                <span v-if="player.pivot?.is_host" class="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase">Host</span>
              </div>
            </div>

            <div v-for="i in (game.playerCount.max - lobbyStore.players.length)" :key="'empty-' + i"
                 class="flex items-center justify-center p-4 rounded-lg bg-black/30 border border-dashed border-white/20 text-gray-500 italic text-sm">
              En attente de connexion...
            </div>
          </div>

          <div class="mt-6">
            <VButton @click="handleStartGame" class="w-full">
              Lancer la partie
            </VButton>
          </div>
        </div>

      </div>
    </div>
  </DungeonSection>
  <AppFooter />
</template>
