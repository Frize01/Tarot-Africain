<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import GameCard from '@/modules/components/GameCard.vue';
import { Card } from '@/modules/tarot_africain/models/Card';
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile,isTablet } = useBreakpoint()

const props = defineProps<{
  cards: Card[]
  isMyTurn: boolean
  cardBorderColor?: string | null
}>()

const emit = defineEmits<{
  (e: 'play-card', card: Card): void
}>()

const selectedCardId = ref<number | null>(null);

watch(() => props.isMyTurn, (newVal) => {
  if (!newVal) selectedCardId.value = null;
});

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.card-slot')) {
    selectedCardId.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

const handleCardClick = (card: Card) => {
  if (!props.isMyTurn) return;

  if ((isMobile.value || isTablet.value) && props.cards.length !== 1) {
    if (selectedCardId.value === card.id) {
      emit('play-card', card);
      console.log('Played card:', card);
      selectedCardId.value = null;
    } else {
      selectedCardId.value = card.id;
    }
  } else {
    emit('play-card', card);
  }
};

const getCardStyle = (index: number, cardId: number) => {
  const total = props.cards.length;
  const middle = (total - 1) / 2;
  const isSelected = selectedCardId.value === cardId;
  const anglePerCard = total > 15 ? 4 : 12;
  const rotation = (index - middle) * anglePerCard;

  if (isSelected) {
    return {
      transform: `translateY(-70px) scale(1.1) rotate(0deg)`,
      marginLeft: index === 0 ? '0' : '-50px',
      zIndex: index
    };
  }

  const vOffset = Math.pow(Math.abs(index - middle), 2) * (total > 10 ? 2 : 4);

  return {
    transform: `rotate(${rotation}deg) translateY(${vOffset}px)`,
    marginLeft: index === 0 ? '0' : '-35px',
    zIndex: index
  };
};
</script>

<template>
  <div class="african-hand" :class="{ 'my-turn': isMyTurn }">
    <div class="cards-fan">
      <div
        v-for="(card, index) in props.cards"
        :key="card.id"
        class="card-slot"
        :style="getCardStyle(index, card.id)"
        :class="{ 'is-selected': selectedCardId === card.id }"
      >
        <GameCard
          :value="card.value"
          :imageFace="card.image"
          :shown="true"
          @click="handleCardClick(card)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.african-hand {
  width: 100%;
  display: flex;
  justify-content: center;

  transform: translateY(25px);
  opacity: 0.85;

  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease;
}

.african-hand.my-turn {
  transform: translateY(0);
  opacity: 1;
  background: radial-gradient(50% 50% at 50% 100%, rgba(66, 184, 131, 0.2) 0%, transparent 100%);
}

.cards-fan {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 20px;
}

.card-slot {
  transition: transform 0.25s ease-out, margin 0.25s ease-out;
  cursor: pointer;
}

@media (hover: hover) {
  .card-slot:hover:not(.is-selected) {
    transform: translateY(-50px) scale(1.15) rotate(0deg) !important;
    margin: 0 15px !important;
  }
}

.is-selected {
  filter: drop-shadow(0 15px 20px rgba(0, 0, 0, 0.4));
}
</style>
