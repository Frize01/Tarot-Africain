/**
 * Adapted from Secret Table — `packages/scene/src/characters/CharacterAvatar.tsx`
 * (https://github.com/mertertek/secret-table-game, CC BY-NC-SA 4.0).
 * React hooks replaced by a small class; execution/emote layers removed;
 * head look driven directly by the game (who is playing) instead of a network channel.
 */
import { Group, Matrix4, MeshStandardMaterial, SkinnedMesh } from 'three'
import { characterGeometry, requestCharacterGeometry } from '../../vendor/secret-table/characters/geometry'
import type { CharacterBuild } from '../../vendor/secret-table/characters/geometry'
import { boundaryMaterial } from '../../vendor/secret-table/characters/boundaryMaterial'
import { buildRig } from '../../vendor/secret-table/characters/skeleton'
import type { CharacterRig } from '../../vendor/secret-table/characters/skeleton'
import { BLINK_MS, FaceTexture, blinkLid, nextBlinkDelay } from '../../vendor/secret-table/characters/face'
import { SPEC, characterSpec, skinTones } from '../../vendor/secret-table/characters/spec'
import type { CharacterSpec, ExpressionName, SkinId } from '../../vendor/secret-table/characters/spec'

export const SEAT_OFFSET_Y = SPEC.frame.seatTopWorldY
const CHANNEL = SPEC.skin.headChannel

export class Avatar {
  readonly root = new Group()
  private readonly spec: CharacterSpec
  private readonly rig: CharacterRig
  private readonly mesh: SkinnedMesh
  private readonly face: FaceTexture
  private readonly body: MeshStandardMaterial
  private build: CharacterBuild
  private mood: ExpressionName
  private blinkAt = performance.now() + nextBlinkDelay()
  private look = { yaw: 0, pitch: 0 }
  target = { yaw: 0, pitch: 0 }
  private alive = true

  constructor(readonly character: string, readonly skin: SkinId, maxAnisotropy = 8) {
    this.spec = characterSpec(character)
    this.rig = buildRig(this.spec)
    this.mood = this.spec.face.defaultExpression
    this.build = characterGeometry(character, skin, 'low')
    this.face = new FaceTexture('standard', maxAnisotropy)
    this.body = boundaryMaterial()
    const faceMat = new MeshStandardMaterial({ map: this.face.texture, roughness: .85, metalness: 0 })
    this.mesh = new SkinnedMesh(this.build.geometry, [this.body, faceMat])
    this.mesh.castShadow = true
    this.mesh.frustumCulled = false
    this.root.name = 'CharacterAvatar'
    this.root.position.y = SEAT_OFFSET_Y
    this.root.add(this.rig.root, this.mesh)
    this.mesh.bind(this.rig.skeleton, new Matrix4())
    this.redrawFace(0)
    // §g: low tier first, standard tier built in the idle queue
    requestCharacterGeometry(character, skin, (next) => {
      this.build = next
      this.mesh.geometry = next.geometry
      this.mesh.bind(this.rig.skeleton, new Matrix4())
      this.redrawFace(0)
    })
  }

  private faceTopMm() { return (this.build.faceTop - SPEC.head.c[1]!) * 1000 }

  private redrawFace(lid: number) {
    const base = this.mood === 'grumpy' ? SPEC.faces.expressions.grumpy.lid : 0
    this.face.draw(this.spec, skinTones(this.skin).base, this.mood, Math.max(base, lid), this.faceTopMm())
  }

  setExpression(mood: ExpressionName) {
    if (mood === this.mood) return
    this.mood = mood
    this.redrawFace(0)
  }

  setAlive(alive: boolean) {
    if (alive === this.alive) return
    this.alive = alive
    this.body.color.set(alive ? '#ffffff' : '#777777')
    this.setExpression(alive ? this.spec.face.defaultExpression : 'ko')
  }

  /** Per-frame: blink + smoothed head look (neck 40 % / head 60 %). */
  update(dt: number, now = performance.now()) {
    if (this.alive && this.mood !== 'surprised' && this.mood !== 'ko') {
      const elapsed = now - this.blinkAt
      if (elapsed >= 0 && elapsed < BLINK_MS) this.redrawFace(blinkLid(elapsed))
      else if (elapsed >= BLINK_MS) { this.redrawFace(0); this.blinkAt = now + nextBlinkDelay() }
    }
    const w = 1 - Math.exp(-6 * Math.min(dt, .05))
    this.look.yaw += (this.target.yaw - this.look.yaw) * w
    this.look.pitch += (this.target.pitch - this.look.pitch) * w
    const s = this.look
    this.rig.byName.neck.rotation.set(s.pitch * CHANNEL.neck, s.yaw * CHANNEL.neck, 0)
    this.rig.byName.head.rotation.set(s.pitch * CHANNEL.head, s.yaw * CHANNEL.head, 0)
  }

  get shoulders() { return this.spec.bodyScale.shoulders }
}
