/**
 * Identifiant de carte :
 *  - '1' … '21' : atouts
 *  - 'E'        : l'Excuse (vaut 0 ou 22, au choix du joueur)
 *  - 'X…'       : carte inconnue côté client (ex. main adverse en multijoueur) → dos sur les deux faces
 */
export type CardId = string

export interface Player {
  id: number
  name: string
  color: string
  lives: number
  hand: CardId[]
  bet: number | null
  tricks: number
  eliminated: boolean
  isHuman: boolean
  /** le joueur a quitté l'écran : l'IA joue à sa place → on affiche une icône robot */
  away: boolean
}

export interface TrickPlay {
  player: number
  card: CardId
  value: number
}

export type Phase =
  | 'idle'
  | 'dealing'
  | 'betting'
  | 'playing'
  | 'excuse'
  | 'trickEnd'
  | 'roundEnd'
  | 'gameOver'

export interface RoundResult {
  player: number
  bet: number
  tricks: number
  lost: number
}

export interface GameState {
  players: Player[]
  /** index du joueur local (toujours face caméra) */
  me: number
  round: number
  cardsPerRound: number
  dealer: number
  current: number
  phase: Phase
  /** manche à 1 carte : on voit les cartes des autres mais pas la sienne */
  blind: boolean
  trick: TrickPlay[]
  /** plis remportés, par joueur (cartes empilées devant lui) */
  wonPiles: CardId[][]
  lastTrickWinner: number | null
  results: RoundResult[]
  winner: number | null
  /** échéance du tour courant en horloge CLIENT (ms, 0 si aucun minuteur actif) */
  turnEndsAt: number
}

export const isHidden = (id: CardId) => id.startsWith('X')
// 'E' = Excuse (0 par défaut) ; 'E0'/'E22' = Excuse posée à sa valeur ; sinon un atout.
export const cardValue = (id: CardId): number =>
  id[0] === 'E' ? (id.length > 1 ? Number(id.slice(1)) : 0) : Number(id)
