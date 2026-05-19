  <script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import GameCard from '@/modules/components/GameCard.vue';
  import { Card } from '@/modules/tarot_africain/models/Card';

  const props = defineProps<{
    cards: Card[]
    isMyTurn: boolean
  }>()

  const emit = defineEmits<{
    (e: 'play-card', card: Card): void
  }>()

  const selectedCardId = ref<number | null>(null);

  watch(() => props.isMyTurn, (newVal) => {
    if (!newVal) selectedCardId.value = null;
  });

  const sortedCards = computed(() => {
    return [...props.cards].sort((a, b) => (a.value ?? -1) - (b.value ?? -1));
  });

  const handleCardClick = (card: Card) => {
    if (!props.isMyTurn) return;
    // const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const isMobile = true; // for testing on desktop

    if (isMobile) {
      if (selectedCardId.value === card.id) {
        emit('play-card', card);
        selectedCardId.value = null;
      } else {
        selectedCardId.value = card.id;
      }
    } else {
      emit('play-card', card);
    }
  };

  const getCardStyle = (index: number, cardId: number) => {
    // const total = sortedCards.value.length;
    const total = props.cards.length;
    const middle = (total - 1) / 2;
    const isSelected = selectedCardId.value === cardId;
    const anglePerCard = total > 15 ? 4 : 12;
    const rotation = (index - middle) * anglePerCard;

    if (isSelected) {
      return {
        transform: `translateY(-60px) scale(1.2) rotate(0deg)`,
        marginLeft: index === 0 ? '0' : '-50px',
        zIndex: index
      };
    }

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
        <!-- <div
          v-for="(card, index) in sortedCards"
          :key="card.id"
          class="card-slot"
          :style="getCardStyle(index, card.id)"
          :class="{ 'is-selected': selectedCardId === card.id }"
        > -->
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
    transition: opacity 0.3s;
    width: 100%;
  }

  .cards-fan {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 280px;
  }

  .card-slot {
    transition: all 0.25s ease-out;
    cursor: pointer;
  }

  @media (hover: hover) {
    .card-slot:hover:not(.is-selected) {
      transform: translateY(-50px) scale(1.15) rotate(0deg) !important;
      margin: 0 10px !important;
    }
  }

  .is-selected {
    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.4));
  }

  .my-turn {
    background: radial-gradient(50% 50% at 50% 100%, rgba(66, 184, 131, 0.1) 0%, transparent 100%);
  }
  </style>
