/**
 * mockApi.ts
 * Mock complet de l'API REST + Laravel Echo pour le développement local.
 * À remplacer par les vrais appels HTTP + Echo quand le back est prêt.
 *
 * Usage :
 *   import { api, echo } from './mockApi'
 *   const { roomId } = await api.createRoom()
 *   echo.channel(`lobby.${roomId}`).listen('PlayerJoined', handler)
 */

import { Card } from '@/modules/tarot_africain/models/Card'
import { GAMES_DATA } from '@/modules/tarot_africain/data/games'

// ---------------------------------------------------------------------------
// Types partagés
// ---------------------------------------------------------------------------

export interface Player {
  id: string
  name: string
  color: string
  isHost: boolean
}

export interface ScoringResult {
  id: string
  announced: number
  tricksWon: number
  livesLost: number
}

// ---------------------------------------------------------------------------
// Mini EventEmitter interne (remplace Pusher/Soketi en local)
// ---------------------------------------------------------------------------

type Listener = (data: unknown) => void

class MockEventBus {
  private channels: Record<string, Record<string, Listener[]>> = {}

  on(channel: string, event: string, cb: Listener) {
    if (!this.channels[channel]) this.channels[channel] = {}
    if (!this.channels[channel][event]) this.channels[channel][event] = []
    this.channels[channel][event].push(cb)
  }

  off(channel: string, event: string, cb: Listener) {
    if (!this.channels[channel]?.[event]) return
    this.channels[channel][event] = this.channels[channel][event].filter(fn => fn !== cb)
  }

  emit(channel: string, event: string, data: unknown) {
    const listeners = this.channels[channel]?.[event] ?? []
    // Simule l'asynchronisme réseau
    setTimeout(() => listeners.forEach(fn => fn(data)), 80)
  }
}

const bus = new MockEventBus()

// ---------------------------------------------------------------------------
// Classe MockChannel — imite l'interface Echo Channel / PresenceChannel
// ---------------------------------------------------------------------------

class MockChannel {
  constructor(private name: string) {}

  listen(event: string, cb: (data: unknown) => void): this {
    bus.on(this.name, event, cb)
    return this
  }

  stopListening(event: string, cb: (data: unknown) => void): this {
    bus.off(this.name, event, cb)
    return this
  }
}

// ---------------------------------------------------------------------------
// Mock Echo — remplace window.Echo / new Echo({...})
// ---------------------------------------------------------------------------

export const echo = {
  channel(name: string): MockChannel {
    return new MockChannel(name)
  },
  /** Alias pratique pour les presence channels (même API ici) */
  join(name: string): MockChannel {
    return new MockChannel(name)
  },
  /** Utilisé par le serveur mock pour diffuser */
  _broadcast(channel: string, event: string, data: unknown) {
    bus.emit(channel, event, data)
  },
}

// ---------------------------------------------------------------------------
// État interne du mock "serveur"
// ---------------------------------------------------------------------------

interface RoomState {
  roomId: string
  players: Player[]
  status: 'waiting' | 'ready' | 'starting'
}

interface GameState {
  roomId: string
  deck: Card[]
  hands: Map<string, Card[]>
  dealerIndex: number
  currentPlayerIndex: number
  cardsPerPlayer: number
  trick: { playerId: string; card: Card; excuseValue?: 0 | 22 }[]
  announcements: Map<string, number>
  tricksWon: Map<string, number>
  lives: Map<string, number>
  round: number
}

const rooms = new Map<string, RoomState>()
const games = new Map<string, GameState>()

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function freshDeck(): Card[] {
  return GAMES_DATA.tarot_africain.cards.map(
    c => new Card(c.id, c.name, c.value, c.image)
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dealHands(deck: Card[], players: Player[], cardsPerPlayer: number): Map<string, Card[]> {
  const hands = new Map<string, Card[]>(players.map(p => [p.id, []]))
  const shuffled = shuffle(deck)
  for (let i = 0; i < cardsPerPlayer; i++) {
    players.forEach(p => {
      const card = shuffled.pop()
      if (card) hands.get(p.id)!.push(card)
    })
  }
  return hands
}

function resolveTrick(
  trick: { playerId: string; card: Card; excuseValue?: 0 | 22 }[]
): string {
  return trick.reduce((best, play) => {
    const val = play.card.getEffectiveValue(play.excuseValue)
    const bestVal = best.card.getEffectiveValue(best.excuseValue)
    return val > bestVal ? play : best
  }).playerId
}

// ---------------------------------------------------------------------------
// API mock
// ---------------------------------------------------------------------------

function delay(ms = 120): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const api = {
  // -------------------------------------------------------------------------
  // Lobby
  // -------------------------------------------------------------------------

  /** POST /rooms */
  async createRoom(): Promise<{ roomId: string }> {
    await delay()
    const roomId = generateRoomId()
    rooms.set(roomId, { roomId, players: [], status: 'waiting' })
    return { roomId }
  },

  /** POST /rooms/{roomId}/join */
  async joinRoom(
    roomId: string,
    body: { playerId: string; name: string; color: string }
  ): Promise<{ players: Player[] }> {
    await delay()
    const room = rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} introuvable`)

    const isHost = room.players.length === 0
    const player: Player = { ...body, isHost }
    room.players.push(player)
    if (room.players.length >= 3) room.status = 'ready'

    // Broadcast Echo → lobby.{roomId}
    echo._broadcast(`lobby.${roomId}`, 'PlayerJoined', { player })

    return { players: room.players }
  },

  /** POST /rooms/{roomId}/start */
  async startGame(roomId: string): Promise<void> {
    await delay()
    const room = rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} introuvable`)
    if (room.players.length < 3) throw new Error('Pas assez de joueurs')

    room.status = 'starting'
    echo._broadcast(`lobby.${roomId}`, 'GameStarted', {})
  },

  // -------------------------------------------------------------------------
  // Game
  // -------------------------------------------------------------------------

  /** POST /game/{roomId}/dealer */
  async setDealer(roomId: string): Promise<void> {
    await delay()
    const room = rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} introuvable`)

    const dealerIndex = Math.floor(Math.random() * room.players.length)

    // Initialise l'état de jeu si besoin
    const LIVES_BY_COUNT: Record<number, number> = { 3: 6, 4: 5, 5: 4, 6: 3 }
    const START_CARDS: Record<number, number> = { 3: 6, 4: 5, 5: 4, 6: 4 }
    const n = room.players.length
    const lives = LIVES_BY_COUNT[n] ?? 5
    const cardsPerPlayer = START_CARDS[n] ?? 5

    games.set(roomId, {
      roomId,
      deck: freshDeck(),
      hands: new Map(),
      dealerIndex,
      currentPlayerIndex: (dealerIndex + 1) % n,
      cardsPerPlayer,
      trick: [],
      announcements: new Map(),
      tricksWon: new Map(room.players.map(p => [p.id, 0])),
      lives: new Map(room.players.map(p => [p.id, lives])),
      round: 1,
    })

    echo._broadcast(`game.${roomId}`, 'DealerSet', { dealerIndex })
  },

  /**
   * POST /game/{roomId}/deal
   * Retourne la main du joueur qui appelle.
   */
  async deal(roomId: string, callerId: string): Promise<{ hand: Card[] }> {
    await delay()
    const room = rooms.get(roomId)
    const game = games.get(roomId)
    if (!room || !game) throw new Error(`Game ${roomId} introuvable`)

    game.hands = dealHands(game.deck, room.players, game.cardsPerPlayer)
    game.announcements.clear()
    game.tricksWon = new Map(room.players.map(p => [p.id, 0]))
    game.trick = []

    echo._broadcast(`game.${roomId}`, 'CardsDealt', { cardsPerPlayer: game.cardsPerPlayer })

    const hand = game.hands.get(callerId) ?? []
    return { hand }
  },

  /** POST /game/{roomId}/announce */
  async announce(
    roomId: string,
    body: { playerId: string; count: number }
  ): Promise<{ ok: boolean }> {
    await delay()
    const room = rooms.get(roomId)
    const game = games.get(roomId)
    if (!room || !game) throw new Error(`Game ${roomId} introuvable`)

    const { playerId, count } = body
    const totalAnnounced = [...game.announcements.values()].reduce((s, v) => s + v, 0)
    const remaining = room.players.length - game.announcements.size
    const isLast = remaining === 1

    // Règle : le dernier ne peut pas annoncer le nombre exact manquant
    if (isLast && count === game.cardsPerPlayer - totalAnnounced) {
      return { ok: false }
    }

    game.announcements.set(playerId, count)
    echo._broadcast(`game.${roomId}`, 'PlayerAnnounced', { playerId, count })

    return { ok: true }
  },

  /** POST /game/{roomId}/play */
  async playCard(
    roomId: string,
    body: { playerId: string; cardId: number; excuseValue?: 0 | 22 }
  ): Promise<void> {
    await delay()
    const room = rooms.get(roomId)
    const game = games.get(roomId)
    if (!room || !game) throw new Error(`Game ${roomId} introuvable`)

    const { playerId, cardId, excuseValue } = body
    const hand = game.hands.get(playerId) ?? []
    const cardIdx = hand.findIndex(c => c.id === cardId)
    if (cardIdx === -1) throw new Error('Carte introuvable dans la main')

    const [card] = hand.splice(cardIdx, 1)
    game.trick.push({ playerId, card, excuseValue })

    echo._broadcast(`game.${roomId}`, 'CardPlayed', { playerId, card, excuseValue })

    // Fin de pli ?
    if (game.trick.length === room.players.length) {
      const winnerId = resolveTrick(game.trick)
      game.tricksWon.set(winnerId, (game.tricksWon.get(winnerId) ?? 0) + 1)

      echo._broadcast(`game.${roomId}`, 'TrickResolved', {
        winnerId,
        trick: game.trick.map(t => t.card),
      })

      game.trick = []
      game.currentPlayerIndex = room.players.findIndex(p => p.id === winnerId)

      // Fin de manche ? (plus de cartes)
      const handsEmpty = [...game.hands.values()].every(h => h.length === 0)
      if (handsEmpty) {
        // Calcul des scores
        const results: ScoringResult[] = room.players.map(p => {
          const announced = game.announcements.get(p.id) ?? 0
          const tricksWon = game.tricksWon.get(p.id) ?? 0
          const livesLost = Math.abs(announced - tricksWon)
          const prev = game.lives.get(p.id) ?? 0
          game.lives.set(p.id, Math.max(0, prev - livesLost))
          return { id: p.id, announced, tricksWon, livesLost }
        })

        echo._broadcast(`game.${roomId}`, 'RoundScored', { results })

        // Game over ?
        const alive = room.players.filter(p => (game.lives.get(p.id) ?? 0) > 0)
        if (alive.length <= 1) {
          const winnerId = alive[0]?.id ?? null
          echo._broadcast(`game.${roomId}`, 'GameOver', { winnerId })
          return
        }

        // Prochaine manche
        const ROUND_SEQUENCE: Record<number, number[]> = {
          3: [6, 5, 4, 3, 2, 1],
          4: [5, 4, 3, 2, 1],
          5: [4, 3, 2, 1],
          6: [4, 3, 2, 1],
        }
        const seq = ROUND_SEQUENCE[room.players.length] ?? [5, 4, 3, 2, 1]
        const nextCards = seq[game.round] // round 0-based index
        if (!nextCards) {
          echo._broadcast(`game.${roomId}`, 'GameOver', { winnerId: null })
          return
        }
        game.cardsPerPlayer = nextCards
        game.round++
        game.dealerIndex = (game.dealerIndex - 1 + room.players.length) % room.players.length
      }
    }
  },

  // -------------------------------------------------------------------------
  // Helpers de test / dev
  // -------------------------------------------------------------------------

  /** Récupère l'état complet d'une room (debug uniquement) */
  _debugRoom(roomId: string) {
    return { room: rooms.get(roomId), game: games.get(roomId) }
  },

  /** Simule un joueur qui quitte (broadcast PlayerLeft) */
  _simulateLeave(roomId: string, playerId: string) {
    const room = rooms.get(roomId)
    if (!room) return
    room.players = room.players.filter(p => p.id !== playerId)
    if (room.players.length < 3) room.status = 'waiting'
    echo._broadcast(`lobby.${roomId}`, 'PlayerLeft', { playerId })
  },
}
