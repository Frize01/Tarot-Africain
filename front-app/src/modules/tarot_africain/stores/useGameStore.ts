import { defineStore } from 'pinia'
import { GAME_CONFIG } from '../data/gameConfig'
import { Card } from '../models/Card'
import { Phase } from '../models/Phase'

import apiMethods from '@/api'
import { echo } from '@/api/echo'
import { useLobbyStore } from './useLobbyStore'


// Représentation d'un joueur côté jeu (dérivée des joueurs du lobby + état de manche).
// Les mains adverses sont masquées : on stocke des null tant qu'on ne connaît pas la carte.
export interface GamePlayer {
  id: string
  name: string
  color: string
  imageUrl?: string
  isHost: boolean
  hand: (Card | null)[]
  announced: number | null
  tricksWon: number
  lives: number
  isAlive: boolean
}

// Les ids joueurs viennent du back en string ((string) user->id).
// On normalise partout pour éviter les comparaisons number/string qui échouent.
const sameId = (a: unknown, b: unknown) => String(a) === String(b)


export const useGameStore = defineStore('game', {
  state: () => ({
    // chaque joueur a un id, name, color, 10 vies, un nombre de pli, ses pli gagnées et sa main
    players: [] as GamePlayer[],
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
    // rempli à la fin de partie (GameOver)
    gameOverData: null as { winnerId: string | null; survivors: string[] } | null,
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

      // évite les abonnements en double (re-mount, HMR…)
      echo.leave(`game.${roomId}`)
      const channel = echo.channel(`game.${roomId}`)

      channel.listen('.DealerSet', async (data: any) => {
        this.trick = []
        this.players.forEach(p => {
          p.announced = null
          p.tricksWon = 0
          p.hand = []
        })

        this.dealer = data.dealerIndex
        this.currentRound = data.round ?? this.currentRound
        this.currentPlayerIndex = data.nextPlayerIndex ?? (data.dealerIndex + 1) % this.players.length
        this.phase = Phase.Dealing

        // chaque client récupère SA main via HTTP (les autres mains ne sont pas exposées)
        const response = await apiMethods.getTarotHand(roomId)
        if (response.success) {
          const hand: Card[] = response.data?.hand ?? []
          const me = this.players.find(p => sameId(p.id, lobby.myId))
          if (me) me.hand = hand
        } else {
          console.error('Échec de la distribution :', response.message)
        }
      })

      channel.listen('.CardsDealt', (data: any) => {
        this.cardsPerPlayer = data.cardsPerPlayer
        this.players.forEach(p => {
          if (!sameId(p.id, lobby.myId)) {
            p.hand = Array(data.cardsPerPlayer).fill(null)
          }
        })
        this.phase = Phase.Announcing
      })

      channel.listen('.PlayerAnnounced', (data: any) => {
        const player = this.players.find(p => sameId(p.id, data.playerId))
        if (player) player.announced = data.count
        this.currentPlayerIndex = data.nextPlayerIndex
      })

      channel.listen('.AllPlayersAnnounced', () => {
        this.phase = Phase.Playing
      })

      channel.listen('.CardPlayed', (data: any) => {
        this.trick.push({ playerId: data.playerId, card: data.card, excuseValue: data.excuseValue })
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

      channel.listen('.TrickResolved', (data: any) => {
        this.phase = Phase.Resolving
        setTimeout(() => {
          this.trick = []
          const winner = this.players.find(p => sameId(p.id, data.winnerId))
          if (winner) {
            winner.tricksWon++
            this.currentPlayerIndex = this.players.findIndex(p => sameId(p.id, data.winnerId))
          }

          const hasCardsLeft = this.currentPlayer && this.currentPlayer.hand && this.currentPlayer.hand.length > 0
          // si des cartes restent on rejoue, sinon on attend RoundScored / GameOver
          this.phase = hasCardsLeft ? Phase.Playing : Phase.Scoring
        }, 2000)
      })

      channel.listen('.RoundScored', (data: any) => {
        this.phase = Phase.Scoring
        data.results.forEach((result: any) => {
          const player = this.players.find(p => sameId(p.id, result.id))
          if (player) {
            // le back fait foi sur les vies restantes
            player.lives = result.livesRemaining ?? Math.max(0, player.lives - result.livesLost)

            if (player.lives <= 0) {
              player.isAlive = false
              console.log(`[GAME] Le joueur ${player.name} n'a plus de vie ! (isAlive = false)`)
            }

            player.announced = null
            player.tricksWon = 0
          }
        })
        this.roundHistory.push(data.results)
      })

      channel.listen('.GameOver', (data: any) => {
        this.phase = Phase.GameOver
        this.gameOverData = {
          winnerId: data.winnerId ?? null,
          survivors: data.survivors ?? [],
        }
      })
    },

    async playCard(cardId: number, excuseValue: 0 | 22 | null = null) {
      const lobby = useLobbyStore()
      const response = await apiMethods.playTarotCard(lobby.roomId, cardId, excuseValue)
      if (!response.success) {
        console.error('Impossible de jouer la carte :', response.message)
      }
      return response.success
    },

    async sendAnnounce(count: number) {
      const lobby = useLobbyStore()
      try {
        const response = await apiMethods.announceTricks(lobby.roomId, count)
        // 400 = annonce invalide (règle du dernier / pas votre tour)
        return response.success
      } catch (error) {
        console.error("Erreur critique pendant l'annonce :", error)
        return false
      }
    },

    leaveGameListeners(roomId: string) {
      echo.leave(`game.${roomId}`)
    },
  },
})
