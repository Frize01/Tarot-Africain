import { Card } from './Card'

export class Player {
  public lives: number
  public announced: number | null = null
  public tricksWon: number = 0
  public hand: Card[] = []

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly color: string,
    initialLives: number
  ) {
    this.lives = initialLives
  }

  resetForRound() {
    this.announced = null
    this.tricksWon = 0
    this.hand = []
  }

  applyPenalty(): number {
    const diff = Math.abs((this.announced ?? 0) - this.tricksWon)
    this.lives = Math.max(0, this.lives - diff)
    return diff
  }

  get isAlive(): boolean {
    return this.lives > 0
  }

  get hasAnnounced(): boolean {
    return this.announced !== null
  }
}
