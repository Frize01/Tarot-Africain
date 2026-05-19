
<script setup lang="ts">
import HeroSection from '@/components/HeroSection.vue'
import dungeon from '@/asset/dungeon.png'
import dungeon_large from '@/asset/dungeon_large.png'
import dungeon_small from '@/asset/dungeon_small.png'

withDefaults(
  defineProps<{
    topFade?: boolean
    bottomFade?: boolean
    vignette?: boolean
  }>(),
  {
    topFade: false,
    bottomFade: false,
    vignette: false,
  }
)
</script>

<template>
  <HeroSection
    :image="dungeon"
    :image-mobile="dungeon_small"
    :image-desktop="dungeon_large"
    overlay-color="rgba(80, 20, 5, 0.6)">

    <!-- Shadow-->
    <div v-if="topFade" class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent" />
    <div v-if="bottomFade" class="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black to-transparent" />

    <div
      v-if="vignette"
      class="pointer-events-none absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,1)]"
      style="z-index: 20"
    />
    <slot />
  </HeroSection>
</template>
