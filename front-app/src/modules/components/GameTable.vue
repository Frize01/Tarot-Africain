<template>
  <div class="table-environment">
    <div class="play-area">
      <slot name="discards" />
    </div>

    <div class="opponents-container">
      <div
        v-for="(seat, index) in currentSeats"
        :key="seat"
        class="opponent"
        :class="seat"
      >
        <slot :name="`player-${seat}`" :seatIndex="index">
          <OpponentHand
            :count="nbCardsPerPlayer"
            :cardWidth="cardWidth"
            :rotation="SEAT_ROTATIONS[seat]"
          />
        </slot>
      </div>
    </div>

    <div class="hand">
      <CardHand
        :cards="myHand"
        :isMyTurn="true"
        @play-card="card => $emit('play-card', card)"
      />
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Card } from '../tarot_africain/models/Card'
import CardHand from '@/modules/components/CardHand.vue'
import OpponentHand from '@/modules/components/OpponentHand.vue'

// ── Props & emits ──────────────────────────────────────────────
const props = defineProps<{
  numPlayers: number
  nbCardsPerPlayer: number
  myHand: Card[]
}>()

defineEmits<{ (e: 'play-card', card: Card): void }>()

// ── Responsive card width ──────────────────────────────────────
const BREAKPOINTS = [
  { maxWidth: 480, width: 50 },
  { maxWidth: 900, width: 60 },
] satisfies { maxWidth: number; width: number }[]
const CARD_WIDTH_DEFAULT = 80

const windowWidth = ref(window.innerWidth)
const onResize = () => { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const cardWidth = computed(() =>
  BREAKPOINTS.find(b => windowWidth.value < b.maxWidth)?.width ?? CARD_WIDTH_DEFAULT
)

// ── Seat layout ────────────────────────────────────────────────
const SEAT_CONFIGURATIONS: Record<number, string[]> = {
  2: ['seat-top'],
  3: ['seat-left', 'seat-right'],
  4: ['seat-left', 'seat-top', 'seat-right'],
  5: ['seat-left', 'seat-top-left', 'seat-top-right', 'seat-right'],
}

const SEAT_ROTATIONS: Record<string, string> = {
  'seat-top':       '180deg',
  'seat-top-left':  '180deg',
  'seat-top-right': '180deg',
  'seat-left':      '90deg',
  'seat-right':     '270deg',
}

const currentSeats = computed(() => SEAT_CONFIGURATIONS[props.numPlayers] ?? [])
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

.play-area {
  position: absolute;
  inset: 50% auto auto 50%;
  translate: -50% -50%;
  width: 180px;
  height: 140px;
  border: 1px dashed rgba(255 255 255 / 0.1);
}

.hand {
  position: absolute;
  bottom: -60px;
  left: 50%;
  translate: -50%;
  width: 100%;
  max-width: 550px;
  z-index: 20;
}

.opponents-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.opponent {
  position: absolute;
  pointer-events: auto;
}

/* positions */
.seat-top       { left: 50%; top: -2%;  translate: -50%; }
.seat-left      { left: -3%;  top: 50%; translate: 0 -50%; }
.seat-right     { right: -3%; top: 50%; translate: 0 -50%; }
.seat-top-left  { left: 22%; top: -2%; }
.seat-top-right { right: 22%; top: -2%; }

/* rotationer sur mobile (pas sur du mot) */
@media (max-width: 900px) and (orientation: portrait) {
  .table-environment {
    width: 100dvh;
    height: 100vw;
    position: absolute;
    inset: 50% auto auto 50%;
    translate: -50% -50%;
    rotate: 90deg;
  }
}
</style>
