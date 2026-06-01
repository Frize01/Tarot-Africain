<script setup lang="ts">
import { computed } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useOrientation } from '@/composables/useOrientation'

const { isDesktop, isMobile, isTablet } = useBreakpoint()
const { isLandscape } = useOrientation()

// Tailles réajustées de manière cohérente
const cardWidth = computed(() => {
  if (isDesktop.value) return 95  // Desktop : Taille confortable
  if (isTablet.value) return 80   // Tablette : Plus petit que desktop pour laisser de la place au tapis
  if (isMobile.value) {
    return isLandscape.value ? 55 : 65
  }
  return 80
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

  // Limitation de l'angle pour éviter que les cartes se retournent sur les petits écrans
  const angleStep = count > 1 ? Math.min(40 / (count - 1), 10) : 0
  const startAngle = count > 1 ? -((count - 1) * angleStep) / 2 : 0

  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + i * angleStep
    return {
      id: i,
      rotation: angle,
      // Utilisation d'un offset basé sur la largeur de la carte pour rester proportionnel
      offsetY: (w * 1.3) * (1 - Math.cos((angle * Math.PI) / 180)),
      marginLeft: i > 0 ? `-${w * 0.60}px` : '0', // Chevauchement légèrement réduit (60%)
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
  transform: rotate(var(--rotation, 0deg)); /* Correction : 'rotate' seul n'est pas supporté partout sur les vieux navigateurs, préférez transform */
}

.card-back {
  position: relative;
  flex-shrink: 0;
  aspect-ratio: 2 / 3;
  background-color: #1e293b;
  border-radius: 6px;
  border: 1px solid rgb(255 255 255 / 0.2);
  transform-origin: bottom center;
  transition: transform 0.2s ease; /* Optionnel : rend le positionnement fluide */

  /* Sécurité absolue : Empêche la carte de dépasser une taille absurde sur les écrans bizarres */
  max-width: 12vw;
  max-height: 20vh;
}

.card-face {
  position: absolute;
  inset: 2px;
  border-radius: 4px;
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
