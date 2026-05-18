<script setup lang="ts">
withDefaults(
  defineProps<{
    image: string
    minHeight?: string
    overlayColor?: string
    parallax?: boolean
  }>(),
  {
    minHeight: '100vh',
    overlayColor: 'transparent',
    parallax: false,
  }
)
</script>

<template>
  <section class="hero-section" :style="{ minHeight }">
    <div
      class="hero-bg"
      :class="{ 'hero-bg--parallax': parallax }"
      :style="{ backgroundImage: `url(${image})` }"
    />

    <div
      v-if="overlayColor !== 'transparent'"
      class="hero-overlay"
      :style="{ backgroundColor: overlayColor }"
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

/* .hero-bg {
  position: absolute;
  inset: -20%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform;
  transition: transform 0.1s linear;
} */

@media (min-width: 1024px) {
  .hero-bg--parallax {
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: multiply;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-bg--parallax {
  inset: -5%;
}
</style>
