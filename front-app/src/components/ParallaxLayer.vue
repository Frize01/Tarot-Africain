<script setup lang="ts">
import { useParallax } from '@/composables/useParallax'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Vitesse du calque : 0 = statique, plus la valeur est haute plus ça bouge */
    speed?: number
    /** Sens du mouvement par rapport au scroll */
    direction?: 'up' | 'down'
    /** rootMargin de l'IntersectionObserver interne */
    rootMargin?: string
    /** Coupe l'effet (ex: sur mobile via une prop calculée en amont) */
    disabled?: boolean
  }>(),
  {
    speed: 0.2,
    direction: 'up',
    disabled: false,
  }
)

const { elRef } = useParallax({
  speed: () => props.speed,
  direction: () => props.direction,
  rootMargin: props.rootMargin,
  enabled: () => !props.disabled,
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
