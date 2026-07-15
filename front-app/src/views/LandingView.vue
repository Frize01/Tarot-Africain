<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import AppNavbar from '@/components/AppNavbar.vue'
import VButton from '@/components/VButton.vue'
import ParallaxLayer from '@/components/ParallaxLayer.vue'
import DungeonSection from '@/components/DungeonSection.vue'
import CardGame from '@/components/CardGame.vue'

import bushCastle from '@/asset/bushCastle.webp'
import only_castle from '@/asset/only_castle.png'
import only_background from '@/asset/only_background.png'

import apiMethods from '@/api'

const games = ref([])

const getGames = async () => {
  try {
    const response = await apiMethods.getGames()
    games.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux :', error)
  }
}

const router = useRouter()

onMounted(() => {
  getGames()
})
</script>

<template>
  <AppNavbar />

  <main class="bg-black min-h-screen">
    <div class="relative h-screen w-full overflow-hidden">

      <ParallaxLayer :speed="0.2" direction="up" class="absolute inset-0 w-full h-full z-8">
        <img
          :src="only_background"
          alt="Arrière-plan"
          class="w-full h-full object-cover object-bottom"
        />
      </ParallaxLayer>

      <ParallaxLayer :speed="1" direction="up" class="absolute inset-0 w-full h-full z-10">
        <img
          :src="only_castle"
          alt="Château"
          class="w-full h-full object-cover object-bottom brightness-80"
        />
      </ParallaxLayer>

      <ParallaxLayer :speed="2.8" direction="up" class="absolute inset-0 w-full h-full z-12">
        <img
          :src="bushCastle"
          alt="Buissons premier plan"
          class="w-full h-full object-cover object-bottom brightness-50"
        />
        <div class="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-black" />
        <div class="absolute inset-x-0 top-full h-[30vh] bg-black" />
      </ParallaxLayer>

      <div
        class="relative z-10 flex min-h-screen w-full items-center justify-start px-4 sm:px-8 md:px-16 -mt-24"
      >
        <div class="flex flex-col items-center gap-4 mx-auto sm:mx-0">
          <h1 class="font-luckiest text-5xl sm:text-7xl md:text-8xl text-white text-center sm:text-left">
            Cartes sur Table
          </h1>
          <p class="text-lg sm:text-xl md:text-2xl text-white">
            La plateforme de jeu en ligne
          </p>
          <VButton class="mt-2 rounded-lg px-8 py-8 text-base" @click="router.push('test')">
            COMMENCER MAINTENANT
          </VButton>
        </div>
      </div>
    </div>

    <div class="relative z-30 w-full bg-black">
      <DungeonSection top-fade bottom-fade vignette>
        <div class="relative z-10 px-4 py-24 sm:px-8 md:px-16">
          <h2 class="font-luckiest mb-12 mt-12 text-center text-4xl text-white sm:text-5xl">
            Nos Jeux
          </h2>

          <div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
            <CardGame
              v-for="game in games"
              :key="game.id"
              :name="game.name"
              :description="game.description"
              :tags="game.tags"
              class="game-card"
              @click="router.push(`${game.url}/informations`)"
            />
          </div>
        </div>
      </DungeonSection>
    </div>
  </main>
</template>
