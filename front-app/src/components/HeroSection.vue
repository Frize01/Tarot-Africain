<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    image: string
    minHeight?: string
  }>(),
  {
    minHeight: '100vh'
  }
)
</script>

<template>
  <section
    class="w-full"
    :style="{
      minHeight: props.minHeight,
      backgroundImage: `url(${props.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }"
  >
    <slot />
  </section>
</template>
