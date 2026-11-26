/**
 * Adapted from Secret Table (https://github.com/mertertek/secret-table-game, CC BY-NC-SA 4.0):
 *  - `live/PublicArms.tsx`  → `sharedHands`, `sharedGripHand`, `flipWinding` (unchanged logic)
 *  - `live/OfficeHand.tsx`  → `OpponentHand` (a seated player's right hand holding a fan of cards)
 *  - `hands/SkinnedHand.tsx` → `SkinnedHand` (first-person 16-bone hand + forearm/cuff)
 */
import {
  BufferGeometry, Color, CylinderGeometry, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial,
  Quaternion, SkinnedMesh, Vector3,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { bakedPose, handGeometry, tintVertexColors, tintedHandGeometry } from '../../vendor/secret-table/hands/geometry'
import { CARD_FRAMES, POSES, mixPose } from '../../vendor/secret-table/hands/poses'
import type { GripName, Pose } from '../../vendor/secret-table/hands/poses'
import { resolveContact } from '../../vendor/secret-table/hands/contact'
import { applyPose, buildSkeleton } from '../../vendor/secret-table/hands/skeleton'
import { SPEC, skinTones } from '../../vendor/secret-table/characters/spec'
import type { SkinId } from '../../vendor/secret-table/characters/spec'
import type { HandPose, Vec3 } from '../../vendor/secret-table/prototype/model'
import { fanCardN } from './fan'
import type { CardObject } from './cards'

/* ------------------------------------------------------------------ */
/*  PublicArms helpers                                                */
/* ------------------------------------------------------------------ */
const HAND_SCALE = SPEC.wrist.handScale
const HAND_X = SPEC.wrist.publicArmsHandX

function flipWinding(geometry: BufferGeometry): void {
  for (const attribute of Object.values(geometry.attributes)) {
    const array = attribute.array as Float32Array
    const size = attribute.itemSize
    for (let t = 0; t + 2 < attribute.count; t += 3) {
      for (let c = 0; c < size; c++) {
        const a = (t + 1) * size + c, b = (t + 2) * size + c
        const tmp = array[a]!; array[a] = array[b]!; array[b] = tmp
      }
    }
  }
}

function handsGeometry(shoulders: number, skin: SkinId, sides: readonly number[], grip: GripName): BufferGeometry {
  const parts = sides.map((side) => {
    const hand = bakedPose('distant', grip)
    hand.scale(HAND_SCALE, HAND_SCALE, HAND_SCALE)
    hand.translate(0, -.004, -.312)
    const flat = hand.toNonIndexed(); hand.dispose()
    if (side < 0) { flat.scale(-1, 1, 1); flipWinding(flat) }
    flat.rotateY(side * -.13)
    flat.translate(side * HAND_X * shoulders, 0, 0)
    return flat
  })
  const merged = mergeGeometries(parts)!
  parts.forEach((g) => g.dispose())
  tintVertexColors(merged, skinTones(skin).base)
  return merged
}

const shared = new Map<string, BufferGeometry>()
export function sharedHands(shoulders: number, skin: SkinId, sides: readonly number[] = [-1, 1], grip: GripName = 'restTable'): BufferGeometry {
  const rounded = Math.round(shoulders * 100) / 100
  const key = `${rounded}:${skin}:${sides.join('')}:${grip}`
  let hit = shared.get(key)
  if (!hit) { hit = handsGeometry(rounded, skin, sides, grip); shared.set(key, hit) }
  return hit
}

const bare = new Map<string, BufferGeometry>()
export function sharedGripHand(skin: SkinId, grip: GripName, side: -1 | 1 = 1): BufferGeometry {
  const key = `${skin}:${grip}:${side}`
  let hit = bare.get(key)
  if (!hit) {
    const hand = bakedPose('distant', grip)
    tintVertexColors(hand, skinTones(skin).base)
    let geometry = hand
    if (side < 0) {
      geometry = hand.toNonIndexed(); hand.dispose()
      geometry.scale(-1, 1, 1); flipWinding(geometry)
    }
    bare.set(key, geometry)
    hit = geometry
  }
  return hit
}

const handMat = new MeshStandardMaterial({ vertexColors: true, roughness: .86 })

/** Resting hand(s) on the table edge (`PublicArms`). */
export function restingHands(shoulders: number, skin: SkinId, sides: readonly number[]) {
  const g = new Group()
  g.name = 'PublicHands'
  g.position.set(0, .035, -.015)
  if (sides.length) {
    const m = new Mesh(sharedHands(shoulders, skin, sides), handMat)
    m.castShadow = true
    g.add(m)
  }
  return g
}

/* ------------------------------------------------------------------ */
/*  OpponentHand (OfficeHand)                                         */
/* ------------------------------------------------------------------ */
const WRIST = [0, -.004, -.312] as const
const LIFT = { y: .02, z: .01 } as const
const HAND_TILT = 2.74
const HAND_YAW = -.13
const gripFor = (n: number): GripName => (n >= 3 ? 'holdFan3' : n === 2 ? 'holdFan2' : 'holdFan1')

/**
 * Right hand raised from the table edge holding `n` cards. Backs face the table
 * centre; in the 1-card round (`blind`) the card is flipped so others see its face.
 */
export class OpponentHand {
  readonly root = new Group()
  private readonly wrist = new Group()
  readonly packet = new Group()
  private handMesh: Mesh
  private grip: GripName = 'holdFan3'
  private phase = Math.random() * 10

  constructor(private readonly shoulders: number, private readonly skin: SkinId) {
    this.root.name = 'OpponentHand'
    this.root.position.set(0, .035, -.015)
    this.wrist.position.set(HAND_X * shoulders + WRIST[0], WRIST[1] + LIFT.y, WRIST[2] + LIFT.z)
    this.wrist.rotation.set(HAND_TILT, HAND_YAW, 0)
    this.wrist.scale.setScalar(HAND_SCALE)
    this.handMesh = new Mesh(sharedGripHand(skin, this.grip, 1), handMat)
    this.handMesh.castShadow = true
    this.wrist.add(this.handMesh, this.packet)
    this.root.add(this.wrist)
    this.setGrip(this.grip)
  }

  private setGrip(grip: GripName) {
    this.grip = grip
    this.handMesh.geometry = sharedGripHand(this.skin, grip, 1)
    const frame = CARD_FRAMES[grip]!
    this.packet.position.set(frame.C[0], frame.C[1], frame.C[2])
    this.packet.rotation.set(frame.euler[0], frame.euler[1], frame.euler[2])
    this.packet.scale.setScalar(1 / HAND_SCALE)
  }

  /** Lays the given cards out in the hand (cards are children of `packet`). */
  layout(cards: CardObject[], blind: boolean, dt: number, active: boolean, t: number) {
    const n = cards.length
    this.root.visible = n > 0
    const grip = gripFor(n)
    if (grip !== this.grip && n > 0) this.setGrip(grip)
    const k = 1 - Math.exp(-dt * 9)
    cards.forEach((card, i) => {
      if (card.parent !== this.packet) this.packet.attach(card)
      const slot = fanCardN(i, n)
      card.position.x += (slot.position[0] - card.position.x) * k
      card.position.y += (slot.position[1] - card.position.y) * k
      card.position.z += (slot.position[2] - card.position.z) * k
      card.scale.lerp(ONE, k)
      // packet +Y faces the table centre: flip so the owner sees the faces (and the others the backs);
      // in the blind round the card is held the other way round.
      lerpRot(card, slot.rotation[0], slot.rotation[1], blind ? 0 : Math.PI, k)
    })
    // small idle motion; lifts a little while it's this player's turn
    const lift = active ? .03 : 0
    this.root.position.y += ((.035 + lift + Math.sin(t * 1.3 + this.phase) * .004) - this.root.position.y) * k
    this.root.rotation.x += ((active ? .1 : 0) - this.root.rotation.x) * k
  }
}

const ONE = new Vector3(1, 1, 1)
function lerpRot(o: Group | Mesh, x: number, y: number, z: number, k: number) {
  o.rotation.x += (x - o.rotation.x) * k
  o.rotation.y += (y - o.rotation.y) * k
  o.rotation.z += (z - o.rotation.z) * k
}

/* ------------------------------------------------------------------ */
/*  SkinnedHand                                                       */
/* ------------------------------------------------------------------ */
const COAT = '#354f49', CUFF = '#e1d4b8'
const FOREARM = .042, CUFF_R = .039, BEHIND_ELBOW = .30, CUFF_OVERLAP = .060
const CUFF_BACK = .050, CUFF_LEN = .046
const STEPS = 32
const solved = new Map<string, { pose: Pose; penetrations: number }>()

export function resolveGrip(grip: GripName, blend?: { to: GripName; t: number }) {
  const active = blend && blend.to !== grip ? blend : undefined
  const t = active ? Math.round(Math.max(0, Math.min(1, active.t)) * STEPS) / STEPS : 0
  const key = active ? `${grip}>${active.to}@${t}` : grip
  const hit = solved.get(key)
  if (hit) return hit
  const blended = active ? mixPose(POSES[grip], POSES[active.to], t) : POSES[grip]
  const frame = CARD_FRAMES[active && t >= .5 ? active.to : grip]
  const result = resolveContact(blended, frame)
  const value = { pose: result.pose, penetrations: result.penetrations }
  if (solved.size < 600) solved.set(key, value)
  return value
}

/** Elbow anchor (from Secret Table `prototype/rig.ts`). */
export const elbow = (side: -1 | 1): Vec3 => [side * .43, .035, 1.985]

export class SkinnedHand {
  readonly root = new Group()
  private readonly wrist = new Group()
  private readonly mesh: SkinnedMesh
  private readonly arm: InstancedMesh
  private readonly rig = buildSkeleton()
  private readonly s = {
    from: new Vector3(), to: new Vector3(), dir: new Vector3(), up: new Vector3(0, 1, 0),
    q: new Quaternion(), back: new Quaternion(), flip: new Vector3(), p: new Vector3(), sc: new Vector3(), m: new Matrix4(),
  }

  constructor(private readonly side: -1 | 1, skin: SkinId = 'orta', coat = COAT) {
    handGeometry('standard')
    const geometry = tintedHandGeometry('standard', skinTones(skin).base)
    this.mesh = new SkinnedMesh(geometry, new MeshStandardMaterial({ vertexColors: true, roughness: .72, metalness: 0 }))
    this.mesh.castShadow = true
    this.mesh.frustumCulled = false
    const mirror = new Group()
    mirror.scale.set(side, 1, 1)
    mirror.add(this.rig.root, this.mesh)
    this.wrist.add(mirror)
    this.mesh.bind(this.rig.skeleton, new Matrix4())
    this.arm = new InstancedMesh(new CylinderGeometry(.72, 1, 1, 18, 1, false), new MeshStandardMaterial({ roughness: .89 }), 2)
    this.arm.castShadow = true
    this.arm.frustumCulled = false
    ;[coat, CUFF].forEach((c, i) => this.arm.setColorAt(i, new Color(c)))
    if (this.arm.instanceColor) this.arm.instanceColor.needsUpdate = true
    this.s.from.set(...elbow(side))
    this.root.name = side === 1 ? 'RightHand' : 'LeftHand'
    this.root.add(this.arm, this.wrist)
  }

  apply(pose: HandPose) {
    this.wrist.position.set(...pose.position)
    this.wrist.rotation.set(...pose.rotation)
    applyPose(this.rig.bones, resolveGrip(pose.grip, pose.blend).pose)
    const { from, to, dir, up, q, back, flip, p, sc, m } = this.s
    to.set(...pose.position); dir.subVectors(to, from)
    const reach = Math.max(.02, dir.length()); dir.normalize()
    q.setFromUnitVectors(up, dir)
    const length = reach + BEHIND_ELBOW - CUFF_OVERLAP
    this.arm.setMatrixAt(0, m.compose(p.copy(from).addScaledVector(dir, (reach - BEHIND_ELBOW - CUFF_OVERLAP) / 2), q, sc.set(FOREARM, length, FOREARM)))
    back.setFromUnitVectors(up, flip.copy(dir).negate())
    this.arm.setMatrixAt(1, m.compose(p.copy(to).addScaledVector(dir, -CUFF_BACK), back, sc.set(CUFF_R, CUFF_LEN, CUFF_R)))
    this.arm.instanceMatrix.needsUpdate = true
  }
}
