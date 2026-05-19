export class Card {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly value: number | null,
    public readonly image: string
  ) {}

  get isExcuse(): boolean {
    return this.value === null
  }

  getEffectiveValue(excuseValue?: 0 | 22): number {
    if (this.isExcuse) return excuseValue ?? 0
    return this.value!
  }
}
