<script setup lang="ts">
withDefaults(
  defineProps<{
    image: string
    imageMobile?: string
    imageDesktop?: string
    minHeight?: string
    mobileBreakpoint?: string
  }>(),
  {
    minHeight: '100vh',
    mobileBreakpoint: '768px',
  }
)
</script>

<template>
  <section class="hero-section" :style="{ minHeight }">
    <picture class="hero-picture">
      <source
        v-if="imageMobile"
        :srcset="imageMobile"
        :media="`(max-width: ${mobileBreakpoint})`"
      />
      <source
        v-if="imageDesktop"
        :srcset="imageDesktop"
        :media="`(min-width: ${mobileBreakpoint})`"
      />
      <img
        class="hero-img"
        :src="image"
        alt=""
        aria-hidden="true"
      />
    </picture>

    <slot />
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.hero-picture {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>
