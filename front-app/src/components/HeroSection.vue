<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    image: string
    minHeight?: string
    overlayColor?: string
  }>(),
  {
    minHeight: '100vh',
    overlayColor: 'transparent'
  }
)
</script>

<template>
  <section
    class="relative w-full"
    :style="{
      minHeight: props.minHeight,
      backgroundImage: `url(${props.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }"
  >
    <div
      v-if="overlayColor !== 'transparent'"
      class="pointer-events-none absolute inset-0"
      :style="{
        backgroundColor: props.overlayColor,
        mixBlendMode: 'multiply'
      }"
    />
    <slot />
  </section>
</template>
