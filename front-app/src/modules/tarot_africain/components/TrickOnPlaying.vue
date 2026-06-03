<template>
  <div class="trick-container">
    <TransitionGroup name="pop">
      <div
        v-for="play in trick"
        :key="play.playerId"
        class="card-slot"
        :style="getSlotStyle(play.playerId)"
      >
        <CardComponent
          :value="play.card.value"
          :imageFace="play.card.image"
          :shown="true"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardComponent from '@/modules/components/GameCard.vue'
import { useBreakpoint } from '@/composables/useBreakpoint'

const props = defineProps<{
  trick: { playerId: string; card: any }[]
  players: any[]
  myId: string
  numPlayers: number
}>()

const { isMobile, isTablet } = useBreakpoint()

// const radius = computed(() => (isMobile.value|| isTablet.value ? 90 : 140))
const radius = computed(() => {
  if (isMobile.value) return 80
  if (isTablet.value) return 100
  return 140
})

const getRelativeIndex = (playerId: string) => {
  const myIdx = props.players.findIndex(p => p.id === props.myId)
  const targetIdx = props.players.findIndex(p => p.id === playerId)
  return (targetIdx - myIdx + props.numPlayers) % props.numPlayers
}

const getSlotStyle = (playerId: string) => {
  const index = getRelativeIndex(playerId)

  const angle = (index * (360 / props.numPlayers) + 90) * (Math.PI / 180)

  const x = Math.cos(angle) * radius.value
  const y = Math.sin(angle) * radius.value

  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${isMobile.value ? 0.6 : 0.8})`,
  }
}
</script>

<style scoped>
.trick-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-slot {
  position: absolute;
  left: 50%;
  top: 50%;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  will-change: transform;
}

/* Animation d'entrée des cartes */
.pop-enter-from {
  opacity: 0;
  scale: 0.2;
}
</style>
