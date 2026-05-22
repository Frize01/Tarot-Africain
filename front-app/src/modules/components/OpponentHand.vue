<script setup lang="ts">
import { computed } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useOrientation } from '@/composables/useOrientation'
const { isSmallScreen, isDesktop, isMobile } = useBreakpoint()
const { isLandscape } = useOrientation()

const cardWidth = computed(() => {
  if (isDesktop.value) return 120
  if (isMobile.value && isLandscape.value) return 60
  if (isLandscape.value) return 60
  if (isSmallScreen.value) return 60
  return 70
})

const props = withDefaults(
  defineProps<{
    count?: number
    rotation?: string
  }>(),
  { count: 5, rotation: '0deg' }
)

const cards = computed(() => {
  const { count } = props
  const w = cardWidth.value

  const angleStep = count > 1 ? Math.min(40 / (count - 1), 12) : 0
  const startAngle = count > 1 ? -((count - 1) * angleStep) / 2 : 0

  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + i * angleStep
    return {
      id: i,
      rotation: angle,
      offsetY: 120 * (1 - Math.cos((angle * Math.PI) / 180)),
      marginLeft: i > 0 ? `-${w * 0.65}px` : '0',
    }
  })
})
</script>

<template>
  <div class="hand-wrapper" :style="{ '--rotation': rotation }">
    <div
      v-for="card in cards"
      :key="card.id"
      class="card-back"
      :style="{
        width: `${cardWidth}px`,
        zIndex: card.id,
        marginLeft: card.marginLeft,
        transform: `rotate(${card.rotation}deg) translateY(${card.offsetY}px)`,
      }"
    >
      <div class="card-face">
        <div class="card-border" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hand-wrapper {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  rotate: var(--rotation, 0deg);
}

.card-back {
  position: relative;
  flex-shrink: 0;
  aspect-ratio: 2 / 3;
  background-color: #1e293b;
  border-radius: 4px;
  border: 1px solid rgb(255 255 255 / 0.2);
  transform-origin: bottom center;
}

.card-face {
  position: absolute;
  inset: 2px;
  border-radius: 3px;
  background: #450a0a;
  border: 1px solid #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-border {
  position: absolute;
  inset: 4px;
  border: 1px dashed rgb(180 130 30 / 0.5);
  border-radius: 2px;
}

</style>
