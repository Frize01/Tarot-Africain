/**
 * Fan layout adapted from Secret Table — `prototype/grip.ts` `fanCard`
 * (https://github.com/mertertek/secret-table-game, CC BY-NC-SA 4.0).
 * Extended to 4–5 cards (Tarot Africain deals up to 5) by tightening the spread.
 */
import { FAN_PIVOT } from '../../vendor/secret-table/prototype/grip'
import type { Transform } from '../../vendor/secret-table/prototype/model'

export function fanCardN(index: number, count: number, lift = 0): Transform {
  const k = count > 3 ? 2 / (count - 1) : 1
  const slot = index - (count - 1) / 2
  const raised = Math.min(1, lift / .065)
  const angle = slot * -.80 * k * (1 - raised)
  const cos = Math.cos(angle), sin = Math.sin(angle)
  return {
    position: [
      FAN_PIVOT.x - (FAN_PIVOT.x * cos + FAN_PIVOT.z * sin) + slot * (.021 * k * (1 - raised) + .13 * raised),
      slot * .004 + lift * .45,
      FAN_PIVOT.z - (-FAN_PIVOT.x * sin + FAN_PIVOT.z * cos) - lift * 1.4,
    ],
    rotation: [0, angle, 0],
  }
}
