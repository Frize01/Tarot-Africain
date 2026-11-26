/**
 * Adapted from Secret Table — `packages/scene/src/objects/{Table,Chair,Surface}.tsx`
 * (https://github.com/mertertek/secret-table-game, CC BY-NC-SA 4.0).
 * Brand text changed to "TAROT AFRICAIN".
 */
import {
  CylinderGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry, TorusGeometry,
} from 'three'
import { palette } from '../../vendor/secret-table/materials/palette'
import { chairGeometry } from '../../vendor/secret-table/objects/furnitureGeometry'
import { canvasTexture, lettering, sceneMaterials } from './materials'

/** Felt ellipse half-axes (table top y = 0). */
export const FELT = { rx: 2.12, rz: 1.42 }

function printedFace(width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, resolution = 1024) {
  const tex = canvasTexture(resolution, Math.round(resolution * height / width), (ctx) => draw(ctx, ctx.canvas.width, ctx.canvas.height))
  const mesh = new Mesh(new PlaneGeometry(width, height),
    new MeshStandardMaterial({ map: tex, transparent: true, roughness: .86, polygonOffset: true, polygonOffsetFactor: -1 }))
  mesh.rotation.x = -Math.PI / 2
  return mesh
}

export function buildTable() {
  const { wood, felt } = sceneMaterials()
  const g = new Group()
  g.name = 'Table'
  const mesh = (geo: CylinderGeometry | TorusGeometry, mat: MeshStandardMaterial, cast = true, receive = true) => {
    const m = new Mesh(geo, mat)
    m.castShadow = cast
    m.receiveShadow = receive
    return m
  }
  const base = mesh(new CylinderGeometry(1, .98, .21, 96), new MeshStandardMaterial({ map: wood, color: '#c4a58b', roughness: .43 }))
  base.position.set(0, -.13, 0); base.scale.set(2.35, 1, 1.65)
  const rim = mesh(new CylinderGeometry(.985, 1, .055, 96), new MeshStandardMaterial({ map: wood, color: '#dabda1', roughness: .38 }))
  rim.position.set(0, -.0475, 0); rim.scale.set(2.32, 1, 1.62)
  const top = mesh(new CylinderGeometry(1, 1, .016, 96), new MeshStandardMaterial({ map: felt, color: '#a3b5ac', roughness: 1, bumpMap: felt, bumpScale: .003 }), false)
  top.position.set(0, -.008, 0); top.scale.set(FELT.rx, 1, FELT.rz)
  g.add(base, rim, top)
  for (const { x, z } of [{ x: 2.14, z: 1.44 }, { x: 2.25, z: 1.55 }]) {
    const t = mesh(new TorusGeometry(1, .004, 6, 96), new MeshStandardMaterial({ color: palette.brass, metalness: .68, roughness: .38 }), false, false)
    t.position.set(0, .006, 0); t.rotation.x = -Math.PI / 2; t.scale.set(x, z, 1)
    g.add(t)
  }
  for (const x of [-1.4, 1.4]) {
    const leg = new Group()
    leg.position.set(x, -.46, 0)
    leg.add(mesh(new CylinderGeometry(.18, .23, .62, 16), new MeshStandardMaterial({ map: wood, color: palette.walnut })))
    const foot = mesh(new CylinderGeometry(1, 1.02, .06, 32), new MeshStandardMaterial({ color: palette.walnut }))
    foot.position.y = -.3; foot.scale.set(.6, 1, .85)
    leg.add(foot)
    g.add(leg)
  }
  const brand = printedFace(1.14, .08, (ctx, w, h) => {
    lettering(ctx, 'TAROT AFRICAIN', w / 2, h * .5, h * .4, '#b6b69a', true)
    ctx.strokeStyle = '#839b7d'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(w * .07, h * .85); ctx.lineTo(w * .93, h * .85); ctx.stroke()
  })
  brand.position.set(0, .008, -.69)
  g.add(brand)
  return g
}

let chairGeo: ReturnType<typeof chairGeometry> | null = null
const chairMat = new MeshStandardMaterial({ vertexColors: true, roughness: .74 })
export function buildChair() {
  chairGeo ??= chairGeometry()
  const m = new Mesh(chairGeo, chairMat)
  m.name = 'Chair'
  m.castShadow = m.receiveShadow = true
  return m
}
