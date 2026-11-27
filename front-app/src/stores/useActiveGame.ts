import { defineStore } from 'pinia'

/**
 * Session de jeu en cours — GÉNÉRIQUE, réutilisable par n'importe quel jeu.
 *
 * Un module de jeu appelle `set()` quand le joueur entre dans une partie jouable,
 * et `clear()` quand elle se termine (ou qu'il quitte définitivement).
 * Le menu principal lit `current` pour proposer « Reprendre la partie ».
 * Persisté en localStorage → survit au refresh et à la navigation.
 */
export interface ActiveGameSession {
  gameSlug: string   // identifiant du jeu (ex: 'tarot_africain')
  gameName: string   // libellé affiché (ex: 'Tarot Africain')
  roomCode: string   // code de la room (pour réafficher / rejoindre)
  resumePath: string // route pour revenir dans la partie (ex: '/tarot_africain/game3d/ABC123')
  startedAt: number
}

const KEY = 'ta:activeGame'

function load(): ActiveGameSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ActiveGameSession) : null
  } catch {
    return null
  }
}

export const useActiveGame = defineStore('activeGame', {
  state: () => ({
    current: load() as ActiveGameSession | null,
  }),

  getters: {
    hasActive: (s) => s.current !== null,
  },

  actions: {
    set(session: Omit<ActiveGameSession, 'startedAt'> & { startedAt?: number }) {
      this.current = { startedAt: Date.now(), ...session }
      try { localStorage.setItem(KEY, JSON.stringify(this.current)) } catch { /* ignore */ }
    },
    clear() {
      this.current = null
      try { localStorage.removeItem(KEY) } catch { /* ignore */ }
    },
  },
})
