import { defineStore } from 'pinia'
import { GAME_CONFIG } from '../data/gameConfig'
import { Player } from '../models/Player'
import { Card } from '../models/Card'
import { Phase } from '../models/Phase'

import { echo } from '@/api/echo'
import apiTarot from '../api'
import appApi from '@/api/appApi'
import { useLobbyStore } from './useLobbyStore'

// Palette de secours (le backend ne renvoie pas toujours de couleur par joueur)
const PLAYER_COLORS = ['#29a8e0', '#f0435f', '#3fb56b', '#f29a2e', '#9b5de5']

// Les events backend envoient playerId en string ; on compare toujours en string.
const sameId = (a: unknown, b: unknown) => String(a) === String(b)


// type Phase = 'rolling' | 'dealing' | 'announcing' | 'playing' | 'scoring' | 'gameover'


export const useGameStore = defineStore('game', {
  state: () => ({
    // chaque joueur a un id, name, color, 10 vies, un nombre de pli, ses pli gagnées et sa main
    players: [] as Player[],
    // id de celui qui distribue
    dealer: 0,
    // id de qui joue
    currentPlayerIndex: 0,
    // round
    currentRound: 1,
    // combien de carte recu manche
    cardsPerPlayer: 0,
    // les différents états (liste la haut)
    phase: Phase.Rolling as Phase,
    // les cartes posé de la pli en cours ( id, carte, value excuse)
    trick: [] as { playerId: string; card: Card; excuseValue?: 0 | 22 }[],
    // plis manche en cours
    trickHistory: [] as any[],
    // résumé ki joué koi
    roundHistory: [] as any[],
    // échéance du tour courant, en horloge CLIENT (ms). 0 = pas de minuteur.
    turnEndsAt: 0,
    // room dont les données sont actuellement chargées (pour distinguer reprise vs nouvelle partie)
    loadedRoomId: '',
    loadedRoomCode: '',
  }),

  getters: {
    // nb carte distribué manche
    totalCardsThisRound: (state) => state.cardsPerPlayer,

    // nb carte annoncé
    totalAnnounced: (state) => state.players.reduce((sum, p) => sum + (p.announced ?? 0), 0),

    // joueur courant
    currentPlayer: (state) => state.players[state.currentPlayerIndex],

    // joueurs en vie
    activePlayers: (state) => state.players.filter(p => p.isAlive),

    // sequence basé sur survivant
    roundSequence: (state): number[] => {
      const aliveCount = state.players.filter(p => p.isAlive).length
      const start = GAME_CONFIG[aliveCount as 3 | 4 | 5]?.startCards ?? 5
      return Array.from({ length: start }, (_, i) => start - i)
    },

    // check last round
    isLastCardRound: (state) => state.cardsPerPlayer === 1,
  },

  actions: {
    initGameListeners(roomId: string) {
      const lobby = useLobbyStore()
      const channel = echo.channel(`game.${roomId}`)

      channel.listen('DealerSet', async (data: any) => {
        this.trick = []
          this.players.forEach(p => {
            p.announced = null
            p.tricksWon = 0
            ;(p as any).wonCount = 0
            p.hand = []
          })

        this.dealer = data.dealerIndex
        this.currentRound = data.round ?? this.currentRound
        this.currentPlayerIndex = data.nextPlayerIndex ?? (data.dealerIndex + 1) % this.players.length
        this.phase = Phase.Dealing
        this.turnEndsAt = 0

        // Chaque client demande sa main : le 1er appel distribue à tous et déclenche CardsDealt
        const res = await apiTarot.getTarotHand(lobby.roomId)
        const hand = res.success ? res.data.hand : []
        const me = this.players.find(p => sameId(p.id, lobby.myId))
        if (me) me.hand = hand
        // order
        // this.players.forEach(p => {
          // console.log('init hand for', p.name)
        // })
        // console.log('dealer = ', this.players[this.dealer].name)
      })

      channel.listen('CardsDealt', async (data: any) => {
        this.cardsPerPlayer = data.cardsPerPlayer
        this.players.forEach(p => {
          if (!sameId(p.id, lobby.myId)) {
            p.hand = Array(data.cardsPerPlayer).fill(null)
          }
        })
        this.phase = Phase.Announcing
        // filet : si on a raté DealerSet, on récupère notre vraie main maintenant
        const me = this.players.find(p => sameId(p.id, lobby.myId))
        if (me && !(me.hand && me.hand.some((c: any) => c != null))) {
          const res = await apiTarot.getTarotHand(lobby.roomId)
          if (res.success) me.hand = res.data.hand
        }
      })

      channel.listen('PlayerAnnounced', (data: any) => {
        const player = this.players.find(p => sameId(p.id, data.playerId))
        if (player) player.announced = data.count
        this.currentPlayerIndex = data.nextPlayerIndex
      })

      channel.listen('AllPlayersAnnounced', () => {
        this.phase = Phase.Playing
      })

      channel.listen('CardPlayed', (data: any) => {
        this.trick.push({ playerId: data.playerId, card: data.card, excuseValue: data.excuseValue ?? undefined })
        const player = this.players.find(p => sameId(p.id, data.playerId))
        // retire carte
        if (player && player.hand) {
          if (sameId(player.id, lobby.myId)) {
            player.hand = player.hand.filter(c => c?.id !== data.card.id)
          } else {
            player.hand = player.hand.slice(1)
          }
        }
        this.currentPlayerIndex = data.nextPlayerIndex
      })

      channel.listen('TrickResolved', (data: any) => {
        this.phase = Phase.Resolving
        setTimeout(() => {
          this.trick = []
          const winner = this.players.find(p => sameId(p.id, data.winnerId))
          if (winner) {
            winner.tricksWon++
            ;(winner as any).wonCount = ((winner as any).wonCount ?? 0) + (data.trick?.length ?? 0)
            this.currentPlayerIndex = this.players.findIndex(p => sameId(p.id, data.winnerId))
          }

          const hasCardsLeft = this.currentPlayer && this.currentPlayer.hand && this.currentPlayer.hand.length > 0
          if (hasCardsLeft) {
            this.phase = Phase.Playing
          } else {
            // attend 'RoundScored' ou 'GameOver'
            this.phase = Phase.Scoring
          }

          this.phase = Phase.Playing
        }, 2000)
      })

      channel.listen('RoundScored', (data: any) => {
        this.phase = Phase.Scoring
        data.results.forEach((result: any) => {
          const player = this.players.find(p => sameId(p.id, result.id))
          if (player) {
            player.lives = Math.max(0, player.lives - result.livesLost)

            if (player.lives <= 0) {
              player.isAlive = false
              console.log(`[GAME] Le joueur ${player.name} n'a plus de vie ! (isAlive = false)`)
            }

            player.announced = null
            player.tricksWon = 0
            ;(player as any).wonCount = 0
          }
        })
        this.roundHistory.push(data.results)
      })

      channel.listen('GameOver', (data: any) => {
        this.phase = Phase.GameOver
        this.turnEndsAt = 0
      })

      // Minuteur du tour : l'IA prend le relais à l'échéance.
      // On ancre la deadline sur l'horloge CLIENT via la durée restante côté serveur.
      channel.listen('TurnStarted', (data: any) => {
        this.currentPlayerIndex = data.currentPlayerIndex
        const remaining = Math.max(0, (data.deadline ?? 0) - (data.serverNow ?? 0))
        this.turnEndsAt = remaining > 0 ? Date.now() + remaining : 0
      })

      // Présence générique : un joueur est parti (away) ou revenu → affichage icône IA.
      channel.listen('PlayerPresenceChanged', (data: any) => {
        const player = this.players.find(p => sameId(p.id, data.playerId))
        if (player) (player as any).away = !!data.away
      })
    },

    /** Charge l'état de présence (qui est "away") depuis le backend générique. */
    async hydratePresence() {
      const lobby = useLobbyStore()
      const res = await appApi.getRoomPresence(lobby.roomId)
      if (!res.success) return
      const away: string[] = (res.data?.away ?? []).map(String)
      this.players.forEach((p: any) => { p.away = away.includes(String(p.id)) })
    },

    async playCard(cardId: number, excuseValue: number | null = null) {
      const lobby = useLobbyStore()
      await apiTarot.playTarotCard(lobby.roomId, cardId, excuseValue)
    },

    async sendAnnounce(count: number) {
      const lobby = useLobbyStore()
      try {
        const response = await apiTarot.announceTricks(lobby.roomId, count)
        return response.success
      } catch (error) {
        console.error("Erreur critique pendant l'annonce :", error)
        return false
      }
    },

    /** Applique un snapshot /state au store (joueurs + état). Idempotent (resync). */
    applyState(payload: any) {
      const lobby = useLobbyStore()
      const { room, myId, state } = payload

      lobby.roomId = room.id
      lobby.roomCode = room.code
      lobby.myId = myId
      lobby.isHost = room.players?.find((p: any) => sameId(p.id, myId))?.pivot?.is_host ?? false
      this.loadedRoomId = String(room.id)
      this.loadedRoomCode = String(room.code)

      // on préserve les flags "away" déjà connus (un resync /state ne doit pas les effacer)
      const prevAway = new Map(this.players.map((p: any) => [String(p.id), !!p.away]))

      const orderedPlayers: any[] = room.players ?? []
      this.players = orderedPlayers.map((p, i) => {
        const pid = String(p.id)
        const lives = state?.lives?.[pid] ?? 10
        const mine = sameId(pid, myId)
        let hand: any[] = []
        if (state) {
          hand = mine
            ? (state.myHand ?? [])
            : Array(state.handCounts?.[pid] ?? 0).fill(null)
        }
        return {
          id: pid,
          name: p.firstname,
          color: p.pivot?.color ?? PLAYER_COLORS[i % PLAYER_COLORS.length],
          imageUrl: '',
          hand,
          announced: state?.announcements?.[pid] ?? null,
          tricksWon: state?.tricksWon?.[pid] ?? 0,
          // nb de cartes gagnées cette manche (approx au refresh : plis × nb joueurs)
          wonCount: (state?.tricksWon?.[pid] ?? 0) * orderedPlayers.length,
          lives,
          isAlive: lives > 0,
          away: prevAway.get(pid) ?? false,
        }
      }) as any

      if (state) {
        this.currentRound = state.round ?? 1
        this.dealer = state.dealerIndex ?? 0
        this.currentPlayerIndex = state.currentPlayerIndex ?? 0
        this.cardsPerPlayer = state.cardsPerPlayer ?? 0
        this.phase = state.phase === 'finished' ? Phase.GameOver : (state.phase as Phase) ?? Phase.Dealing
        this.trick = (state.trick ?? []).map((t: any) => ({
          playerId: t.playerId,
          card: t.card,
          excuseValue: t.excuseValue ?? undefined,
        }))
        // minuteur du tour : la deadline serveur est réancrée sur l'horloge client
        const remaining = Math.max(0, (state.turnDeadline ?? 0) - (state.serverNow ?? 0))
        this.turnEndsAt = remaining > 0 ? Date.now() + remaining : 0
      } else {
        // Partie lancée mais donneur pas encore désigné
        this.phase = Phase.Dealing
        this.turnEndsAt = 0
      }
    },

    /** Récupère /state et l'applique (sans toucher aux abonnements). */
    async fetchState(roomCode: string) {
      const res = await apiTarot.getState(roomCode)
      if (!res.success) {
        console.error('[game] /state a échoué', res.message)
        return false
      }
      this.applyState(res.data)
      return true
    },

    /** Repart propre pour une AUTRE room : quitte l'ancien canal et réinitialise l'état. */
    resetForNewRoom() {
      if (this.loadedRoomId) {
        try { echo.leave(`game.${this.loadedRoomId}`) } catch { /* ignore */ }
      }
      this.$reset()
    },

    /**
     * Hydrate le store depuis le backend réel puis abonne aux events temps réel.
     * Robuste au refresh : l'écran de jeu est auto-suffisant à partir du code de room.
     */
    async hydrate(roomCode: string) {
      const ok = await this.fetchState(roomCode)
      if (!ok) return false
      const lobby = useLobbyStore()
      this.initGameListeners(String(lobby.roomId))
      return true
    },

    /** Vrai si le joueur courant a reçu de vraies cartes (pas juste des dos masqués). */
    hasMyHand() {
      const lobby = useLobbyStore()
      const me = this.players.find(p => sameId(p.id, lobby.myId))
      return !!(me && me.hand && me.hand.length > 0 && me.hand.some((c: any) => c != null))
    },

    /**
     * Filet anti-course : un joueur qui s'abonne APRÈS la distribution rate
     * DealerSet/CardsDealt (Reverb ne rejoue pas). On resynchronise /state en boucle
     * bornée jusqu'à récupérer notre main, puis on s'arrête.
     */
    async ensureDealt(roomCode: string, tries = 6, delayMs = 1200) {
      for (let i = 0; i < tries; i++) {
        if (this.hasMyHand()) return
        await new Promise(r => setTimeout(r, delayMs))
        if (this.hasMyHand()) return
        await this.fetchState(roomCode)
      }
    },
  }
})

