<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useGameStore, type GamePlayer } from '../stores/useGameStore'
import { useLobbyStore } from '../stores/useLobbyStore'
import { Card } from '../models/Card'
import apiMethods from '@/api'

import Test from './Test.vue'
import Deal from '../components/Deal.vue'
import VButton from '@/components/VButton.vue'

const router = useRouter()
const toast = useToast()
const gameStore = useGameStore()
const lobbyStore = useLobbyStore()
const errorMessage = ref('')

// Palette de secours : le back ne fournit pas encore de couleur/avatar par joueur.
const FALLBACK_COLORS = ['#38bdf8', '#f43f5e', '#10b981', '#fbbf24', '#8b5cf6']

// ids uniformisés en string : le back renvoie des playerId string, on aligne tout le front dessus
const myId = computed(() => String(lobbyStore.myId ?? ''))

const me = computed(() => gameStore.players.find(p => p.id === myId.value))
const myHand = computed(() => me.value?.hand.filter((c): c is Card => c !== null) || [])
const isMyTurn = computed(() => gameStore.currentPlayer?.id === myId.value)
// On ne peut cliquer une carte que pendant la phase de jeu (pas pendant les annonces
// ni pendant l'animation de résolution du pli).
const canPlayCard = computed(() => isMyTurn.value && gameStore.phase === 'playing')

const forbiddenAnnounceValue = computed(() => {

  const alive = gameStore.players.filter(p => p.isAlive)
  const playersWhoAnnounced = alive.filter(p => p.announced !== null)
  const isLastPlayer = playersWhoAnnounced.length === alive.length - 1

  if (isLastPlayer && isMyTurn.value) {
    const currentTotal = gameStore.players.reduce((sum, p) => sum + (p.announced || 0), 0)
    return gameStore.cardsPerPlayer - currentTotal
  }
  return -1
})

const opponents = computed(() => {
  // fix bug order opponents/view
  const allPlayers = gameStore.players
  const myIndex = allPlayers.findIndex(p => p.id === myId.value)
  const total = allPlayers.length

  const ordered: GamePlayer[] = []
  for (let i = 1; i < total; i++) {
    const p = allPlayers[(myIndex + i) % total]
    if (p) ordered.push(p)
  }

  return ordered.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    imageUrl: p.imageUrl,
    lifePoints: p.lives,
    cardCount: p.hand?.length ?? gameStore.cardsPerPlayer,
    foldsMade: p.tricksWon > 0 ? p.tricksWon : undefined,
    foldsAnnounced: p.announced !== null ? p.announced : undefined,
    isAlive: p.isAlive
  }))
})

onMounted(async () => {
  // Accès direct / refresh : le lobby store est vide → pas de reprise d'état possible.
  if (!lobbyStore.roomId || lobbyStore.players.length === 0) {
    toast.error("Partie introuvable. Rejoignez un salon pour jouer.")
    router.push('/tarot_africain/informations')
    return
  }

  // Construit les joueurs dans l'ordre du back (lobbyStore.players est déjà trié par position).
  gameStore.players = lobbyStore.players.map((p, index): GamePlayer => ({
    id: String(p.id),
    name: p.firstname ?? p.name ?? `Joueur ${index + 1}`,
    color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] ?? '#38bdf8',
    imageUrl: undefined,
    isHost: p.pivot?.is_host ?? false,
    hand: [],
    announced: null,
    tricksWon: 0,
    lives: 10,
    isAlive: true
  }))

  gameStore.initGameListeners(lobbyStore.roomId)

  // Seul le host déclenche la désignation du donneur, une fois que tout le monde
  // a eu le temps de basculer sur la vue et de s'abonner à game.{id}.
  if (lobbyStore.isHost) {
    setTimeout(() => {
      apiMethods.setDealer(lobbyStore.roomId)
    }, 1500)
  }
})

onUnmounted(() => {
  gameStore.leaveGameListeners(lobbyStore.roomId)
})

const handleSelectAnnounce = async (count: number) => {
  errorMessage.value = ''
  const { success, message } = await gameStore.sendAnnounce(count)
  if (!success) errorMessage.value = message ?? "Calcul interdit !"
}

const handlePlayCard = async (card: any) => {
  // L'excuse (value null) vaut 0 ou 22 ; sélecteur UI = hors périmètre, on envoie 0 par défaut.
  const excuseValue = card?.value === null ? 0 : null
  errorMessage.value = ''
  const { success, message } = await gameStore.playCard(card.id, excuseValue)
  if (!success) errorMessage.value = message ?? 'Impossible de jouer cette carte.'
}

const winnerName = computed(() => {
  const id = gameStore.gameOverData?.winnerId
  return gameStore.players.find(p => p.id === String(id))?.name ?? null
})

const leaveGame = () => {
  lobbyStore.$reset()
  router.push('/tarot_africain/informations')
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white relative overflow-hidden">

    <Deal v-if="gameStore.phase === 'announcing' && isMyTurn"
      :cards-count="gameStore.cardsPerPlayer"
      :forbidden-value="forbiddenAnnounceValue"
      @announce="handleSelectAnnounce"
      :opponents="opponents"
    />

    <!-- <GameTable
      :numPlayers="gameStore.players.length"
      :nbCardsPerPlayer="gameStore.cardsPerPlayer"
      :myHand="myHand"
      :myColor="me?.color"
      :isMyTurn="isMyTurn"
      :trick="gameStore.trick"
      :players="gameStore.players"
      :myId="myId"
      :opponents="opponents"
      @play-card="handlePlayCard"
    /> -->

    <Test
          :numPlayers="gameStore.players.length"
      :nbCardsPerPlayer="gameStore.cardsPerPlayer"
      :myHand="myHand"
      :myColor="me?.color"
      :isMyTurn="canPlayCard"
      :trick="gameStore.trick"
      :players="gameStore.players"
      :myId="myId"
      :opponents="opponents"
      :round="gameStore.currentRound"
      :currentPlayerName="gameStore.currentPlayer?.name"
      @play-card="handlePlayCard"
      />

    <div v-if="gameStore.phase === 'gameover'"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div class="bg-slate-800 border border-amber-400 rounded-xl px-8 py-6 text-center shadow-2xl">
        <h2 class="text-2xl font-bold mb-2">Partie terminée</h2>
        <p class="mb-4">
          <template v-if="winnerName">{{ winnerName }} remporte la partie !</template>
          <template v-else>Aucun gagnant.</template>
        </p>
        <VButton @click="leaveGame">Retour</VButton>
      </div>
    </div>

    <p v-if="errorMessage" class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm font-semibold z-50">
      {{ errorMessage }}
    </p>
  </div>
</template>
