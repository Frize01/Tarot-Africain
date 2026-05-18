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
import VPopup from '@/components/VPopup.vue'

import dungeon from '@/asset/dungeon.png'

const route = useRoute()
const router = useRouter()

const gameId = computed(() => route.params.id as string)
const game = computed(() => GAMES_DATA[gameId.value] ?? null)

const playerOptions = computed(() => {
  if (!game.value) return []
  const min = game.value.playerCount.min
  const max = game.value.playerCount.max
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
})
const selectedPlayers = ref(playerOptions.value[0] ?? null)

const showPopupCreateRoom = ref(false)

</script>

<template>
  <AppNavbar />

  <main class="relative min-h-screen bg-black text-white">
    <HeroSection :image="dungeon" overlay-color="rgba(80, 20, 5, 0.6)">
      <div class="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />

      <div class="relative z-20 container mx-auto px-6 py-32">
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
          @create="showPopupCreateRoom = true"
          @joinCode="(code) => { console.log('Rejoindre avec code:', code) }"
          @joinRoom="(id) => { console.log('Rejoindre room ID:', id) }"
        />
      </div>
    </HeroSection>
  </main>

  <AppFooter />

  <VPopup :is-open="showPopupCreateRoom" @close="showPopupCreateRoom = false">
    <div class="text-left">
      <h2 class="font-luckiest text-2xl mb-4 text-orange-500">Créer une partie</h2>
      <div class="space-y-4">
        <p class="text-[10px] uppercase tracking-widest text-white/40">Nombre de joueurs :</p>
        <div class="flex gap-4">
          <label v-for="n in playerOptions" :key="n" class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="radio-players"
              class="radio radio-orange"
              :value="n"
              v-v-model="selectedPlayers"
            />
            <span class="text-sm">{{ n }}</span>
          </label>
        </div>
      </div>
    </div>
    <div class="mt-8 flex justify-end">
      <VButton
        class="!bg-orange-600 !px-8"
        @click="console.log('Créer une partie avec', selectedPlayers, 'joueurs'); showPopupCreateRoom = false"
      >
        Confirmer
      </VButton>
    </div>
  </VPopup>
</template>
