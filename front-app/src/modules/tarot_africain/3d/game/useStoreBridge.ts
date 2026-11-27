/**
 * Adaptateur entre le store réel du Tarot Africain (useGameStore + mockApi/Reverb)
 * et le `GameState` attendu par la scène 3D (TarotTable3D / TarotHud).
 *
 * Remplace le moteur local `useTarotGame` : la 3D lit désormais l'état du vrai jeu
 * et émet ses actions (annonce / jeu) vers le store, exactement comme la vue 2D.
 */
import { reactive, ref, computed, watchEffect } from 'vue'
import type { GameState, CardId } from './types'
import { useGameStore } from '../../stores/useGameStore'
import { useLobbyStore } from '../../stores/useLobbyStore'
import { Phase } from '../../models/Phase'
import apiTarot from '../../api'

const sameId = (a: unknown, b: unknown) => String(a) === String(b)

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

  // Carte Excuse posée par le joueur local, en attente du choix de valeur (0 ou 22).
  const pendingExcuse = ref<any | null>(null)

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
    turnEndsAt: 0,
  })

  // Synchronise le GameState 3D à chaque changement du store
  watchEffect(() => {
    const players = store.players as any[]
    const myIdx = players.findIndex((p) => sameId(p.id, lobby.myId))
    state.me = myIdx < 0 ? 0 : myIdx
    state.round = store.currentRound
    state.cardsPerRound = store.cardsPerPlayer
    state.dealer = store.dealer
    state.current = store.currentPlayerIndex
    // Phase locale « excuse » : le joueur local a posé l'Excuse et doit choisir 0/22.
    state.phase = pendingExcuse.value ? 'excuse' : (PHASE_MAP[store.phase] ?? 'idle')
    state.turnEndsAt = store.turnEndsAt
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
      isHuman: sameId(p.id, lobby.myId),
    }))
    state.trick = store.trick.map((t: any) => {
      const isExcuse = t.card != null && t.card.value == null
      // Excuse posée : on encode la valeur choisie dans l'id ('E0'/'E22') pour l'afficher
      const card: CardId = isExcuse && t.excuseValue != null ? `E${t.excuseValue}` : cardId(t.card)
      return {
        player: players.findIndex((p) => sameId(p.id, t.playerId)),
        card,
        value: t.card == null ? 0 : isExcuse ? (t.excuseValue ?? 0) : t.card.value,
      }
    })
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
    const myTurn = sameId((store.currentPlayer as any)?.id, lobby.myId)
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
    const my = (store.players as any[]).find((p) => sameId(p.id, lobby.myId))
    const card = (my?.hand ?? []).find((c: any) => c && cardId(c) === id)
    if (!card) return
    // L'Excuse (valeur null) : on n'envoie pas tout de suite, on demande 0 ou 22.
    if (card.value == null) {
      pendingExcuse.value = card
      return
    }
    store.playCard(card.id)
  }

  // Le joueur local a choisi la valeur de l'Excuse (0 ou 22) → on envoie le coup.
  function chooseExcuse(v: 0 | 22) {
    const card = pendingExcuse.value
    pendingExcuse.value = null
    if (card) store.playCard(card.id, v)
  }

  /**
   * Branche la scène 3D sur la VRAIE partie multijoueur.
   * `roomCode` vient de la route (/tarot_africain/game3d/:gameId).
   * Hydrate l'état depuis le backend, abonne aux events, puis (si host) lance la donne.
   */
  async function init(roomCode: string) {
    if (!roomCode) {
      console.error('[game3d] init: code de room manquant dans la route')
      return
    }
    if (store.players.length > 0) return

    const ok = await store.hydrate(roomCode)
    if (!ok) return

    // Le host désigne le donneur → le backend distribue et diffuse les events à tous.
    if (lobby.isHost) await apiTarot.setDealer(lobby.roomId)

    // Filet anti-course : si on s'est abonné après la distribution (events ratés),
    // on resynchronise /state jusqu'à récupérer notre main.
    store.ensureDealt(roomCode)
  }

  const canPlay = computed(() => state.phase === 'playing' && state.current === state.me)

  return { state, forbiddenBet, placeBet, playCard, chooseExcuse, init, canPlay }
}
