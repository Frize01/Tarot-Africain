<script setup lang="ts">
import { useParallax } from '@/composables/useParallax'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  speed?: number
  direction?: 'up' | 'down'
  rootMargin?: string
}>(), {
  speed: 0.2,
  direction: 'up',
})

const { elRef } = useParallax({
  speed: () => props.speed,
  direction: () => props.direction,
  rootMargin: props.rootMargin,
})
</script>

<template>
  <div ref="elRef" class="parallax-layer" v-bind="$attrs">
    <slot />
  </div>
</template>

<style scoped>
.parallax-layer {
  will-change: transform;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}
</style>
