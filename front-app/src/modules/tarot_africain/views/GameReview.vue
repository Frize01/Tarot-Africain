<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GAMES_DATA } from '../data/games'

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import HeroSection from '@/components/HeroSection.vue'
import VButton from '@/components/VButton.vue'
// import GameLeaderboard from '@/modules/components/Leaderboard.vue'
import RoomsAvailable from '@/modules/components/RoomsAvailable.vue'

import dungeon from '@/asset/dungeon.png'

const router = useRouter()

const props = defineProps<{ gameId: string }>()
const game = computed(() => GAMES_DATA[props.gameId])

function generationGameId(){
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function handleCreateRoom() {
  const newGameId = generationGameId()
  router.push(`/tarot_africain/lobby/${newGameId}`)
}

function handleJoinRoomWithCode(joinCode: string) {
  if (!joinCode) return
  const regex = /^[A-Z0-9]{6}$/
  let code = joinCode.trim().toUpperCase()
  if (!regex.test(code)) {
    alert('Code de salle invalide. Veuillez entrer un code à 6 caractères alphanumériques en majuscules.')
    return
  } else{
    router.push(`/tarot_africain/lobby/${code}`)
  }
}

function handleJoinPublicRoom(id: string) {
  router.push(`/tarot_africain/lobby/${id}`)
}

</script>

<template>
  <AppNavbar />

  <main class="relative min-h-screen bg-black text-white">
    <HeroSection :image="dungeon" overlay-color="rgba(80, 20, 5, 0.6)">
      <div class="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />

      <div class="relative z-20 container mx-auto px-6 md:px-12 lg:px-20 xl:px-32 py-32">
        <div v-if="!game" class="text-center py-20">
          <h1 class="font-luckiest text-5xl mb-6">Jeu introuvable</h1>
          <VButton @click="router.push('/')">Retour à l'accueil</VButton>
        </div>

        <div v-else class="grid lg:grid-cols-[1fr_320px] gap-12">
          <section>
            <p class="font-serif text-orange-700/60 tracking-[0.4em] text-xs mb-3 uppercase">ᚠ ᚨ ᚱ ᛏ ᛟ</p>
            <h1 class="font-luckiest text-6xl md:text-8xl leading-none drop-shadow-2xl">{{ game.title }}</h1>

            <div class="flex items-center gap-4 mt-6">
              <span v-for="tag in game.tags" :key="tag.title"
                class="px-3 py-1 rounded-full text-[10px] font-bold border border-white/20"
                :style="{ color: tag.color, backgroundColor: tag.color + '10' }">
                {{ tag.title }}
              </span>
            </div>

            <p class="mt-8 text-white/60 leading-relaxed italic max-w-xl">{{ game.description }}</p>

          </section>
        </div>

        <RoomsAvailable
          class="mt-16"
          :rooms="game.rooms"
          :gameId="gameId"
          @create="handleCreateRoom"
          @joinCode="handleJoinRoomWithCode"
          @joinRoom="handleJoinPublicRoom"
        />
      </div>
    </HeroSection>
  </main>

  <AppFooter />

</template>
