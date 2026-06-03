<script setup lang="ts">
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile, isTablet } = useBreakpoint()

defineProps<{
  value: number | string | null
  imageFace: string
  imageBack?: string
  shown?: boolean
  borderColor?: string | null
}>()
</script>

<template>
  <div class="indicator-start hover-3d group">
    <span
      v-if="shown"
      :class="borderColor ? `border ${borderColor}` : ''"
      class="indicator-item badge badge-neutral font-bold shadow-lg border-white/20 z-10 mr-2">
      {{ value === null ? '*' : value }}
    </span>

    <figure class="card-figure relative shadow-xl transition-transform duration-300 group-hover:shadow-2xl">
      <img
        :style="borderColor ? `border: 4px solid ${borderColor}` : ''"
        v-if="shown"
        :src="imageFace"
        :alt="String(value)"
        class="w-full h-auto block rounded-lg"
      />

      <img
        v-else-if="imageBack"
        :src="imageBack"
        alt="Card Back"
        class="w-full h-auto block rounded-lg shadow-inner"
      />

      <div v-else class="placeholder bg-neutral text-neutral-content flex items-center justify-center rounded-lg">
        Dos
      </div>
    </figure>
  </div>
</template>

<style scoped>
.card-figure {
  width: 18vmin;
  max-width: 120px;
  min-width: 50px;
  aspect-ratio: 2/3;
  margin: 0;
}

.hover-3d {
  perspective: 1000px;
}
</style>
