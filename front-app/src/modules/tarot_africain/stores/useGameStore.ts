import { defineStore } from 'pinia'
import { GAME_CONFIG } from '../data/gameConfig'
import { Player } from '../models/Player'
import { Card } from '../models/Card'
import { Phase } from '../models/Phase'

import { api, echo } from '@/api/mockApi'
import { useLobbyStore } from './useLobbyStore'


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
            p.hand = []
          })

        this.dealer = data.dealerIndex
        this.currentRound = data.round ?? this.currentRound
        this.currentPlayerIndex = (data.dealerIndex + 1) % this.players.length
        this.phase = Phase.Dealing

        // TODO: bouger vers une channel privé
        const { hand } = await api.deal(roomId, lobby.myId)
        const me = this.players.find(p => p.id === lobby.myId)
        if (me) me.hand = hand
        // order
        // this.players.forEach(p => {
          // console.log('init hand for', p.name)
        // })
        // console.log('dealer = ', this.players[this.dealer].name)
      })

      channel.listen('CardsDealt', (data: any) => {
        this.cardsPerPlayer = data.cardsPerPlayer
        this.players.forEach(p => {
          if (p.id !== lobby.myId) {
            p.hand = Array(data.cardsPerPlayer).fill(null)
          }
        })
        this.phase = Phase.Announcing
      })

      channel.listen('PlayerAnnounced', (data: any) => {
        const player = this.players.find(p => p.id === data.playerId)
        if (player) player.announced = data.count
        this.currentPlayerIndex = data.nextPlayerIndex
      })

      channel.listen('AllPlayersAnnounced', () => {
        this.phase = Phase.Playing
      })

      channel.listen('CardPlayed', (data: any) => {
        this.trick.push({ playerId: data.playerId, card: data.card })
        const player = this.players.find(p => p.id === data.playerId)
        // retire carte
        if (player && player.hand) {
          if (player.id === lobby.myId) {
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
          const winner = this.players.find(p => p.id === data.winnerId)
          if (winner) {
            winner.tricksWon++
            this.currentPlayerIndex = this.players.findIndex(p => p.id === data.winnerId)
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
          const player = this.players.find(p => p.id === result.id)
          if (player) {
            player.lives = Math.max(0, player.lives - result.livesLost)

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

      channel.listen('GameOver', (data: any) => {
        this.phase = Phase.GameOver
      })
    },

    async playCard(cardId: number) {
      const lobby = useLobbyStore()
      await api.playCard(lobby.roomId, { playerId: lobby.myId, cardId })
    },

    async sendAnnounce(count: number) {
      const lobby = useLobbyStore()
      try {
        const response = await api.announce(lobby.roomId, { playerId: lobby.myId, count })
        return response.ok
      } catch (error) {
        console.error("Erreur critique pendant l'annonce :", error)
        return false
      }
    }
  }
})

