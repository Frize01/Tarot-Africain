<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    count?: number
    cardWidth?: number
    rotation?: string
  }>(),
  { count: 5, cardWidth: 45, rotation: '0deg' }
)

const cards = computed(() => {
  const { count, cardWidth: w } = props
  const angleStep = Math.min(40 / (count - 1), 12)
  const startAngle = -((count - 1) * angleStep) / 2

  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + i * angleStep
    return {
      id: i,
      rotation: angle,
      offsetY: 120 * (1 - Math.cos((angle * Math.PI) / 180)),
      marginLeft: i > 0 ? `-${w * 0.75}px` : '0',
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
  background: #450a0a; /* red-950 */
  border: 1px solid #d97706; /* amber-600 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-border {
  position: absolute;
  inset: 4px;
  border: 1px dashed rgb(180 130 30 / 0.5); /* amber-700/50 */
  border-radius: 2px;
}

</style>
