<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import HeroSection from '@/components/HeroSection.vue'
import VButton from '@/components/VButton.vue'

import orangeBG from '@/asset/bg.png'
import verticalDungeonRoomBG from '@/asset/verticalDungeon.png'
import onlyBushNoBg from '@/asset/onlyBushNoBg5.png'
</script>

<template>
  <AppNavbar />

  <main>
    <HeroSection :image="orangeBG" :parallax="true">
      <img
        :src="onlyBushNoBg"
        alt="" aria-hidden="true"
        class="pointer-events-none select-none absolute inset-x-0 bottom-0 w-full h-full"
        style="z-index:1; object-fit:cover; object-position:bottom"
      />

      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-black" style="z-index:2" />

      <div class="relative w-full min-h-screen flex items-center justify-start p-4 sm:p-8 md:p-16 -mt-24" style="z-index:3">
        <div class="flex flex-col items-center gap-4">
          <p class="font-luckiest text-[3rem] sm:text-[5rem] md:text-[6rem] text-white">Games Lobby</p>
          <span class="text-lg sm:text-xl md:text-2xl text-white py-4">La platforme de jeu en ligne</span>
          <VButton class="p-6 sm:p-7 md:p-8 rounded-lg">COMMENCER MAINTENANT</VButton>
        </div>
      </div>
    </HeroSection>

    <div class="relative bg-black">
      <HeroSection :image="verticalDungeonRoomBG" overlay-color="rgba(200, 100, 30, 0.45)">
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-gradient-to-b from-transparent to-black" />
        <div class="pointer-events-none absolute inset-x-0 top-0 h-48 md:h-96 bg-gradient-to-t from-transparent to-black" />
      </HeroSection>
    </div>
  </main>

  <AppFooter />
</template>
