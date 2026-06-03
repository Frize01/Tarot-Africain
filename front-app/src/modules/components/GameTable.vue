<template>

  <div class="table-environment">
    <div class="play-area">
      <TrickOnPlaying
        :trick="trick"
        :players="players"
        :myId="myId"
        :numPlayers="numPlayers"
      />
    </div>

    <div class="table-felt" :class="{ 'felt-mobile-landscape': isMobile && isLandscape }">
      <div class="felt-inner" />
    </div>

    <MyFelt :color="'#ffffff'" :lifePoints="10" :foldsMade="2" :foldsAnnounced="3" />

    <div class="opponents-container">
      <div
        v-for="({ seat, seatStyle, player }, index) in seatsWithPlayers"
        :key="seat"
      >
        <!-- opponent -->
        <div class="opponent" :style="seatStyle">
          <slot :name="`player-${seat}`" :seatIndex="index">
            <OpponentHand
              :count="player?.cardCount ?? nbCardsPerPlayer"
              :rotation="SEAT_ROTATIONS[seat]"
            />
          </slot>
        </div>

        <!-- avatar -->
        <div
          v-if="player"
          class="avatar-wrapper"
          :style="avatarLayout?.[seat] ?? {}"
        >
          <Avatar
            :name="player.name"
            :color="player.color"
            :size="'xl'"
            :lifePoints="player.lifePoints ?? 10"
            :foldsMade="player.foldsMade ?? undefined"
            :foldsAnnounced="player.foldsAnnounced ?? undefined"
            :imageUrl="player.imageUrl || 'https://randomuser.me/api/portraits/men/75.jpg'"
          />
        </div>
      </div>
    </div>

    <!-- player -->
    <div class="hand" :class="{ 'hand-mobile-landscape': isLandscape, 'is-my-turn': isMyTurn }">
      <CardHand
        :cards="myHand"
        :isMyTurn="isMyTurn"
        @play-card="card => $emit('play-card', card)"
      />
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { Card } from '../tarot_africain/models/Card'
import CardHand from '@/modules/components/CardHand.vue'
import OpponentHand from '@/modules/components/OpponentHand.vue'
import Avatar from '@/components/Avatar.vue'
import MyFelt from '@/modules/components/MyFelt.vue'
import TrickOnPlaying from '../tarot_africain/components/TrickOnPlaying.vue'

import { useOrientation } from '@/composables/useOrientation'
import { useSeatLayout } from '@/composables/useSeatLayout'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useAvatarLayout } from '@/composables/useAvatarLayout'

const { isMobile } = useBreakpoint()
const { isLandscape } = useOrientation()
const { threePlayerLayout, fourPlayerLayout, fivePlayerLayout } = useAvatarLayout()

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
  }[]
}>()

defineEmits<{ (e: 'play-card', card: Card): void }>()

const { seatsWithPlayers, SEAT_ROTATIONS } = useSeatLayout(
  toRef(props, 'numPlayers'),
  toRef(props, 'opponents')
)

const avatarLayout = computed(() => {
  switch (props.numPlayers) {
    case 3: return threePlayerLayout.value
    case 4: return fourPlayerLayout.value
    case 5: return fivePlayerLayout.value
    default: return fourPlayerLayout.value
  }
})

</script>

<style scoped>
.table-environment {
  position: relative;
  background: radial-gradient(circle, #1a3a2a 70%, #050505 100%);
  touch-action: none;
  overflow: hidden;
  width: 100vw;
  height: 100dvh;
}

/* .play-area {
  position: absolute;
  inset: 50% auto auto 50%;
  translate: -50% -50%;
  width: 180px;
  height: 140px;
  border: 1px dashed rgba(255 255 255 / 0.1);
  z-index: 30;
  pointer-events: auto;
} */

.play-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  width: 300px;
  height: 300px;
  pointer-events: none;
  z-index: 30;
}

.hand {
  position: absolute;
  bottom: -60px;
  left: 50%;
  translate: -50%;
  width: 100%;
  max-width: 550px;
  z-index: 20;
  transition: bottom 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hand.is-my-turn {
  bottom: -25px;
}

/* paysage */
.hand.hand-mobile-landscape {
  bottom: -120px;
}

.hand.hand-mobile-landscape.is-my-turn {
  bottom: -60px;
}

.opponents-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.opponent {
  position: absolute;
  pointer-events: auto;
  transform-origin: center center;
}

.avatar-wrapper {
  position: absolute;
  z-index: 10;
  pointer-events: auto;
}
</style>
