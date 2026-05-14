<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    image: string
    minHeight?: string
    overlayColor?: string
    parallax?: boolean
  }>(),
  {
    minHeight: '100vh',
    overlayColor: 'transparent',
    parallax: false
  }
)
</script>

<template>
  <section
    class="relative w-full overflow-hidden"
    :style="{
      minHeight: props.minHeight,
      backgroundImage: `url(${props.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: props.parallax ? 'fixed' : 'scroll'
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
