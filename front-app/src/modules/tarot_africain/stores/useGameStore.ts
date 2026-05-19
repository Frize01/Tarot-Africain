import { defineStore } from 'pinia'
import { GAME_CONFIG } from '../data/gameConfig'
import { Player } from '../models/Player'
import { Card } from '../models/Card'
import { Phase } from '../models/Phase'

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
    totalCardsThisRound: (state) => state.cardsPerPlayer ,
    // nb carte annoncé
    totalAnnounced: (state) => state.players.reduce((sum, p) => sum + (p.announced ?? 0), 0),
    // joueur courant ( plus simple que d'appeler players[xxx] partous)
    currentPlayer: (state) => state.players[state.currentPlayerIndex],
    // joeuurs en vie
    activePlayers: (state) => state.players.filter(p => p.isAlive),
    // défini sequence en fonction joueurs (ex si 5 => 4,3,2,1, si 4=>5,4,3,2,1)
    roundSequence: (state): number[] => {
      const start = GAME_CONFIG[state.players.length]?.startCards ?? 5
      return Array.from({ length: start }, (_, i) => start - i)
    },
    // check last round
    isLastCardRound: (state) => state.cardsPerPlayer === 1,
  },

  actions: {
    // TODO: brancher API (recois joueurs et add champs)
    // recois joueurs du lobby ajoute champs (vie, annonces ...)
    initGame(players: { id: string; name: string; color: string }[]) {
      const config = GAME_CONFIG[players.length]
      this.players = players.map(p => new Player(p.id, p.name, p.color, config.lives))
      this.cardsPerPlayer = config.startCards
      this.currentRound = 0
      this.phase = Phase.Rolling
    },
    // TODO: brancher API (le serveur tire le dé et broadcast le dealer)
    // choisi distributeur et first joueur
    setDealer(index: number) {
      this.dealer = index
      this.currentPlayerIndex = (index + 1) % this.players.length
    },
    // TODO: brancher API (les mains viennent du serveur)
    // recois les mains du deck store, reset annonces et plis gagnés, set phase à annonce
    dealCards(hands: Card[][]) {
      this.players.forEach((p, i) => {
        p.resetForRound()
        p.hand = hands[i]
      })
      this.trick = []
      this.trickHistory = []
      this.phase = Phase.Announcing
      this.currentPlayerIndex = (this.dealer + 1) % this.players.length
    },
    // TODO: appel API, le serveur valide et broadcast
    // gestion des annonces et check interdiction last
    announce(playerId: string, count: number): boolean {
      const player = this.players.find(p => p.id === playerId)
      if (!player) return false

      const isLast = this.players.filter(p => !p.hasAnnounced).length === 1
      if (isLast) {
        const forbidden = this.totalCardsThisRound - this.totalAnnounced
        if (count === forbidden) return false
      }

      player.announced = count
      this._nextPlayer()

      if (this.players.every(p => p.hasAnnounced)) {
        this.phase = Phase.Playing
        this.currentPlayerIndex = (this.dealer + 1) % this.players.length
      }
      return true
    },
    // TODO: appel API, le back broadcast
    // joue un carte, check si fin de pli, sinon change joueur courant
    playCard(playerId: string, card: Card, excuseValue?: 0 | 22) {
      const player = this.players.find(p => p.id === playerId)
      if (!player) return

      player.hand = player.hand.filter(c => c.id !== card.id)
      this.trick.push({ playerId, card, excuseValue })

      if (this.trick.length === this.players.length) {
        this._resolveTrick()
      } else {
        this._nextPlayer()
      }
    },
    // TODO: calcule coté back, on reçoit juste le résultat et applique
    // applique le score du round
    applyScoring() {
      this.players.forEach(p => {
        const diff = Math.abs((p.announced ?? 0) - p.tricksWon)
        p.lives -= diff
        if (p.lives < 0) p.lives = 0
      })

      this.roundHistory.push({
        round: this.currentRound,
        cardsPerPlayer: this.cardsPerPlayer,
        results: this.players.map(p => ({
          id: p.id,
          announced: p.announced,
          tricksWon: p.tricksWon,
          livesLost: p.applyPenalty(),
        }))
      })

      if (this.activePlayers.length <= 1) {
        this.phase = Phase.GameOver
        return
      }

      this._nextRound()
    },
    // TODO: supprimer, logique back
    // check le vainqueur, ajoute historique pli
    _resolveTrick() {
      const winner = this.trick.reduce((best, play) => {
        const val = play.card.getEffectiveValue(play.excuseValue)
        const bestVal = best.card.getEffectiveValue(best.excuseValue)
        return val > bestVal ? play : best
      })

      const winnerPlayer = this.players.find(p => p.id === winner.playerId)
      if (winnerPlayer) winnerPlayer.tricksWon++

      this.trickHistory.push({ trick: [...this.trick], winnerId: winner.playerId })
      this.trick = []

      if (this.players.every(p => p.hand.length === 0)) {
        this.phase = Phase.Scoring
      } else {
        this.currentPlayerIndex = this.players.findIndex(p => p.id === winner.playerId)
      }
    },
    // TODO: supprimer, logique back
    // passe manche suivante, change distributeur, reset annonces et plis gagnés
    _nextRound() {
      const nextCards = this.roundSequence[this.currentRound]
      if (!nextCards) {
        this.phase = Phase.GameOver
        return
      }
      this.cardsPerPlayer = nextCards
      this.currentRound++
      this.dealer = (this.dealer - 1 + this.players.length) % this.players.length
      this.phase = Phase.Dealing
    },
    // TODO: supprimer, logique back
    // change joueurs suivant
    _nextPlayer() {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    },
  }
})

