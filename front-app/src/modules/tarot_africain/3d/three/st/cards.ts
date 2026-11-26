/**
 * Physical card adapted from Secret Table — `prototype/PhysicalCard.tsx` + `objects/Surface.tsx`
 * (https://github.com/mertertek/secret-table-game, CC BY-NC-SA 4.0).
 * Same build (rounded block + printed face on each side, face = +Y, top edge = −Z),
 * with Tarot Africain artwork.
 */
import { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { cardTexture } from '../textures'

export const CARD = { w: .19, t: .008, h: .272 }
const blockGeo = new RoundedBoxGeometry(CARD.w, CARD.t, CARD.h, 2, .004)
const faceGeo = new PlaneGeometry(.183, .265)
const blockMat = new MeshStandardMaterial({ color: '#eee1c7', roughness: .68 })
const backMat = new MeshStandardMaterial({ map: cardTexture('X'), roughness: .86, polygonOffset: true, polygonOffsetFactor: -1 })

export interface CardObject extends Group {
  userData: { id: string; hovered: boolean; frontMat: MeshStandardMaterial; hit: Mesh; glow: Mesh }
}

export function createCard(id: string): CardObject {
  const g = new Group() as CardObject
  const hidden = id.startsWith('X')
  const frontMat = hidden ? backMat : new MeshStandardMaterial({ map: cardTexture(id), roughness: .86, polygonOffset: true, polygonOffsetFactor: -1 })
  const block = new Mesh(blockGeo, blockMat)
  block.castShadow = block.receiveShadow = true
  const front = new Mesh(faceGeo, frontMat)
  front.rotation.x = -Math.PI / 2
  front.position.y = CARD.t / 2 + .0005
  const back = new Mesh(faceGeo, backMat)
  back.rotation.set(Math.PI / 2, 0, Math.PI)
  back.position.y = -CARD.t / 2 - .0005
  const glow = new Mesh(new PlaneGeometry(.186, .268), new MeshBasicMaterial({ color: '#efbf55', transparent: true, opacity: .22, depthWrite: false }))
  glow.rotation.x = -Math.PI / 2
  glow.position.y = CARD.t / 2 + .0015
  glow.visible = false
  g.add(block, front, back, glow)
  g.name = `Card:${id}`
  g.userData = { id, hovered: false, frontMat, hit: block, glow }
  return g
}

export function setGlow(card: CardObject, on: boolean, color = '#efbf55') {
  card.userData.glow.visible = on
  ;(card.userData.glow.material as MeshBasicMaterial).color.set(color)
}
