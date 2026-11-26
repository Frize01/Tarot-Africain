/**
 * First-person hands adapted from Secret Table — `prototype/HandRig.tsx` + `prototype/rig.ts`
 * (https://github.com/mertertek/secret-table-game, CC BY-NC-SA 4.0).
 * Kept: rest poses, held fan transform, "the hand carries the card" (`handFromCard`),
 * left hand fan grip, right hand pinching the hovered card. Removed: envelope, ballot,
 * gun and gesture layers. The rig lives in world space in front of the local seat.
 */
import { Euler, Group, Quaternion } from 'three'
import { composeCard, fanGrip, handFromCard, slerpRotation } from '../../vendor/secret-table/prototype/grip'
import type { HandPose, Transform, Vec3 } from '../../vendor/secret-table/prototype/model'
import type { SkinId } from '../../vendor/secret-table/characters/spec'
import { SkinnedHand } from './hands'
import { fanCardN } from './fan'
import type { CardObject } from './cards'

const hand = (position: Vec3, rotation: Vec3 = [0, 0, 0], grip: HandPose['grip'] = 'rest'): HandPose => ({ position, rotation, grip })
export const restLeft = hand([-.44, .098, 1.38], [.05, -.09, -.08])
export const restRight = hand([.44, .098, 1.38], [.05, .09, .08])
export const heldFan: Transform = { position: [0, .29, 1.22], rotation: [1.18, 0, 0] }
/** Lowered fan while waiting: keeps the trick in the middle of the table visible. */
export const lowFan: Transform = { position: [0, .13, 1.40], rotation: [.62, 0, 0] }
const LIFT = .065

/** Smoothly follows a target pose; grip changes go through the pose blend of Secret Table. */
class HandFollower {
  current: HandPose
  private from: HandPose['grip']
  private t = 1
  constructor(start: HandPose) { this.current = start; this.from = start.grip }
  step(target: HandPose, dt: number, speed = 9): HandPose {
    const k = 1 - Math.exp(-dt * speed)
    const c = this.current
    const position: Vec3 = [
      c.position[0] + (target.position[0] - c.position[0]) * k,
      c.position[1] + (target.position[1] - c.position[1]) * k,
      c.position[2] + (target.position[2] - c.position[2]) * k,
    ]
    const rotation = slerpRotation(c.rotation, target.rotation, k)
    if (target.grip !== (this.t < 1 ? c.blend?.to : c.grip)) {
      // new grip target → start a blend from the grip we currently show
      this.from = this.t < 1 && c.blend && this.t >= .5 ? c.blend.to : c.grip
      this.t = 0
    }
    let next: HandPose
    if (this.t < 1 && this.from !== target.grip) {
      this.t = Math.min(1, this.t + dt * 4)
      next = { position, rotation, grip: this.from, blend: { to: target.grip, t: this.t } }
      if (this.t >= 1) next = { position, rotation, grip: target.grip }
    } else {
      this.t = 1
      next = { position, rotation, grip: target.grip }
    }
    this.current = next
    return next
  }
}

export class FirstPersonRig {
  readonly root = new Group()
  /** Cards held by the local player are children of this group (placed at `heldFan`). */
  readonly fan = new Group()
  private readonly left: SkinnedHand
  private readonly right: SkinnedHand
  private readonly leftF = new HandFollower(restLeft)
  private readonly rightF = new HandFollower(restRight)
  private readonly lifts = new Map<string, number>()

  constructor(skin: SkinId, coat?: string) {
    this.left = new SkinnedHand(-1, skin, coat)
    this.right = new SkinnedHand(1, skin, coat)
    this.fan.position.set(...heldFan.position)
    this.fan.rotation.set(...heldFan.rotation)
    this.root.name = 'FirstPersonRig'
    this.root.add(this.left.root, this.right.root, this.fan)
  }

  /**
   * @param cards   local hand, in order
   * @param hovered card under the pointer (only when it's our turn to play)
   * @param blind   1-card round: we hold our card facing the others
   */
  private raise = 0

  update(cards: CardObject[], hovered: CardObject | null, blind: boolean, dt: number, raised = true) {
    const n = cards.length
    const k = 1 - Math.exp(-dt * 10)
    this.raise += ((raised ? 1 : 0) - this.raise) * (1 - Math.exp(-dt * 5))
    const r = this.raise
    const fanT: Transform = {
      position: [0, lowFan.position[1] + (heldFan.position[1] - lowFan.position[1]) * r, lowFan.position[2] + (heldFan.position[2] - lowFan.position[2]) * r],
      rotation: [lowFan.rotation[0] + (heldFan.rotation[0] - lowFan.rotation[0]) * r, 0, 0],
    }
    this.fan.position.set(...fanT.position)
    this.fan.rotation.set(...fanT.rotation)
    let pinch: Transform | null = null
    cards.forEach((card, i) => {
      if (card.parent !== this.fan) this.fan.attach(card)
      const want = card === hovered ? LIFT : 0
      const lift = (this.lifts.get(card.userData.id) ?? 0) + (want - (this.lifts.get(card.userData.id) ?? 0)) * k
      this.lifts.set(card.userData.id, lift)
      const t = fanCardN(i, n, lift)
      card.position.x += (t.position[0] - card.position.x) * k
      card.position.y += (t.position[1] - card.position.y) * k
      card.position.z += (t.position[2] - card.position.z) * k
      card.scale.x += (1 - card.scale.x) * k; card.scale.y += (1 - card.scale.y) * k; card.scale.z += (1 - card.scale.z) * k
      tmpQ.setFromEuler(tmpE.set(t.rotation[0], t.rotation[1], blind ? Math.PI : 0))
      card.quaternion.slerp(tmpQ, k)
      if (card === hovered) pinch = composeCard(fanT, t)
    })
    const leftTarget = n > 0 ? handFromCard(fanT, -1, fanGrip(n)) : restLeft
    const rightTarget = pinch ? handFromCard(pinch, 1, 'holdBallot') : restRight
    this.left.apply(this.leftF.step(leftTarget, dt, 14))
    this.right.apply(this.rightF.step(rightTarget, dt, pinch ? 12 : 7))
  }
}

const tmpQ = new Quaternion()
const tmpE = new Euler()
