<template>
  <div class="cards-wrapper" :class="`position-${props.position}`">
    <div
      v-for="i in props.nbCards"
      :key="i"
      class="fanned-card"
      :style="getCardStyle(i - 1)"
    >
      <div class="card-back-placeholder"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Position = 'top' | 'left' | 'right' | 'top-left' | 'top-right'

const props = defineProps<{
  nbCards: number
  position?: Position
}>()

const getCardStyle = (index: number) => {
  const midIndex = (props.nbCards - 1) / 2
  const isVertical = props.position === 'left' || props.position === 'right'

  // Les cartes latérales se superposent verticalement, pas en éventail horizontal
  if (isVertical) {
    const offset = (index - midIndex) * 18 // décalage vertical entre cartes
    const rotation = (index - midIndex) * 5
    return {
      transform: `translateY(${offset}px) rotate(${rotation}deg)`,
      zIndex: index,
    }
  }

  // Cartes du haut : éventail normal
  const rotation = (index - midIndex) * 7
  return {
    transform: `rotate(${rotation}deg)`,
    zIndex: index,
  }
}
</script>

<style scoped>
.cards-wrapper {
  position: relative;
  width: 100px;
  height: 150px;
}

/* Rotation du groupe entier selon la position */
.position-left {
  transform: rotate(90deg);
}

.position-right {
  transform: rotate(-90deg);
}

/* top, top-left, top-right : éventail normal, retourné vers la table */
.position-top,
.position-top-left,
.position-top-right {
  transform: rotate(180deg);
}

.fanned-card {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: bottom center;
}

.card-back-placeholder {
  width: 100%;
  height: 100%;
  background: #8b4513;
  border: 3px solid #f5deb3;
  border-radius: 8px;
  box-shadow: -2px 2px 5px rgba(0, 0, 0, 0.3);
}
</style>
