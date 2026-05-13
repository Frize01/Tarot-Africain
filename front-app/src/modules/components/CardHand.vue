<script setup lang="ts">
import { computed } from 'vue';
import GameCard from '@/modules/components/GameCard.vue';

interface Card {
  id: number
  value: number | '*'
  image: string
}

const props = defineProps<{
  cards: Card[]
  isMyTurn: boolean
}>()

const emit = defineEmits<{
  (e: 'play-card', card: Card): void
}>()

const sortedCards = computed(() => {
  const toSortNumber = (value: Card['value']) => (value === '*' ? -1 : value)

  return [...props.cards].sort((a, b) => {
    return toSortNumber(a.value) - toSortNumber(b.value)
  })
})

const getCardStyle = (index: number) => {
  const total = sortedCards.value.length;
  const middle = (total - 1) / 2;

  // Dans le Tarot Africain, on a souvent moins de cartes en main au fil des tours
  // On ajuste l'éventail pour qu'il reste centré et beau
  const anglePerCard = total > 10 ? 4 : 8;
  const rotation = (index - middle) * anglePerCard;
  const vOffset = Math.pow(Math.abs(index - middle), 2) * (total > 10 ? 2 : 4);

  return {
    transform: `rotate(${rotation}deg) translateY(${vOffset}px)`,
    marginLeft: index === 0 ? '0' : '-50px',
    zIndex: index
  };
};
</script>

<template>
  <div class="african-hand" :class="{ 'my-turn': isMyTurn }">
    <div class="cards-fan">
      <div
        v-for="(card, index) in sortedCards"
        :key="card.id"
        class="card-slot"
        :style="getCardStyle(index)"
      >
        <GameCard
          :value="card.value === '*' ? '*' : card.value"
          :imageFace="card.image"
          :shown="true"
          @click="isMyTurn && emit('play-card', card)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.african-hand {
  transition: opacity 0.3s;
}

.my-turn {
  filter: drop-shadow(0 0 15px rgba(66, 184, 131, 0.3));
}

.cards-fan {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 250px;
}

.card-slot {
  transition: all 0.25s ease-out;
  cursor: pointer;
}

.card-slot:hover {
  transform: translateY(-50px) scale(1.15) rotate(0deg) !important;
  /* z-index: 100 !important; */
  margin: 0 20px !important;
}
</style>
