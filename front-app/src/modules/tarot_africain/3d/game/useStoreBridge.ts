/**
 * Adaptateur entre le store réel du Tarot Africain (useGameStore + mockApi/Reverb)
 * et le `GameState` attendu par la scène 3D (TarotTable3D / TarotHud).
 *
 * Remplace le moteur local `useTarotGame` : la 3D lit désormais l'état du vrai jeu
 * et émet ses actions (annonce / jeu) vers le store, exactement comme la vue 2D.
 */
import { reactive, computed, watchEffect } from 'vue'
import type { GameState, CardId } from './types'
import { useGameStore } from '../../stores/useGameStore'
import { useLobbyStore } from '../../stores/useLobbyStore'
import { Phase } from '../../models/Phase'
import { api } from '@/api/mockApi'

const PHASE_MAP: Record<string, GameState['phase']> = {
  [Phase.Rolling]: 'idle',
  [Phase.Dealing]: 'dealing',
  [Phase.Announcing]: 'betting',
  [Phase.Playing]: 'playing',
  [Phase.Resolving]: 'trickEnd',
  [Phase.Scoring]: 'roundEnd',
  [Phase.GameOver]: 'gameOver',
}

/** Carte réelle → identifiant 3D ('1'..'21', 'E' pour l'Excuse). */
const cardId = (c: any): CardId => (c == null ? 'X' : c.value == null ? 'E' : String(c.value))

export function useTarotStoreGame() {
  const store = useGameStore()
  const lobby = useLobbyStore()

  const state = reactive<GameState>({
    players: [],
    me: 0,
    round: 1,
    cardsPerRound: 0,
    dealer: 0,
    current: 0,
    phase: 'idle',
    blind: false,
    trick: [],
    wonPiles: [],
    lastTrickWinner: null,
    results: [],
    winner: null,
  })

  // Synchronise le GameState 3D à chaque changement du store
  watchEffect(() => {
    const players = store.players as any[]
    const myIdx = players.findIndex((p) => p.id === lobby.myId)
    state.me = myIdx < 0 ? 0 : myIdx
    state.round = store.currentRound
    state.cardsPerRound = store.cardsPerPlayer
    state.dealer = store.dealer
    state.current = store.currentPlayerIndex
    state.phase = PHASE_MAP[store.phase] ?? 'idle'
    state.blind = false
    state.players = players.map((p, i) => ({
      id: i,
      name: p.name,
      color: p.color,
      lives: p.lives ?? 0,
      // ma main = vraies cartes ; mains adverses = placeholders masqués ('X…')
      hand: (p.hand ?? []).map((c: any, k: number) => (c == null ? `X${i}_${k}` : cardId(c))),
      bet: p.announced ?? null,
      tricks: p.tricksWon ?? 0,
      eliminated: !(p.isAlive ?? (p.lives ?? 0) > 0),
      isHuman: p.id === lobby.myId,
    }))
    state.trick = store.trick.map((t: any) => ({
      player: players.findIndex((p) => p.id === t.playerId),
      card: cardId(t.card),
      value: t.card == null ? 0 : t.card.value == null ? t.excuseValue ?? 0 : t.card.value,
    }))
    state.wonPiles = players.map(() => [])
    state.lastTrickWinner = null
    state.winner =
      store.phase === Phase.GameOver
        ? players.findIndex((p) => p.isAlive ?? (p.lives ?? 0) > 0)
        : null
    state.results = []
  })

  // Annonce interdite pour le dernier annonceur (total = nb de cartes)
  const forbiddenBet = computed<number>(() => {
    const players = store.players as any[]
    const announced = players.filter((p) => p.announced !== null && p.announced !== undefined)
    const isLast = announced.length === players.length - 1
    const myTurn = (store.currentPlayer as any)?.id === lobby.myId
    if (isLast && myTurn) {
      const total = players.reduce((s, p) => s + (p.announced || 0), 0)
      return store.cardsPerPlayer - total
    }
    return -1
  })

  function placeBet(_me: number, n: number) {
    store.sendAnnounce(n)
  }

  function playCard(_me: number, id: CardId) {
    const my = (store.players as any[]).find((p) => p.id === lobby.myId)
    const card = (my?.hand ?? []).find((c: any) => c && cardId(c) === id)
    if (card) store.playCard(card.id)
  }

  // La phase « excuse » (0/22) n'est pas gérée par le backend simulé → no-op
  function chooseExcuse() {}

  /** Initialise une partie de dev (salon + adversaires + écouteurs), comme Game.vue. */
  async function init() {
    if (store.players.length > 0) return
    const { roomId } = await api.createRoom()
    lobby.roomId = roomId
    lobby.myId = 'player_me'
    lobby.isHost = true
    await api.joinRoom(roomId, { playerId: 'player_me', name: 'Moi', color: '#29a8e0', imageUrl: '' })
    await api.joinRoom(roomId, { playerId: 'bot_2', name: 'Nadia', color: '#f0435f', imageUrl: '' })
    await api.joinRoom(roomId, { playerId: 'bot_3', name: 'Kofi', color: '#3fb56b', imageUrl: '' })
    await api.joinRoom(roomId, { playerId: 'bot_4', name: 'Awa', color: '#f29a2e', imageUrl: '' })
    await api.joinRoom(roomId, { playerId: 'bot_5', name: 'Yao', color: '#9b5de5', imageUrl: '' })

    const debug = api._debugRoom(roomId)
    lobby.players = debug.room?.players || []

    store.players = lobby.players.map((p: any) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      imageUrl: p.imageUrl,
      hand: [],
      announced: null,
      tricksWon: 0,
      lives: 10,
      isAlive: true,
    })) as any

    store.initGameListeners(lobby.roomId)
    if (lobby.isHost) await api.setDealer(lobby.roomId)
  }

  const canPlay = computed(() => state.phase === 'playing' && state.current === state.me)

  return { state, forbiddenBet, placeBet, playCard, chooseExcuse, init, canPlay }
}
