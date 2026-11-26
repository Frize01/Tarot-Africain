<script setup lang="ts">
import { computed } from 'vue'
import type { GameState } from '../game/types'

const props = defineProps<{ game: GameState; forbiddenBet: number | null }>()
const emit = defineEmits<{ bet: [n: number]; excuse: [v: 0 | 22]; restart: [] }>()

const me = computed(() => props.game.players[props.game.me])
const myTurn = computed(() => props.game.current === props.game.me)
const currentName = computed(() => props.game.players[props.game.current]?.name ?? '')

const status = computed(() => {
  const g = props.game
  switch (g.phase) {
    case 'dealing': return 'Distribution des cartes…'
    case 'betting': return myTurn.value ? 'À toi d’annoncer tes plis' : `${currentName.value} annonce…`
    case 'playing': return myTurn.value ? 'À toi de jouer' : `C’est à ${currentName.value} de jouer`
    case 'excuse': return myTurn.value ? 'Choisis la valeur de l’Excuse' : `${currentName.value} joue l’Excuse`
    case 'trickEnd': return `${g.players[g.lastTrickWinner ?? 0].name} remporte le pli`
    case 'roundEnd': return 'Fin de la manche'
    case 'gameOver': return 'Partie terminée'
    default: return ''
  }
})

const betOptions = computed(() => Array.from({ length: props.game.cardsPerRound + 1 }, (_, i) => i))
const totalBets = computed(() => props.game.players.reduce((s, p) => s + (p.bet ?? 0), 0))
</script>

<template>
  <div class="hud">
    <!-- Bandeau du tour -->
    <div class="turn-pill">
      <div class="round">MANCHE {{ game.round }} · {{ game.cardsPerRound }} CARTE{{ game.cardsPerRound > 1 ? 'S' : '' }}</div>
      <div class="status">{{ status }}</div>
    </div>

    <div v-if="game.blind && ['betting', 'playing'].includes(game.phase)" class="blind-tip">
      Manche à 1 carte : tu vois les cartes des autres… mais pas la tienne !
    </div>

    <!-- Annonces -->
    <transition name="rise">
      <div v-if="game.phase === 'betting' && myTurn" class="bet-panel">
        <div class="bet-title">Combien de plis vas-tu faire ?</div>
        <div class="bet-buttons">
          <button
            v-for="n in betOptions" :key="n"
            class="chip" :disabled="n === forbiddenBet"
            :title="n === forbiddenBet ? 'Interdit : le total des annonces ne peut pas égaler le nombre de cartes' : ''"
            @click="emit('bet', n)"
          >{{ n }}</button>
        </div>
        <div class="bet-sub">Total annoncé : {{ totalBets }} / {{ game.cardsPerRound }}</div>
      </div>
    </transition>

    <!-- Excuse -->
    <transition name="rise">
      <div v-if="game.phase === 'excuse' && myTurn" class="bet-panel">
        <div class="bet-title">★ L’Excuse vaut…</div>
        <div class="bet-buttons">
          <button class="chip wide" @click="emit('excuse', 0)">0 <small>(perd)</small></button>
          <button class="chip wide" @click="emit('excuse', 22)">22 <small>(gagne)</small></button>
        </div>
      </div>
    </transition>

    <!-- Résultats de manche -->
    <transition name="pop">
      <div v-if="game.phase === 'roundEnd'" class="modal">
        <div class="modal-title">Fin de la manche {{ game.round }}</div>
        <table>
          <tr><th></th><th>Pari</th><th>Plis</th><th>Vies</th></tr>
          <tr v-for="r in game.results" :key="r.player">
            <td><span class="dot" :style="{ background: game.players[r.player].color }" />{{ game.players[r.player].name }}</td>
            <td>{{ r.bet }}</td>
            <td>{{ r.tricks }}</td>
            <td :class="r.lost ? 'lost' : 'ok'">{{ r.lost ? `−${r.lost}` : '✓' }} <small>({{ game.players[r.player].lives }})</small></td>
          </tr>
        </table>
      </div>
    </transition>

    <transition name="pop">
      <div v-if="game.phase === 'gameOver'" class="modal">
        <div class="modal-title">
          {{ game.winner === game.me ? 'Victoire !' : `${game.players[game.winner ?? 0].name} gagne la partie` }}
        </div>
        <button class="chip wide" @click="emit('restart')">Rejouer</button>
      </div>
    </transition>

    <!-- Barre du joueur local -->
    <div class="me-bar">
      <div class="me-left">
        <div class="avatar" :style="{ background: me.color }">{{ me.name.slice(0, 2).toUpperCase() }}</div>
        <div>
          <div class="me-name">{{ me.name }} <span v-if="game.dealer === game.me" class="dealer">Donneur</span></div>
          <div class="hearts">
            <span v-for="i in 10" :key="i" :class="{ empty: i > me.lives }">♥</span>
          </div>
        </div>
      </div>
      <div class="me-stats">
        <div><small>PARI</small><b>{{ me.bet ?? '–' }}</b></div>
        <div><small>PLIS</small><b>{{ me.tricks }}</b></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hud {
  position: absolute; inset: 0; pointer-events: none;
  font-family: 'Poppins', 'Segoe UI', system-ui, sans-serif;
  color: #fff4dc;
}
.hud button { pointer-events: auto; font-family: inherit; }

.turn-pill {
  position: absolute; top: max(10px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
  padding: 6px 18px; text-align: center;
  background: linear-gradient(180deg, #4a2a16, #2e180b);
  border: 1.5px solid #d4a94e; border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
}
.round { font-size: 10px; letter-spacing: 2px; color: #d9b977; font-weight: 600; }
.status { font-size: 14px; font-weight: 700; }

.blind-tip {
  position: absolute; top: calc(max(10px, env(safe-area-inset-top)) + 58px); left: 50%; transform: translateX(-50%);
  font-size: 12px; padding: 4px 12px; border-radius: 12px;
  background: rgba(30, 90, 60, 0.85); border: 1px solid #7fd19a;
  white-space: nowrap;
}

.bet-panel {
  position: absolute; left: 50%; bottom: 96px; transform: translateX(-50%);
  padding: 12px 18px; text-align: center;
  background: linear-gradient(180deg, rgba(90, 22, 22, 0.95), rgba(60, 14, 14, 0.95));
  border: 1.5px solid #d4a94e; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.bet-title { font-weight: 700; margin-bottom: 8px; }
.bet-sub { font-size: 11px; opacity: 0.75; margin-top: 6px; }
.bet-buttons { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.chip {
  min-width: 44px; height: 44px; padding: 0 10px;
  border-radius: 22px; border: none;
  background: linear-gradient(180deg, #f3d88a, #c9a24a);
  color: #3a1c0c; font-size: 18px; font-weight: 800;
  cursor: pointer; box-shadow: 0 3px 0 #8a6a22;
  transition: transform 0.1s;
}
.chip:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 1px 0 #8a6a22; }
.chip:disabled { background: #5a4a3a; color: #9a8a7a; box-shadow: none; cursor: not-allowed; text-decoration: line-through; }
.chip.wide { padding: 0 18px; font-size: 16px; }
.chip small { font-size: 11px; font-weight: 600; opacity: 0.75; }

.modal {
  position: absolute; left: 50%; top: 45%; transform: translate(-50%, -50%);
  padding: 16px 22px; min-width: 260px; text-align: center;
  background: linear-gradient(180deg, #4a2a16, #2e180b);
  border: 1.5px solid #d4a94e; border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}
.modal-title { font-size: 18px; font-weight: 800; color: #f0cf7a; margin-bottom: 10px; }
table { border-collapse: collapse; width: 100%; font-size: 13px; }
th { font-size: 10px; letter-spacing: 1px; color: #d9b977; font-weight: 600; padding: 2px 8px; }
td { padding: 4px 8px; text-align: center; }
td:first-child { text-align: left; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
.lost { color: #ff8a7a; font-weight: 700; }
.ok { color: #8fe0a0; font-weight: 700; }

.me-bar {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 8px 18px calc(8px + env(safe-area-inset-bottom));
  display: flex; justify-content: space-between; align-items: center;
  background: linear-gradient(180deg, #5a1616, #3e0e0e);
  border-top: 2px solid #d4a94e;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.35);
}
.me-left { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 38px; height: 38px; border-radius: 50%;
  display: grid; place-items: center; font-weight: 700; color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}
.me-name { font-weight: 700; font-size: 14px; }
.dealer { font-size: 10px; background: #e9c46a; color: #3a1c0c; padding: 1px 6px; border-radius: 6px; margin-left: 4px; }
.hearts { color: #ff4d5e; font-size: 14px; letter-spacing: 1px; }
.hearts .empty { color: rgba(255, 255, 255, 0.18); }
.me-stats { display: flex; gap: 16px; }
.me-stats div { display: flex; flex-direction: column; align-items: center; line-height: 1.1; }
.me-stats small { font-size: 10px; letter-spacing: 1.5px; color: #d9b977; }
.me-stats b { font-size: 20px; }

.rise-enter-active, .rise-leave-active, .pop-enter-active, .pop-leave-active { transition: all 0.25s ease; }
.rise-enter-from, .rise-leave-to { opacity: 0; transform: translate(-50%, 16px); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }

@media (max-width: 820px) {
  .turn-pill { padding: 4px 12px; }
  .status { font-size: 12px; }
  .blind-tip { font-size: 10px; top: calc(max(10px, env(safe-area-inset-top)) + 46px); }
  .bet-panel { bottom: 78px; padding: 10px 12px; max-width: 92vw; }
  .chip { min-width: 40px; height: 40px; font-size: 16px; }
  .me-bar { padding: 6px 12px calc(6px + env(safe-area-inset-bottom)); }
  .hearts { font-size: 11px; }
  .avatar { width: 32px; height: 32px; font-size: 12px; }
}
</style>
