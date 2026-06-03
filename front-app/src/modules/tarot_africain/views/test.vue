<template>
  <div
    class="table-environment env-safe-padding"
    :class="{ 'force-landscape': isMobile && isPortrait }"
  >
    <div class="flex flex-1 flex-row justify-between items-stretch p-6 min-h-0">

      <div class="flex flex-col justify-between items-center w-[12vmin] min-w-[75px] max-w-[110px] z-10">
        <Avatar v-for="opponent in leftOpponents"
          :class="{ 'grayscale opacity-50': !opponent.isAlive }"
          :key="opponent.id"
          :name="opponent.name"
          :color="opponent.color"
          :size="'xl'"
          :lifePoints="opponent.lifePoints ?? 10"
          :foldsMade="opponent.foldsMade ?? undefined"
          :foldsAnnounced="opponent.foldsAnnounced ?? undefined"
          :imageUrl="opponent.imageUrl"
          class="max-w-full scale-[0.85] origin-center"
        />
      </div>

      <div class="flex flex-1 flex-col justify-center items-center p-4">
        <TrickOnPlaying
          :trick="trick"
          :players="players"
          :myId="myId"
          :numPlayers="numPlayers"
        />
      </div>

      <div class="flex flex-col justify-between items-center w-[12vmin] min-w-[75px] max-w-[110px] z-10">
        <Avatar v-for="opponent in rightOpponents"
          :class="{ 'grayscale opacity-50': !opponent.isAlive }"
          :key="opponent.id"
          :name="opponent.name"
          :color="opponent.color"
          :size="'xl'"
          :lifePoints="opponent.lifePoints ?? 10"
          :foldsMade="opponent.foldsMade ?? undefined"
          :foldsAnnounced="opponent.foldsAnnounced ?? undefined"
          :imageUrl="opponent.imageUrl"
          class="max-w-full scale-[0.85] origin-center"
        />
      </div>
    </div>

    <div class="relative flex flex-col items-center justify-end h-[28dvh] max-h-[240px] w-full pb-4 z-20">
      <MyFelt
        class="absolute bottom-[15%] translate-y-1/2 shadow-2xl"
        :color="'#ffffff'"
        :lifePoints="me?.lives ?? 10"
        :foldsMade="me?.tricksWon ?? 0"
        :foldsAnnounced="me?.announced ?? 0"
      />

      <CardHand
        class="w-full flex justify-center"
        :cards="myHand"
        :isMyTurn="isMyTurn"
        @play-card="card => $emit('play-card', card)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '@/modules/tarot_africain/models/Card'
import CardHand from '@/modules/components/CardHand.vue'
import MyFelt from '@/modules/components/MyFelt.vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import Avatar from '@/components/Avatar.vue'
import TrickOnPlaying from '../components/TrickOnPlaying.vue'
import OpponentHand from '@/modules/components/OpponentHand.vue'

const { isMobile, isPortrait, isDesktop } = useBreakpoint()

const props = defineProps<{
  numPlayers: number
  nbCardsPerPlayer: number
  myHand: Card[]
  myColor?: string
  isMyTurn: boolean
  trick: { playerId: string; card: any }[]
  players: any[]
  myId: string
  opponents: {
    id: string
    name: string
    color: string
    cardCount: number
    lifePoints?: number
    foldsMade?: number
    foldsAnnounced?: number
    imageUrl?: string
    isAlive?: boolean
  }[]
}>()

defineEmits<{ (e: 'play-card', card: Card): void }>()

const leftOpponents = computed(() => {
  const half = Math.ceil(props.opponents.length / 2)
  return props.opponents.slice(0, half).reverse()
})

const rightOpponents = computed(() => {
  const half = Math.ceil(props.opponents.length / 2)
  return props.opponents.slice(half)
})

const me = computed(() => {
  return props.players.find(p => p.id === props.myId)
})
</script>

<style scoped>
.table-environment {
  display: flex;
  flex-direction: column;
  position: relative;
  background: radial-gradient(circle, #1a3a2a 70%, #050505 100%);
  touch-action: none;
  overflow: hidden;
  width: 100vw;
  height: 100dvh;
  transition: all 0.3s ease;
}

.env-safe-padding {
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

@media (orientation: portrait) {
  .force-landscape {
    width: 100dvh !important;
    height: 100vw !important;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    transform-origin: center center;
    --board-padding: 0.75rem;
  }
}

@media (max-width: 400px) {
  .opponents-column {
    width: 10vmin;
    min-width: 60px;
  }
  .responsive-avatar {
    transform: scale(0.7);
  }
}
</style>
