import { reactive, computed } from 'vue'
import type { CardId, GameState, Player } from './types'
import { cardValue } from './types'

/**
 * Moteur local du Tarot Africain (+ IA basique).
 * Il remplace ici ton store Pinia / serveur Reverb : la scène 3D ne lit que `state`
 * et n'émet que des actions (placeBet, playCard, chooseExcuse).
 */
export interface PlayerConfig {
  name: string
  color: string
  isHuman?: boolean
}

const DECK: CardId[] = [...Array.from({ length: 21 }, (_, i) => String(i + 1)), 'E']

export function useTarotGame(configs: PlayerConfig[], startLives = 10) {
  const state = reactive<GameState>({
    players: configs.map<Player>((c, i) => ({
      id: i, name: c.name, color: c.color, lives: startLives,
      hand: [], bet: null, tricks: 0, eliminated: false, isHuman: !!c.isHuman,
    })),
    me: Math.max(0, configs.findIndex((c) => c.isHuman)),
    round: 0,
    cardsPerRound: 5,
    dealer: 0,
    current: 0,
    phase: 'idle',
    blind: false,
    trick: [],
    wonPiles: configs.map(() => []),
    lastTrickWinner: null,
    results: [],
    winner: null,
  })

  let alive = true
  let aiTimer: ReturnType<typeof setTimeout> | undefined
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

  const alivePlayers = () => state.players.filter((p) => !p.eliminated)
  const maxCards = () => Math.min(5, Math.floor(22 / alivePlayers().length))

  function nextAlive(from: number) {
    const n = state.players.length
    for (let k = 1; k <= n; k++) {
      const q = (from + k) % n
      if (!state.players[q].eliminated) return q
    }
    return from
  }

  /** Le dernier à parier ne peut pas faire tomber le total des paris pile sur le nombre de cartes */
  const forbiddenBet = computed<number | null>(() => {
    if (state.phase !== 'betting') return null
    const others = alivePlayers().filter((p) => p.id !== state.current)
    if (others.some((p) => p.bet === null)) return null
    const f = state.cardsPerRound - others.reduce((s, p) => s + (p.bet ?? 0), 0)
    return f >= 0 && f <= state.cardsPerRound ? f : null
  })

  /* ---------------------------------------------------------------- */
  async function start() {
    state.players.forEach((p) => { p.lives = startLives; p.eliminated = false })
    state.round = 0
    state.winner = null
    state.dealer = Math.floor(Math.random() * state.players.length)
    await startRound()
  }

  async function startRound() {
    if (!alive) return
    state.round++
    const max = maxCards()
    const cards = max - ((state.round - 1) % max)
    state.cardsPerRound = cards
    state.blind = cards === 1
    state.trick = []
    state.wonPiles = state.players.map(() => [])
    state.results = []
    state.lastTrickWinner = null
    state.players.forEach((p) => { p.hand = []; p.bet = null; p.tricks = 0 })
    state.phase = 'dealing'
    state.current = nextAlive(state.dealer)

    const deck = [...DECK].sort(() => Math.random() - 0.5)
    for (let c = 0; c < cards; c++) {
      let p = state.dealer
      for (let k = 0; k < alivePlayers().length; k++) {
        p = nextAlive(p)
        state.players[p].hand.push(deck.pop()!)
        await wait(90)
        if (!alive) return
      }
    }
    // tri : Excuse à gauche, puis atouts croissants
    state.players.forEach((p) => p.hand.sort((a, b) => cardValue(a) - cardValue(b)))
    await wait(400)
    state.phase = 'betting'
    state.current = nextAlive(state.dealer)
    schedule()
  }

  /* ----------------------- actions ------------------------------- */
  function placeBet(p: number, bet: number) {
    if (state.phase !== 'betting' || state.current !== p) return
    if (bet < 0 || bet > state.cardsPerRound || bet === forbiddenBet.value) return
    state.players[p].bet = bet
    if (alivePlayers().every((pl) => pl.bet !== null)) {
      state.phase = 'playing'
      state.current = nextAlive(state.dealer)
    } else {
      state.current = nextAlive(p)
    }
    schedule()
  }

  function playCard(p: number, card: CardId, excuseValue?: 0 | 22) {
    if (state.current !== p || (state.phase !== 'playing' && state.phase !== 'excuse')) return
    const pl = state.players[p]
    if (!pl.hand.includes(card)) return
    if (card === 'E' && excuseValue === undefined) {
      state.phase = 'excuse' // le joueur humain doit choisir 0 ou 22
      return
    }
    pl.hand.splice(pl.hand.indexOf(card), 1)
    state.trick.push({ player: p, card, value: card === 'E' ? excuseValue! : cardValue(card) })
    state.phase = 'playing'
    if (state.trick.length === alivePlayers().length) resolveTrick()
    else { state.current = nextAlive(p); schedule() }
  }

  function chooseExcuse(v: 0 | 22) {
    if (state.phase !== 'excuse') return
    playCard(state.current, 'E', v)
  }

  /* ----------------------- résolution ---------------------------- */
  async function resolveTrick() {
    state.phase = 'trickEnd'
    const best = state.trick.reduce((a, b) => (b.value > a.value ? b : a))
    state.lastTrickWinner = best.player
    await wait(1400)
    if (!alive) return
    state.players[best.player].tricks++
    state.wonPiles[best.player].push(...state.trick.map((t) => t.card))
    state.trick = []
    if (state.players.every((p) => p.hand.length === 0)) return endRound()
    state.phase = 'playing'
    state.current = best.player
    schedule()
  }

  async function endRound() {
    state.phase = 'roundEnd'
    state.results = alivePlayers().map((p) => {
      const lost = Math.abs((p.bet ?? 0) - p.tricks)
      p.lives = Math.max(0, p.lives - lost)
      return { player: p.id, bet: p.bet ?? 0, tricks: p.tricks, lost }
    })
    await wait(3600)
    if (!alive) return
    state.players.forEach((p) => { if (p.lives <= 0) p.eliminated = true })
    const left = alivePlayers()
    if (left.length <= 1) {
      state.winner = left[0]?.id ?? null
      state.phase = 'gameOver'
      return
    }
    state.dealer = nextAlive(state.dealer)
    startRound()
  }

  /* ----------------------- IA ------------------------------------ */
  function schedule() {
    clearTimeout(aiTimer)
    const p = state.players[state.current]
    if (!alive || p.isHuman) return
    aiTimer = setTimeout(() => aiAct(p.id), 700 + Math.random() * 800)
  }

  function aiAct(p: number) {
    if (!alive || state.current !== p) return
    if (state.phase === 'betting') placeBet(p, aiBet(p))
    else if (state.phase === 'playing') {
      const { card, excuse } = aiChoose(p)
      playCard(p, card, excuse)
    }
  }

  function aiBet(p: number) {
    const pl = state.players[p]
    const opponents = alivePlayers().length - 1
    let est = 0
    if (state.blind) {
      // voit les cartes des autres, pas la sienne
      const visible = alivePlayers().filter((o) => o.id !== p).map((o) => o.hand[0])
      const maxVisible = Math.max(...visible.map((c) => (c === 'E' ? 11 : cardValue(c))))
      const pool = DECK.filter((c) => !visible.includes(c))
      const beats = pool.filter((c) => c === 'E' || cardValue(c) > maxVisible).length
      est = beats / pool.length > 0.5 ? 1 : 0
    } else {
      for (const c of pl.hand) est += c === 'E' ? 0.5 : Math.pow((cardValue(c) - 1) / 21, opponents)
    }
    let bet = Math.max(0, Math.min(state.cardsPerRound, Math.round(est)))
    if (bet === forbiddenBet.value) bet = bet > 0 && (Math.random() < 0.5 || bet === state.cardsPerRound) ? bet - 1 : bet + 1
    return bet
  }

  function aiChoose(p: number): { card: CardId; excuse?: 0 | 22 } {
    const pl = state.players[p]
    const need = (pl.bet ?? 0) - pl.tricks
    const best = state.trick.reduce((m, t) => Math.max(m, t.value), -1)
    if (pl.hand.includes('E')) {
      if (need > 0 && best < 22) return { card: 'E', excuse: 22 }
      if (need <= 0) return { card: 'E', excuse: 0 }
    }
    const atouts = pl.hand.filter((c) => c !== 'E').sort((a, b) => cardValue(a) - cardValue(b))
    if (!atouts.length) return { card: 'E', excuse: need > 0 ? 22 : 0 }
    if (need > 0) {
      if (!state.trick.length) return { card: atouts[atouts.length - 1] }
      const winner = atouts.find((c) => cardValue(c) > best)
      return { card: winner ?? atouts[0] }
    }
    const losers = atouts.filter((c) => cardValue(c) < best)
    return { card: losers.length ? losers[losers.length - 1] : atouts[0] }
  }

  function dispose() {
    alive = false
    clearTimeout(aiTimer)
  }

  return { state, forbiddenBet, start, placeBet, playCard, chooseExcuse, dispose }
}
