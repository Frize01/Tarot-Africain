<template>
  <div class="table-environment">


    <MyFelt :color="'#ffffff'" :lifePoints="10" :foldsMade="2" :foldsAnnounced="3" />

  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { Card } from '../tarot_africain/models/Card'
import CardHand from '@/modules/components/CardHand.vue'
import OpponentHand from '@/modules/components/OpponentHand.vue'
import Avatar from '@/components/Avatar.vue'
import MyFelt from '@/modules/components/MyFelt.vue'


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

</style>
