<script setup lang="ts">

import { computed } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'

const props = withDefaults(
  defineProps<{
    image: string
    imageMobile?: string
    imageDesktop?: string
    minHeight?: string
  }>(),
  {
    minHeight: '100vh',
  }
)

const { isSmallScreen } = useBreakpoint()

const activeImage = computed(() => {
  if (isSmallScreen.value && props.imageMobile) {
    return props.imageMobile
  }
  if (!isSmallScreen.value && props.imageDesktop) {
    return props.imageDesktop
  }
  return props.image
})

</script>

<template>
  <section class="hero-section" :style="{ minHeight }">
    <img
      class="hero-img"
      :src="activeImage"
      alt=""
      aria-hidden="true"
    />
    <slot />
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>
