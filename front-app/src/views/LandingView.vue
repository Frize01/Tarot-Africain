<!-- <script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'

import HeroSection from '@/components/HeroSection.vue'
import DungeonSection from '@/components/DungeonSection.vue'

import VButton from '@/components/VButton.vue'
import CardGame from '@/components/CardGame.vue'

import castle from '@/asset/castle.png'
import bushCastle from '@/asset/bushCastle.png'

import { useRouter } from 'vue-router'
const router = useRouter()


// TODO => replace fake data from games.ts
import { GAMES_DATA } from '../modules/tarot_africain/data/games'
const GAMES = Object.values(GAMES_DATA)

</script> -->

<!-- <template>
  <AppNavbar />

  <main> -->
    <!-- Chateau + Buisson -->
    <!-- <HeroSection :image="castle">
      <img
        :src="bushCastle"
        alt=""
        aria-hidden="true"
        class="absolute inset-x-0 bottom-0 w-full h-full object-cover object-bottom"
        style="z-index: 1" />


      <div
        class="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-black"
        style="z-index: 2"/>
      <div
        class="relative z-10 flex min-h-screen w-full items-center justify-start px-4 sm:px-8 md:px-16 -mt-24"
      >
        <div class="flex flex-col items-center gap-4">
          <h1 class="font-luckiest text-5xl sm:text-7xl md:text-8xl text-white">
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
    </HeroSection> -->

    <!-- Dungeon / Jeux -->
    <!-- <DungeonSection top-fade bottom-fade vignette>
      <div class="relative z-10 px-4 py-24 sm:px-8 md:px-16">
        <h2 class="font-luckiest mb-12 mt-12 text-center text-4xl text-white sm:text-5xl">
          Nos Jeux
        </h2>

        <div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
          <CardGame
            v-for="game in GAMES"
            :key="game.id"
            :title="game.title"
            :description="game.description"
            :tags="game.tags"
            class="game-card"
            @click="router.push({ name: game.routeName, params: { id: game.id } })"
          />
        </div>
      </div>
    </DungeonSection> -->
  <!-- </main>

  <AppFooter />
</template> -->


<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'

import AppNavbar from '@/components/AppNavbar.vue'
import VButton from '@/components/VButton.vue'
import ParallaxLayer from '@/components/ParallaxLayer.vue'
import DungeonSection from '@/components/DungeonSection.vue'
import CardGame from '@/components/CardGame.vue'
import castle2 from '@/asset/CASTLE_2.png'
import bushCastle from '@/asset/bushCastle.png'

// import { GAMES_DATA } from '../modules/tarot_africain/data/games'
// const GAMES = Object.values(GAMES_DATA)

import apiMethods from '@/api'
const games = ref([])

const getGames = async () => {
  try {
    const response = await apiMethods.getGames()
    console.log('Jeux récupérés :', response.data)
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

      <img
        :src="castle2"
        alt="Château arrière-plan"
        class="fixed inset-0 w-full h-full object-cover object-bottom z-0"
      />

      <ParallaxLayer :speed="0.3" direction="up" class="absolute inset-0 w-full h-full z-10">
        <img
          :src="bushCastle"
          alt="Buissons premier plan"
          class="w-full h-full object-cover object-bottom brightness-50"
        />
        <div class="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-black"/>

        <div class="absolute inset-x-0 top-full h-[30vh] bg-black" />
      </ParallaxLayer>

      <div class="relative z-20 flex min-h-screen w-full items-center justify-start px-4 sm:px-8 md:px-16 -mt-24">
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
