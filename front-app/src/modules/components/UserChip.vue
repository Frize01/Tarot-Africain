<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  username: string;
  avatar: string;
  isTurn: boolean;       // Est-ce son tour ?
  timeLeft: number;      // Temps restant en secondes
  totalTime: number;     // Temps total alloué (ex: 15s)
  score?: number;        // Optionnel : score ou jetons
}>();

// Calcule le pourcentage pour le cercle de progression CSS
const progress = computed(() => (props.timeLeft / props.totalTime) * 100);
const color = computed(() => {
  if (progress.value < 25) return '#e74c3c'; // Rouge si presque fini
  if (progress.value < 50) return '#f1c40f'; // Jaune
  return '#42b883'; // Vert
});
</script>

<template>
  <div class="player-container" :class="{ 'active-glow': isTurn }">
    <div class="avatar-ring">
      <svg v-if="isTurn" class="timer-svg" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="#333"
          stroke-width="5"
        />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          :stroke="color"
          stroke-width="5"
          stroke-dasharray="283"
          :stroke-dashoffset="283 - (283 * progress) / 100"
          stroke-linecap="round"
          class="progress-bar"
        />
      </svg>

      <img :src="avatar" class="avatar-img" :alt="username" />
    </div>

    <div class="player-info">
      <span class="username">{{ username }}</span>
      <span v-if="score !== undefined" class="score">{{ score }} pts</span>
    </div>
  </div>
</template>

<style scoped>
.player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  transition: all 0.3s ease;
}

.avatar-ring {
  position: relative;
  width: 80px;
  height: 80px;
}

.avatar-img {
  position: absolute;
  inset: 8px; /* Laisse de la place pour le timer */
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #222;
}

.timer-svg {
  position: absolute;
  top: 0; left: 0;
  transform: rotate(-90deg); /* Démarre en haut */
}

.progress-bar {
  transition: stroke-dashoffset 1s linear, stroke 0.3s;
}

.active-glow {
  transform: scale(1.05);
  filter: drop-shadow(0 0 10px rgba(66, 184, 131, 0.4));
}

.player-info {
  background: rgba(0,0,0,0.6);
  padding: 4px 12px;
  border-radius: 20px;
  margin-top: 8px;
  text-align: center;
  border: 1px solid #444;
}

.username { display: block; font-weight: bold; font-size: 0.9rem; color: white; }
.score { font-size: 0.8rem; color: #42b883; }
</style>
