<script setup lang="ts">

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import HeroSection from '@/components/HeroSection.vue'

import orangeBG from '@/asset/orangeBG.png'

import dungeonRoomBG from '@/asset/dungeonRoomBG.webp'

</script>

<template>
  <AppNavbar />

  <main>
    <HeroSection :image="orangeBG" class="relative">
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-black"
      />

      <div class="w-full min-h-screen flex items-center justify-start p-4 sm:p-8 md:p-16">
        <p class="font-luckiest text-[3rem] sm:text-[4rem] md:text-[6rem] text-white">
          Games Lobby
        </p>
      </div>

    </HeroSection>

    <div class="relative bg-black">
      <HeroSection
        :image="dungeonRoomBG"
        overlay-color="rgba(200, 100, 30, 0.45)"
        class="bg-contain"
        style="aspect-ratio: 16/9; min-height: auto; background-position: right center;"
      >
        <div class="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-t from-transparent to-black" />
        <div class="pointer-events-none absolute inset-y-0 left-0 w-72 bg-gradient-to-r from-black to-transparent" />
      </HeroSection>
    </div>
  </main>

  <AppFooter />
</template>
