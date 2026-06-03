// import { Card } from '@/modules/tarot_africain/models/Card'
// import { GAMES_DATA } from '@/modules/tarot_africain/data/games'
// import { GAME_CONFIG } from '@/modules/tarot_africain/data/gameConfig'

// function assertCurrentPlayer(game: GameState, room: RoomState, playerId: string): boolean {
//   const expectedIndex = room.players.findIndex(p => p.id === playerId)
//   if (game.currentPlayerIndex !== expectedIndex) {
//     console.warn(`Warning: action from ${playerId} but current player is ${room.players[game.currentPlayerIndex]?.name} (index ${game.currentPlayerIndex})`)
//     return false
//   }
//   return true
// }

// export interface Player {
//   id: string
//   name: string
//   color: string
//   isHost: boolean
//   imageUrl: string
// }

// export interface ScoringResult {
//   id: string
//   announced: number
//   tricksWon: number
//   livesLost: number
// }

// type Listener = (data: unknown) => void

// class MockEventBus {
//   private channels: Record<string, Record<string, Listener[]>> = {}

//   on(channel: string, event: string, cb: Listener) {
//     if (!this.channels[channel]) this.channels[channel] = {}
//     if (!this.channels[channel][event]) this.channels[channel][event] = []
//     this.channels[channel][event].push(cb)
//   }

//   off(channel: string, event: string, cb: Listener) {
//     if (!this.channels[channel]?.[event]) return
//     this.channels[channel][event] = this.channels[channel][event].filter(fn => fn !== cb)
//   }

//   emit(channel: string, event: string, data: unknown) {
//     setTimeout(() => listeners.forEach(fn => fn(data)), 80)
//     const listeners = this.channels[channel]?.[event] ?? []
//   }
// }

// const bus = new MockEventBus()

// class MockChannel {
//   constructor(private name: string) {}
//   listen(event: string, cb: (data: unknown) => void): this {
//     bus.on(this.name, event, cb)
//     return this
//   }
//   stopListening(event: string, cb: (data: unknown) => void): this {
//     bus.off(this.name, event, cb)
//     return this
//   }
// }

// export const echo = {
//   channel(name: string): MockChannel { return new MockChannel(name) },
//   join(name: string): MockChannel { return new MockChannel(name) },
//   _broadcast(channel: string, event: string, data: unknown) {
//     bus.emit(channel, event, data)
//   },
// }

// interface RoomState {
//   roomId: string
//   players: Player[]
//   status: 'waiting' | 'ready' | 'starting'
// }

// interface GameState {
//   roomId: string
//   deck: Card[]
//   hands: Map<string, Card[]>
//   dealerIndex: number
//   currentPlayerIndex: number
//   cardsPerPlayer: number
//   trick: { playerId: string; card: Card; excuseValue?: 0 | 22 }[]
//   announcements: Map<string, number>
//   tricksWon: Map<string, number>
//   lives: Map<string, number>
//   round: number
// }

// const rooms = new Map<string, RoomState>()
// const games = new Map<string, GameState>()

// function generateRoomId(): string {
//   return Math.random().toString(36).substring(2, 8).toUpperCase()
// }

// // Calcule le prochain index valide parmi les joueurs encore vivants
// function getNextAlivePlayerIndex(currentIndex: number, players: Player[], lives: Map<string, number>): number {
//   let nextIndex = currentIndex
//   const n = players.length
//   for (let i = 0; i < n; i++) {
//     nextIndex = (nextIndex + 1) % n
//     const p = players[nextIndex]
//     if ((lives.get(p.id) ?? 0) > 0) {
//       return nextIndex
//     }
//   }
//   return currentIndex
// }

// function freshDeck(): Card[] {
//   return GAMES_DATA.tarot_africain.cards.map(
//     c => new Card(c.id, c.name, c.value, c.image)
//   )
// }

// function shuffle<T>(arr: T[]): T[] {
//   const a = [...arr]
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1))
//     ;[a[i], a[j]] = [a[j], a[i]]
//   }
//   return a
// }

// function dealHands(deck: Card[], players: Player[], cardsPerPlayer: number, lives: Map<string, number>): Map<string, Card[]> {
//   const hands = new Map<string, Card[]>(players.map(p => [p.id, []]))
//   const shuffled = shuffle(deck)

//   // On ne distribue qu'aux joueurs en vie
//   const alivePlayers = players.filter(p => (lives.get(p.id) ?? 0) > 0)

//   for (let i = 0; i < cardsPerPlayer; i++) {
//     alivePlayers.forEach(p => {
//       const card = shuffled.pop()
//       if (card) hands.get(p.id)!.push(card)
//     })
//   }
//   return hands
// }

// function resolveTrick(trick: { playerId: string; card: Card; excuseValue?: 0 | 22 }[]): string {
//   return trick.reduce((best, play) => {
//     const val = play.card.getEffectiveValue(play.excuseValue)
//     const bestVal = best.card.getEffectiveValue(best.excuseValue)
//     return val > bestVal ? play : best
//   }).playerId
// }

// function delay(ms = 120): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

// export const api = {
//   async createRoom(): Promise<{ roomId: string }> {
//     await delay()
//     const roomId = generateRoomId()
//     rooms.set(roomId, { roomId, players: [], status: 'waiting' })
//     return { roomId }
//   },

//   async joinRoom(roomId: string, body: { playerId: string; name: string; color: string, imageUrl: string }): Promise<{ players: Player[] }> {
//     await delay()
//     const room = rooms.get(roomId)
//     if (!room) throw new Error(`Room ${roomId} introuvable`)

//     const isHost = room.players.length === 0
//     const player: Player = { id: body.playerId, name: body.name, color: body.color, isHost, imageUrl: body.imageUrl }
//     room.players.push(player)
//     if (room.players.length >= 3) room.status = 'ready'

//     echo._broadcast(`lobby.${roomId}`, 'PlayerJoined', { player })
//     return { players: room.players }
//   },

//   async startGame(roomId: string): Promise<void> {
//     await delay()
//     const room = rooms.get(roomId)
//     if (!room) throw new Error(`Room ${roomId} introuvable`)
//     room.status = 'starting'
//     echo._broadcast(`lobby.${roomId}`, 'GameStarted', {})
//   },

//   async setDealer(roomId: string): Promise<void> {
//     await delay()
//     const room = rooms.get(roomId)
//     if (!room) throw new Error(`Room ${roomId} introuvable`)

//     const dealerIndex = Math.floor(Math.random() * room.players.length)
//     const n = room.players.length
//     const config = GAME_CONFIG[n]
//     const cardsPerPlayer = config ? config.startCards : 5
//     const initialLives = config ? config.lives : 10

//     games.set(roomId, {
//       roomId,
//       deck: freshDeck(),
//       hands: new Map(),
//       dealerIndex,
//       currentPlayerIndex: (dealerIndex + 1) % n,
//       cardsPerPlayer,
//       trick: [],
//       announcements: new Map(),
//       tricksWon: new Map(room.players.map(p => [p.id, 0])),
//       lives: new Map(room.players.map(p => [p.id, initialLives])),
//       round: 1,
//     })

//     echo._broadcast(`game.${roomId}`, 'DealerSet', { dealerIndex })
//   },

//   async deal(roomId: string, callerId: string): Promise<{ hand: Card[] }> {
//     await delay()
//     const room = rooms.get(roomId)
//     const game = games.get(roomId)
//     if (!room || !game) throw new Error(`Game ${roomId} introuvable`)

//     game.hands = dealHands(game.deck, room.players, game.cardsPerPlayer, game.lives)
//     game.announcements.clear()
//     game.tricksWon = new Map(room.players.map(p => [p.id, 0]))
//     game.trick = []

//     echo._broadcast(`game.${roomId}`, 'CardsDealt', { cardsPerPlayer: game.cardsPerPlayer })
//     return { hand: game.hands.get(callerId) ?? [] }
//   },

//   async announce(roomId: string, body: { playerId: string; count: number }): Promise<{ ok: boolean }> {
//     await delay(50)
//     const room = rooms.get(roomId)
//     const game = games.get(roomId)
//     if (!room || !game) throw new Error(`Game ${roomId} introuvable`)
//     if (!assertCurrentPlayer(game, room, body.playerId)) {
//       return { ok: false }
//     }

//     const { playerId, count } = body
//     const totalAnnounced = [...game.announcements.values()].reduce((s, v) => s + v, 0)

//     const alivePlayers = room.players.filter(p => (game.lives.get(p.id) ?? 0) > 0)
//     const remaining = alivePlayers.length - game.announcements.size
//     const isLast = remaining === 1

//     if (isLast && count === game.cardsPerPlayer - totalAnnounced) {
//       return { ok: false }
//     }

//     game.announcements.set(playerId, count)

//     // Prochain joueur en vie
//     const nextPlayerIndex = getNextAlivePlayerIndex(game.currentPlayerIndex, room.players, game.lives)
//     game.currentPlayerIndex = nextPlayerIndex
//     echo._broadcast(`game.${roomId}`, 'PlayerAnnounced', { playerId, count, nextPlayerIndex })

//     if (game.announcements.size === alivePlayers.length) {
//       echo._broadcast(`game.${roomId}`, 'AllPlayersAnnounced', {})
//     }

//     return { ok: true }
//   },

//   async playCard(roomId: string, body: { playerId: string; cardId: number; excuseValue?: 0 | 22 }): Promise<void> {
//     await delay()
//     const room = rooms.get(roomId)
//     const game = games.get(roomId)
//     if (!room || !game) throw new Error(`Game ${roomId} introuvable`)

//     if (!assertCurrentPlayer(game, room, body.playerId)) {
//       return
//     }

//     const { playerId, cardId, excuseValue } = body
//     const hand = game.hands.get(playerId) ?? []
//     const cardIdx = hand.findIndex(c => c.id === cardId)
//     if (cardIdx === -1) throw new Error('Carte introuvable dans la main')

//     const [card] = hand.splice(cardIdx, 1)

//     game.trick.push({ playerId, card, excuseValue })

//     const nextPlayerIndex = getNextAlivePlayerIndex(game.currentPlayerIndex, room.players, game.lives)
//     game.currentPlayerIndex = nextPlayerIndex

//     echo._broadcast(`game.${roomId}`, 'CardPlayed', { playerId, card, excuseValue, nextPlayerIndex })

//     const alivePlayers = room.players.filter(p => (game.lives.get(p.id) ?? 0) > 0)

//     if (game.trick.length === alivePlayers.length) {
//       const winnerId = resolveTrick(game.trick)
//       game.tricksWon.set(winnerId, (game.tricksWon.get(winnerId) ?? 0) + 1)

//       echo._broadcast(`game.${roomId}`, 'TrickResolved', {
//         winnerId,
//         trick: game.trick.map(t => t.card),
//       })

//       game.trick = []
//       game.currentPlayerIndex = room.players.findIndex(p => p.id === winnerId)

//       const handsEmpty = alivePlayers.every(p => (game.hands.get(p.id) ?? []).length === 0)

//       if (handsEmpty) {
//         const results: ScoringResult[] = room.players.map(p => {
//           const announced = game.announcements.get(p.id) ?? 0
//           const tricksWon = game.tricksWon.get(p.id) ?? 0
//           const livesLost = Math.abs(announced - tricksWon)
//           const prev = game.lives.get(p.id) ?? 0
//           game.lives.set(p.id, Math.max(0, prev - livesLost))

//           return { id: p.id, announced, tricksWon, livesLost }
//         })

//         echo._broadcast(`game.${roomId}`, 'RoundScored', { results })

//         const alive = room.players.filter(p => (game.lives.get(p.id) ?? 0) > 0)
//         const numAlivePlayers = alive.length as 3 | 4 | 5

//         if (numAlivePlayers <= 2) {
//           console.log(`[GameOver] Il ne reste que ${numAlivePlayers} joueur(s). Fin de partie.`)

//           const winner = alive.reduce((prev, current) => {
//             return (game.lives.get(current.id) ?? 0) > (game.lives.get(prev.id) ?? 0) ? current : prev
//           }, alive[0])

//           echo._broadcast(`game.${roomId}`, 'GameOver', {
//             winnerId: winner?.id,
//             survivors: alive.map(p => p.id)
//           })
//           return
//         }

//         const config = GAME_CONFIG[numAlivePlayers]

//         if (!config) {
//           echo._broadcast(`game.${roomId}`, 'GameOver', { loserId: alive[0]?.id })
//           throw new Error(`Configuration introuvable pour ${numAlivePlayers} joueurs en vie`)
//         }

//         const nextCards = game.cardsPerPlayer === 1
//           ? config.startCards
//           : game.cardsPerPlayer - 1

//         game.cardsPerPlayer = nextCards
//         game.round++

//         console.log(`[NextRound Dynamique] round=${game.round} joueursEnVie=${numAlivePlayers} cardsPerPlayer=${game.cardsPerPlayer}`)

//         game.dealerIndex = getNextAlivePlayerIndex(game.dealerIndex, room.players, game.lives)
//         game.currentPlayerIndex = getNextAlivePlayerIndex(game.dealerIndex, room.players, game.lives)

//         const nextDealerIndex = game.dealerIndex
//         const nextRound = game.round
//         const nextPlayerIndex = game.currentPlayerIndex

//         setTimeout(() => {
//           echo._broadcast(`game.${roomId}`, 'DealerSet', {
//             dealerIndex: nextDealerIndex,
//             round: nextRound,
//             nextPlayerIndex: nextPlayerIndex
//           })
//         }, 4000)
//       }
//     }
//   },

//   _debugRoom(roomId: string) {
//     return { room: rooms.get(roomId), game: games.get(roomId) }
//   }
// }

import { Card } from '@/modules/tarot_africain/models/Card'
import { GAMES_DATA } from '@/modules/tarot_africain/data/games'
import { GAME_CONFIG } from '@/modules/tarot_africain/data/gameConfig'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Player {
  id: string
  name: string
  color: string
  isHost: boolean
  imageUrl: string
}

export interface ScoringResult {
  id: string
  announced: number
  tricksWon: number
  livesLost: number
}

type Listener = (data: unknown) => void

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function assertCurrentPlayer(game: GameState, room: RoomState, playerId: string): boolean {
  const expectedIndex = room.players.findIndex(p => p.id === playerId)
  if (game.currentPlayerIndex !== expectedIndex) {
    console.warn(
      `Warning: action from ${playerId} but current player is ` +
      `${room.players[game.currentPlayerIndex]?.name} (index ${game.currentPlayerIndex})`
    )
    return false
  }
  return true
}

function getNextAlivePlayerIndex(
  currentIndex: number,
  players: Player[],
  lives: Map<string, number>
): number {
  const n = players.length
  for (let i = 1; i <= n; i++) {
    const next = (currentIndex + i) % n
    if ((lives.get(players[next].id) ?? 0) > 0) return next
  }
  return currentIndex
}

function freshDeck(): Card[] {
  return GAMES_DATA.tarot_africain.cards.map(c => new Card(c.id, c.name, c.value, c.image))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dealHands(
  deck: Card[],
  players: Player[],
  cardsPerPlayer: number,
  lives: Map<string, number>
): Map<string, Card[]> {
  const hands = new Map<string, Card[]>(players.map(p => [p.id, []]))
  const shuffled = shuffle(deck)
  const alive = players.filter(p => (lives.get(p.id) ?? 0) > 0)
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (const p of alive) {
      const card = shuffled.pop()
      if (card) hands.get(p.id)!.push(card)
    }
  }
  return hands
}

function resolveTrick(
  trick: { playerId: string; card: Card; excuseValue?: 0 | 22 }[]
): string {
  return trick.reduce((best, play) =>
    play.card.getEffectiveValue(play.excuseValue) > best.card.getEffectiveValue(best.excuseValue)
      ? play : best
  ).playerId
}

const delay = (ms = 120): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

// ─── MockEventBus ─────────────────────────────────────────────────────────────

class MockEventBus {
  private channels: Record<string, Record<string, Listener[]>> = {}

  on(channel: string, event: string, cb: Listener): void {
    ;((this.channels[channel] ??= {})[event] ??= []).push(cb)
  }

  off(channel: string, event: string, cb: Listener): void {
    const list = this.channels[channel]?.[event]
    if (list) this.channels[channel][event] = list.filter(fn => fn !== cb)
  }

  emit(channel: string, event: string, data: unknown): void {
    const listeners = this.channels[channel]?.[event] ?? []
    setTimeout(() => listeners.forEach(fn => fn(data)), 80)
  }
}

const bus = new MockEventBus()

// ─── MockChannel ──────────────────────────────────────────────────────────────

class MockChannel {
  constructor(private name: string) {}

  listen(event: string, cb: Listener): this {
    bus.on(this.name, event, cb)
    return this
  }

  stopListening(event: string, cb: Listener): this {
    bus.off(this.name, event, cb)
    return this
  }
}

// ─── Echo ────────────────────────────────────────────────────────────────────

export const echo = {
  channel: (name: string) => new MockChannel(name),
  join:    (name: string) => new MockChannel(name),
  _broadcast: (channel: string, event: string, data: unknown) => bus.emit(channel, event, data),
}

// ─── State ───────────────────────────────────────────────────────────────────

const rooms = new Map<string, RoomState>()
const games = new Map<string, GameState>()

const generateRoomId = (): string => Math.random().toString(36).substring(2, 8).toUpperCase()

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {
  async createRoom(): Promise<{ roomId: string }> {
    await delay()
    const roomId = generateRoomId()
    rooms.set(roomId, { roomId, players: [], status: 'waiting' })
    return { roomId }
  },

  async joinRoom(
    roomId: string,
    body: { playerId: string; name: string; color: string; imageUrl: string }
  ): Promise<{ players: Player[] }> {
    await delay()
    const room = rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} introuvable`)

    const player: Player = {
      id: body.playerId,
      name: body.name,
      color: body.color,
      isHost: room.players.length === 0,
      imageUrl: body.imageUrl,
    }
    room.players.push(player)
    if (room.players.length >= 3) room.status = 'ready'

    echo._broadcast(`lobby.${roomId}`, 'PlayerJoined', { player })
    return { players: room.players }
  },

  async startGame(roomId: string): Promise<void> {
    await delay()
    const room = rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} introuvable`)
    room.status = 'starting'
    echo._broadcast(`lobby.${roomId}`, 'GameStarted', {})
  },

  async setDealer(roomId: string): Promise<void> {
    await delay()
    const room = rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} introuvable`)

    const n = room.players.length
    const config = GAME_CONFIG[n]
    const dealerIndex = Math.floor(Math.random() * n)

    games.set(roomId, {
      roomId,
      deck: freshDeck(),
      hands: new Map(),
      dealerIndex,
      currentPlayerIndex: (dealerIndex + 1) % n,
      cardsPerPlayer: config?.startCards ?? 5,
      trick: [],
      announcements: new Map(),
      tricksWon: new Map(room.players.map(p => [p.id, 0])),
      lives: new Map(room.players.map(p => [p.id, config?.lives ?? 10])),
      round: 1,
    })

    echo._broadcast(`game.${roomId}`, 'DealerSet', { dealerIndex })
  },

  async deal(roomId: string, callerId: string): Promise<{ hand: Card[] }> {
    await delay()
    const room = rooms.get(roomId)
    const game = games.get(roomId)
    if (!room || !game) throw new Error(`Game ${roomId} introuvable`)

    game.hands = dealHands(game.deck, room.players, game.cardsPerPlayer, game.lives)
    game.announcements.clear()
    game.tricksWon = new Map(room.players.map(p => [p.id, 0]))
    game.trick = []

    echo._broadcast(`game.${roomId}`, 'CardsDealt', { cardsPerPlayer: game.cardsPerPlayer })
    return { hand: game.hands.get(callerId) ?? [] }
  },

  async announce(
    roomId: string,
    body: { playerId: string; count: number }
  ): Promise<{ ok: boolean }> {
    await delay(50)
    const room = rooms.get(roomId)
    const game = games.get(roomId)
    if (!room || !game) throw new Error(`Game ${roomId} introuvable`)
    if (!assertCurrentPlayer(game, room, body.playerId)) return { ok: false }

    const { playerId, count } = body
    const alive = room.players.filter(p => (game.lives.get(p.id) ?? 0) > 0)
    const totalAnnounced = [...game.announcements.values()].reduce((s, v) => s + v, 0)
    const isLast = alive.length - game.announcements.size === 1

    if (isLast && count === game.cardsPerPlayer - totalAnnounced) return { ok: false }

    game.announcements.set(playerId, count)
    game.currentPlayerIndex = getNextAlivePlayerIndex(game.currentPlayerIndex, room.players, game.lives)

    echo._broadcast(`game.${roomId}`, 'PlayerAnnounced', {
      playerId,
      count,
      nextPlayerIndex: game.currentPlayerIndex,
    })

    if (game.announcements.size === alive.length) {
      echo._broadcast(`game.${roomId}`, 'AllPlayersAnnounced', {})
    }

    return { ok: true }
  },

  async playCard(
    roomId: string,
    body: { playerId: string; cardId: number; excuseValue?: 0 | 22 }
  ): Promise<void> {
    await delay()
    const room = rooms.get(roomId)
    const game = games.get(roomId)
    if (!room || !game) throw new Error(`Game ${roomId} introuvable`)
    if (!assertCurrentPlayer(game, room, body.playerId)) return

    const { playerId, cardId, excuseValue } = body
    const hand = game.hands.get(playerId) ?? []
    const cardIdx = hand.findIndex(c => c.id === cardId)
    if (cardIdx === -1) throw new Error('Carte introuvable dans la main')

    const [card] = hand.splice(cardIdx, 1)
    game.trick.push({ playerId, card, excuseValue })
    game.currentPlayerIndex = getNextAlivePlayerIndex(game.currentPlayerIndex, room.players, game.lives)

    echo._broadcast(`game.${roomId}`, 'CardPlayed', {
      playerId, card, excuseValue,
      nextPlayerIndex: game.currentPlayerIndex,
    })

    const alive = room.players.filter(p => (game.lives.get(p.id) ?? 0) > 0)
    if (game.trick.length < alive.length) return

    // ── Trick complete ────────────────────────────────────────────────────────
    const winnerId = resolveTrick(game.trick)
    game.tricksWon.set(winnerId, (game.tricksWon.get(winnerId) ?? 0) + 1)
    echo._broadcast(`game.${roomId}`, 'TrickResolved', {
      winnerId,
      trick: game.trick.map(t => t.card),
    })

    game.trick = []
    game.currentPlayerIndex = room.players.findIndex(p => p.id === winnerId)

    if (alive.some(p => (game.hands.get(p.id) ?? []).length > 0)) return

    // ── Round complete ────────────────────────────────────────────────────────
    const results: ScoringResult[] = room.players.map(p => {
      const announced  = game.announcements.get(p.id) ?? 0
      const tricksWon  = game.tricksWon.get(p.id) ?? 0
      const livesLost  = Math.abs(announced - tricksWon)
      game.lives.set(p.id, Math.max(0, (game.lives.get(p.id) ?? 0) - livesLost))
      return { id: p.id, announced, tricksWon, livesLost }
    })
    echo._broadcast(`game.${roomId}`, 'RoundScored', { results })

    const survivors = room.players.filter(p => (game.lives.get(p.id) ?? 0) > 0)

    if (survivors.length <= 2) {
      const winner = survivors.reduce((best, p) =>
        (game.lives.get(p.id) ?? 0) > (game.lives.get(best.id) ?? 0) ? p : best,
        survivors[0]
      )
      echo._broadcast(`game.${roomId}`, 'GameOver', {
        winnerId: winner?.id,
        survivors: survivors.map(p => p.id),
      })
      return
    }

    const numAlive = survivors.length as 3 | 4 | 5
    const config = GAME_CONFIG[numAlive]
    if (!config) {
      echo._broadcast(`game.${roomId}`, 'GameOver', { loserId: survivors[0]?.id })
      throw new Error(`Configuration introuvable pour ${numAlive} joueurs en vie`)
    }

    game.cardsPerPlayer = game.cardsPerPlayer === 1 ? config.startCards : game.cardsPerPlayer - 1
    game.round++
    game.dealerIndex = getNextAlivePlayerIndex(game.dealerIndex, room.players, game.lives)
    game.currentPlayerIndex = getNextAlivePlayerIndex(game.dealerIndex, room.players, game.lives)

    const { dealerIndex, currentPlayerIndex, round } = game
    setTimeout(() => {
      echo._broadcast(`game.${roomId}`, 'DealerSet', {
        dealerIndex,
        round,
        nextPlayerIndex: currentPlayerIndex,
      })
    }, 4000)
  },

  _debugRoom: (roomId: string) => ({ room: rooms.get(roomId), game: games.get(roomId) }),
}
