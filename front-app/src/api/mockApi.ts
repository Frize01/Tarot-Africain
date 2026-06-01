  import { Card } from '@/modules/tarot_africain/models/Card'
  import { GAMES_DATA } from '@/modules/tarot_africain/data/games'
  import { GAME_CONFIG } from '@/modules/tarot_africain/data/gameConfig'

  function assertCurrentPlayer(game: GameState, room: RoomState, playerId: string): boolean {
    const expectedIndex = room.players.findIndex(p => p.id === playerId)
    if (game.currentPlayerIndex !== expectedIndex) {
      console.warn(`Warning: action from ${playerId} but current player is ${room.players[game.currentPlayerIndex]?.name} (index ${game.currentPlayerIndex})`)
      return false
    }
    return true
  }

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
      setTimeout(() => listeners.forEach(fn => fn(data)), 80)
    }
  }

  const bus = new MockEventBus()

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

  export const echo = {
    channel(name: string): MockChannel { return new MockChannel(name) },
    join(name: string): MockChannel { return new MockChannel(name) },
    _broadcast(channel: string, event: string, data: unknown) {
      bus.emit(channel, event, data)
    },
  }

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

  function resolveTrick(trick: { playerId: string; card: Card; excuseValue?: 0 | 22 }[]): string {
    return trick.reduce((best, play) => {
      const val = play.card.getEffectiveValue(play.excuseValue)
      const bestVal = best.card.getEffectiveValue(best.excuseValue)
      return val > bestVal ? play : best
    }).playerId
  }

  function delay(ms = 120): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  export const api = {
    async createRoom(): Promise<{ roomId: string }> {
      await delay()
      const roomId = generateRoomId()
      rooms.set(roomId, { roomId, players: [], status: 'waiting' })
      return { roomId }
    },

    async joinRoom(roomId: string, body: { playerId: string; name: string; color: string, imageUrl: string }): Promise<{ players: Player[] }> {
      await delay()
      const room = rooms.get(roomId)
      if (!room) throw new Error(`Room ${roomId} introuvable`)

      const isHost = room.players.length === 0
      const player: Player = { id: body.playerId, name: body.name, color: body.color, isHost, imageUrl: body.imageUrl }
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

      const dealerIndex = Math.floor(Math.random() * room.players.length)
      const n = room.players.length
      const config = GAME_CONFIG[n]
      const cardsPerPlayer = config ? config.startCards : 5
      const initialLives = config ? config.lives : 10
      console.log(`Dealer for room ${roomId} is ${room.players[dealerIndex].name} (index ${dealerIndex}). Starting with ${cardsPerPlayer} cards per player.`)

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
        lives: new Map(room.players.map(p => [p.id, initialLives])),
        round: 1,
      })

      echo._broadcast(`game.${roomId}`, 'DealerSet', { dealerIndex })
    },

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
      return { hand: game.hands.get(callerId) ?? [] }
    },

    async announce(roomId: string, body: { playerId: string; count: number }): Promise<{ ok: boolean }> {
      await delay(50)
      const room = rooms.get(roomId)
      const game = games.get(roomId)
      if (!room || !game) throw new Error(`Game ${roomId} introuvable`)
      if (!assertCurrentPlayer(game, room, body.playerId)) {
        return { ok: false }
      }

      const { playerId, count } = body
      const totalAnnounced = [...game.announcements.values()].reduce((s, v) => s + v, 0)
      const remaining = room.players.length - game.announcements.size
      const isLast = remaining === 1

      console.log(`${playerId} => ${count}. reste ${game.cardsPerPlayer - totalAnnounced} cartes et ${remaining-1} joueurs`)

      if (isLast && count === game.cardsPerPlayer - totalAnnounced) {
        console.log(`Annonce refusée pour ${playerId} car il est le dernier à annoncer et ne peut pas faire ${count} (total serait ${totalAnnounced + count})`)

        return { ok: false }
      }

      game.announcements.set(playerId, count)
      const nextPlayerIndex = (game.currentPlayerIndex + 1) % room.players.length
      game.currentPlayerIndex = nextPlayerIndex
      echo._broadcast(`game.${roomId}`, 'PlayerAnnounced', { playerId, count, nextPlayerIndex })

      if (game.announcements.size === room.players.length) {
        console.log(`Tous les joueurs ont annoncé. Démarrage de la phase de jeu pour la room ${roomId}.`)
        echo._broadcast(`game.${roomId}`, 'AllPlayersAnnounced', {})
      }

      return { ok: true }
    },

    async playCard(roomId: string, body: { playerId: string; cardId: number; excuseValue?: 0 | 22 }): Promise<void> {
      // console.log(`Player ${body.playerId} attempts to play card ${body.cardId} with excuse value ${body.excuseValue} in room ${roomId}`)
      await delay()
      const room = rooms.get(roomId)
      const game = games.get(roomId)
      if (!room || !game) throw new Error(`Game ${roomId} introuvable`)

      // check si c'est son tour
      if (!assertCurrentPlayer(game, room, body.playerId)) {
        return
      }

      const { playerId, cardId, excuseValue } = body
      const hand = game.hands.get(playerId) ?? []
      const cardIdx = hand.findIndex(c => c.id === cardId)
      if (cardIdx === -1) throw new Error('Carte introuvable dans la main')

      const [card] = hand.splice(cardIdx, 1)

      game.trick.push({ playerId, card, excuseValue })
      const nextPlayerIndex = (game.currentPlayerIndex + 1) % room.players.length
      game.currentPlayerIndex = nextPlayerIndex

      echo._broadcast(`game.${roomId}`, 'CardPlayed', { playerId, card, excuseValue,nextPlayerIndex })

      if (game.trick.length === room.players.length) {
        const winnerId = resolveTrick(game.trick)
        game.tricksWon.set(winnerId, (game.tricksWon.get(winnerId) ?? 0) + 1)

        console.log(`Trick resolved for room ${roomId}. Winner: ${winnerId}. Trick cards:`, game.trick)
        echo._broadcast(`game.${roomId}`, 'TrickResolved', {
          winnerId,
          trick: game.trick.map(t => t.card),
        })

        game.trick = []
        game.currentPlayerIndex = room.players.findIndex(p => p.id === winnerId)

        const handsEmpty = [...game.hands.values()].every(h => h.length === 0)
        if (handsEmpty) {
          const results: ScoringResult[] = room.players.map(p => {
            const announced = game.announcements.get(p.id) ?? 0
            const tricksWon = game.tricksWon.get(p.id) ?? 0
            const livesLost = Math.abs(announced - tricksWon)
            const prev = game.lives.get(p.id) ?? 0
            game.lives.set(p.id, Math.max(0, prev - livesLost))

            console.log(`Player ${p.name} announced ${announced}, won ${tricksWon}, loses ${livesLost} lives (remaining: ${game.lives.get(p.id)})`)

            return { id: p.id, announced, tricksWon, livesLost }
          })

          echo._broadcast(`game.${roomId}`, 'RoundScored', { results })

          const alive = room.players.filter(p => (game.lives.get(p.id) ?? 0) > 0)

          if (alive.length <= 1) {
            const winnerId = alive[0]?.id ?? null
            echo._broadcast(`game.${roomId}`, 'GameOver', { winnerId })
            return
          }

          const numPlayers = room.players.length as 3 | 4 | 5
          const config = GAME_CONFIG[numPlayers]

          if (!config) {
            throw new Error(`Configuration introuvable pour ${numPlayers} joueurs`)
          }

          const nextCards = config.startCards - game.round

          if (nextCards < 1) {
            const winner = alive.reduce((best, p) => {
              const pLives = game.lives.get(p.id) ?? 0
              const bestLives = game.lives.get(best.id) ?? 0
              return pLives > bestLives ? p : best
            }, alive[0])

            echo._broadcast(`game.${roomId}`, 'GameOver', { winnerId: winner?.id ?? null })
            return
          }

          game.cardsPerPlayer = nextCards
          game.round++
          game.dealerIndex = (game.dealerIndex + 1 + room.players.length) % room.players.length
          game.currentPlayerIndex = (game.dealerIndex + 1) % room.players.length

          const nextDealerIndex = game.dealerIndex
          const nextRound = game.round

          setTimeout(() => {
            echo._broadcast(`game.${roomId}`, 'DealerSet', {
              dealerIndex: nextDealerIndex,
              round: nextRound,
            })
          }, 3000)

        }
      }
    },

    _debugRoom(roomId: string) {
      return { room: rooms.get(roomId), game: games.get(roomId) }
    }
  }
