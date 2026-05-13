<script setup lang="ts">

import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import HeroSection from '@/components/HeroSection.vue'

import orangeBG from '@/asset/orangeBG.png'
import greenBG from '@/asset/greenBG.png'


</script>

<template>
  <AppNavbar />

  <main>
    <HeroSection :image="orangeBG" class="relative">
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-black/70"
      />
    </HeroSection>
    <HeroSection :image="greenBG" />
  </main>

  <AppFooter />
</template>
