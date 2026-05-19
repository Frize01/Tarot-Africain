import { defineStore } from 'pinia'
import { GAMES_DATA } from '../data/games'
import { Card } from '../models/Card'

// TODO: déplacer coté back ( dégager logique front mélange vers back)
export const useDeckStore = defineStore('deck', {
  state: () => ({
    deck: [] as Card[],
    discarded: [] as Card[],
  }),

  actions: {
    initDeck() {
      this.deck = GAMES_DATA.tarot_africain.cards.map(
        c => new Card(c.id, c.name, c.value, c.image)
      )
      this.discarded = []
      this._shuffle()
    },

    _shuffle() {
      for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
      }
    },

    deal(nbPlayers: number, cardsPerPlayer: number): Card[][] {
      this.initDeck()
      const hands: Card[][] = Array.from({ length: nbPlayers }, () => [])
      for (let i = 0; i < cardsPerPlayer; i++) {
        for (let j = 0; j < nbPlayers; j++) {
          hands[j].push(this.deck.pop()!)
        }
      }
      return hands
    },
  }
})
