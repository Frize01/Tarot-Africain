<!-- <template>
  <div class="trick-area">
    <div class="fan-container" :style="fanStyle">
      <TransitionGroup name="card-pop">
        <div
          v-for="(play, index) in trick"a
          :key="play.playerId"
          class="trick-card"
          :style="cardStyle(index, play.playerId)"
          @click="activePlayerId = play.playerId"
        >
          <CardComponent
            :value="play.card.value"
            :imageFace="play.card.image"
            :shown="true"
          />
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CardComponent from '@/modules/components/GameCard.vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useOrientation } from '@/composables/useOrientation'

const props = defineProps<{
  trick: { playerId: string; card: any }[]
  players: any[]
  myId: string
  numPlayers: number
}>()

const { isMobile, isTablet } = useBreakpoint()
const { isLandscape } = useOrientation()

const activePlayerId = ref<string | null>(null)

function toggleSelect(playerId: string) {
  if (activePlayerId.value === playerId) {
    activePlayerId.value = null
  } else {
    activePlayerId.value = playerId
  }
}

const fanStyle = computed(() => {
  return {
    top: isLandscape.value ? 'calc(50% - 60px)' : '50%'
  }
})

const RADIUS = computed(() => {
  if (isMobile.value) {
    return isLandscape.value ? 150 : 120
  }
  if (isTablet.value) return 140
  return 150
})

const SCALE = computed(() => {
  if (isMobile.value) return 0.5
  if (isTablet.value) return 0.7
  return 0.8
})

const getRotation = (seatIndex: number) => {
  const seed = Math.sin(seatIndex + 1) * 10000
  return (seed - Math.floor(seed)) * 8 - 4
}

const getRelativeIndex = (playerId: string) => {
  if (!props.players || props.players.length === 0) return 0

  const myIndex = props.players.findIndex(p =>
    p && (p.id === props.myId || p.playerId === props.myId || p.userId === props.myId)
  )
  const targetIndex = props.players.findIndex(p =>
    p && (p.id === playerId || p.playerId === playerId || p.userId === playerId)
  )

  if (myIndex === -1 || targetIndex === -1) {
    console.warn(`[Trick] Position introuvable pour le joueur ${playerId}. MyIndex: ${myIndex}, TargetIndex: ${targetIndex}`)
    return 0
  }

  return (targetIndex - myIndex + props.numPlayers) % props.numPlayers
}

function cardStyle(i: number, playerId: string) {
  const relativeSeat = getRelativeIndex(playerId)

  const angleDeg = 90 + relativeSeat * (360 / props.numPlayers)
  const rad = (angleDeg * Math.PI) / 180

  const isActive = activePlayerId.value === playerId

  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translate(${Math.round(Math.cos(rad) * RADIUS.value)}px, ${Math.round(Math.sin(rad) * RADIUS.value)}px) rotate(${getRotation(relativeSeat)}deg)`,
    zIndex: isActive ? 999 : i + 1,
    scale: SCALE.value * (isActive ? 1.15 : 1),
    cursor: 'pointer',
    transition: 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), z-index 0s, scale 0.2s ease'
  }
}
</script>

<style scoped>
.trick-area {
  position: relative;
  width: 100%;
  height: 100%;
}

.fan-container {
  position: relative;
  width: 0;
  height: 0;
  left: 50%;
}

.trick-card {
  user-select: none;
}
</style> -->


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

const { isMobile } = useBreakpoint()

const radius = computed(() => (isMobile.value ? 70 : 100))

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
