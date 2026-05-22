<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useGameStore } from '../stores/useGameStore'
import { useLobbyStore } from '../stores/useLobbyStore'
import { api } from '@/api/mockApi'

import GameTable from '@/modules/components/GameTable.vue'
import DevControlPanel from '../components/DevControlPanel.vue'
import Deal from '../components/Deal.vue'

const gameStore = useGameStore()
const lobbyStore = useLobbyStore()
const errorMessage = ref('')

const me = computed(() => gameStore.players.find(p => p.id === lobbyStore.myId))
const myHand = computed(() => me.value?.hand || [])
const isMyTurn = computed(() => gameStore.currentPlayer?.id === lobbyStore.myId)

const forbiddenAnnounceValue = computed(() => {
  const playersWhoAnnounced = gameStore.players.filter(p => p.announced !== null)
  const isLastPlayer = playersWhoAnnounced.length === gameStore.players.length - 1

  if (isLastPlayer && isMyTurn.value) {
    const currentTotal = gameStore.players.reduce((sum, p) => sum + (p.announced || 0), 0)
    return gameStore.cardsPerPlayer - currentTotal
  }
  return -1
})

const opponents = computed(() => {
  // fix bug order opponents/view
  const allPlayers = gameStore.players
  const myIndex = allPlayers.findIndex(p => p.id === lobbyStore.myId)
  const total = allPlayers.length

  const ordered = []
  for (let i = 1; i < total; i++) {
    ordered.push(allPlayers[(myIndex + i) % total])
  }

  return ordered.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    imageUrl: p.imageUrl,
    lifePoints: p.lives,
    foldsMade: p.tricksWon,
    cardCount: p.hand?.length ?? gameStore.cardsPerPlayer,
    foldsAnnounced: p.announced,
  }))
})

// TODO: quand prod prete simplification du onmounted
onMounted(async () => {
  if (gameStore.players.length === 0) {
    const { roomId } = await api.createRoom()
    lobbyStore.roomId = roomId
    lobbyStore.myId = 'player_me'
    lobbyStore.isHost = true

    await api.joinRoom(roomId, { playerId: 'player_me', name: 'Moi (Dev)', color: '#38bdf8', imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg' })
    await api.joinRoom(roomId, { playerId: 'bot_2', name: 'Alex', color: '#f43f5e', imageUrl: 'https://randomuser.me/api/portraits/men/45.jpg' })
    await api.joinRoom(roomId, { playerId: 'bot_3', name: 'Charlie', color: '#10b981', imageUrl: 'https://randomuser.me/api/portraits/men/63.jpg' })
    await api.joinRoom(roomId, { playerId: 'bot_4', name: 'David', color: '#fbbf24', imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg' })
    await api.joinRoom(roomId, { playerId: 'bot_5', name: 'Eve', color: '#8b5cf6', imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg' })

    const debugData = api._debugRoom(roomId)
    lobbyStore.players = debugData.room?.players || []
  }

  // avec ca
  gameStore.players = lobbyStore.players.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    imageUrl: p.imageUrl,
    isHost: p.isHost,
    hand: [],
    announced: null,
    tricksWon: null,
    lives: 10,
    isAlive: true
  }))

  // et ca uniquement
  gameStore.initGameListeners(lobbyStore.roomId)

  if (lobbyStore.isHost) {
    await api.setDealer(lobbyStore.roomId)
  }

})

const handleSelectAnnounce = async (count: number) => {
  errorMessage.value = ''
  const success = await gameStore.sendAnnounce(count)
  if (!success) errorMessage.value = "Calcul interdit !"
}

const handlePlayCard = async (card) => {
  await gameStore.playCard(card.id)
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white relative overflow-hidden">

    <DevControlPanel />

    <Deal v-if="gameStore.phase === 'announcing' && isMyTurn"
      :cards-count="gameStore.cardsPerPlayer"
      :forbidden-value="forbiddenAnnounceValue"
      @announce="handleSelectAnnounce"
    />

    <GameTable
      :numPlayers="gameStore.players.length"
      :nbCardsPerPlayer="gameStore.cardsPerPlayer"
      :myHand="myHand"
      :myColor="me?.color"
      :opponents="opponents"
      @play-card="handlePlayCard"
    />

    <p v-if="errorMessage" class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm font-semibold z-50">
      {{ errorMessage }}
    </p>
  </div>
</template>
