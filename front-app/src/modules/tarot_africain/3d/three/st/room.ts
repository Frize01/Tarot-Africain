/**
 * Adapted from Secret Table — `packages/scene/src/room/{Room,RoomShell,RoomFurniture,RoomDecorations}.tsx`
 * (https://github.com/mertertek/secret-table-game, CC BY-NC-SA 4.0).
 * The r3f JSX tree is rebuilt imperatively; geometry and textures come unchanged from `vendor/secret-table/room`.
 */
import {
  BoxGeometry, Color, DoubleSide, Fog, FrontSide, Group, InstancedMesh, Matrix4, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, PointLight, Quaternion, Vector3,
} from 'three'
import { room } from '../../vendor/secret-table/materials/palette'
import { ROOM, atHeight, fogFor } from '../../vendor/secret-table/room/roomGeometry'
import {
  bookInstances, brassGeometry, ceilingGeometry, chandelierShadeGeometry, chandelierShades, curtainGeometry,
  floorGeometry, glasswareGeometry, glowGeometry, greeneryGeometry, mapPlaneGeometry, posterGeometry,
  rugGeometry, shadeGeometry, trimGeometry, wallBandGeometry, windowGlassGeometry, woodGeometry,
} from '../../vendor/secret-table/room/roomMeshes'
import { createRoomTextures } from '../../vendor/secret-table/room/roomTextures'
import { sceneMaterials } from './materials'

const WALLPAPER_TILE = 2.2
const WAINSCOT_TILE = 1.2

export const roomFog = () => {
  const { near, far } = fogFor('seat')
  return new Fog(room.fog, near, far)
}

export function buildRoom(quality: 'low' | 'standard' = 'standard') {
  const low = quality === 'low'
  const { wood } = sceneMaterials()
  const textures = createRoomTextures(quality)
  const g = new Group()
  g.name = 'Room'

  /* ---- Shell (D2.1) ---- */
  const add = (geometry: ConstructorParameters<typeof Mesh>[0], material: MeshStandardMaterial | MeshBasicMaterial, receive = false) => {
    const m = new Mesh(geometry, material)
    m.receiveShadow = receive
    g.add(m)
    return m
  }
  add(floorGeometry(), new MeshStandardMaterial({ map: textures.parquet ?? undefined, color: textures.parquet ? '#ffffff' : room.floor, roughness: .85 }), true)
  add(rugGeometry(), new MeshStandardMaterial({ map: textures.rug ?? undefined, color: textures.rug ? '#ffffff' : room.rug, roughness: 1 }), true)
  add(wallBandGeometry(0, ROOM.wainscotH, ROOM.ceilingH, WALLPAPER_TILE),
    new MeshStandardMaterial({ map: textures.damask ?? undefined, color: textures.damask ? '#ffffff' : room.wallpaper, roughness: .95, side: FrontSide }))
  add(wallBandGeometry(.004, 0, ROOM.wainscotH + .02, WAINSCOT_TILE),
    new MeshStandardMaterial({ map: wood, color: room.wainscot, roughness: .7, side: FrontSide }))
  add(ceilingGeometry(), new MeshStandardMaterial({ map: textures.ceiling ?? undefined, color: textures.ceiling ? '#ffffff' : room.ceiling, roughness: .95, side: FrontSide }))
  add(trimGeometry(low, true), new MeshStandardMaterial({ vertexColors: true, roughness: .72, side: FrontSide }))
  add(brassGeometry(low, true), new MeshStandardMaterial({ vertexColors: true, metalness: .65, roughness: .38 }))
  add(glowGeometry(low, true), new MeshBasicMaterial({ vertexColors: true, toneMapped: false, side: DoubleSide }))

  const shades = chandelierShades(low, true)
  if (shades.length) {
    const inst = new InstancedMesh(chandelierShadeGeometry(),
      new MeshStandardMaterial({ color: '#f3e0bd', emissive: room.lampWarm, emissiveIntensity: .42, roughness: .85, side: DoubleSide }), shades.length)
    const m = new Matrix4()
    const v = new Vector3()
    shades.forEach((s, i) => inst.setMatrixAt(i, m.makeTranslation(v.set(...s.position))))
    inst.instanceMatrix.needsUpdate = true
    g.add(inst)
  }
  const chandelier = new PointLight(room.lampWarm, 6, 9, 2)
  chandelier.position.set(0, atHeight(ROOM.chandelierH) - .2, 0)
  g.add(chandelier)

  if (!low) {
    /* ---- Furniture (D2.2) ---- */
    add(woodGeometry(), new MeshStandardMaterial({ map: wood, vertexColors: true, roughness: .72 }))
    const books = bookInstances()
    const bookMesh = new InstancedMesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial({ map: textures.books ?? undefined, roughness: .86 }), books.length)
    const matrix = new Matrix4(); const position = new Vector3(); const scale = new Vector3()
    const quaternion = new Quaternion(); const axis = new Vector3(0, 0, 1); const color = new Color()
    books.forEach((entry, i) => {
      position.set(...entry.position); scale.set(...entry.scale)
      quaternion.setFromAxisAngle(axis, entry.tilt)
      bookMesh.setMatrixAt(i, matrix.compose(position, quaternion, scale))
      bookMesh.setColorAt(i, color.set(entry.color))
    })
    bookMesh.instanceMatrix.needsUpdate = true
    if (bookMesh.instanceColor) bookMesh.instanceColor.needsUpdate = true
    g.add(bookMesh)
    add(windowGlassGeometry(), new MeshStandardMaterial({
      map: textures.night ?? undefined, color: textures.night ? '#ffffff' : room.night,
      emissiveMap: textures.night ?? undefined, emissive: '#ffffff', emissiveIntensity: .6, roughness: .4,
    }))
    add(curtainGeometry(), new MeshStandardMaterial({ vertexColors: true, roughness: 1 }))
    add(shadeGeometry(), new MeshStandardMaterial({ vertexColors: true, emissive: '#3a2a14', emissiveIntensity: 1, roughness: .9, side: DoubleSide }))
    add(glasswareGeometry(), new MeshStandardMaterial({ vertexColors: true, roughness: .22, metalness: .05 }))
    for (const x of [-3.6, 3.6]) {
      const l = new PointLight('#ffc779', 2.5, 3.5, 2)
      l.position.set(x, .41, -1.7)
      g.add(l)
    }

    /* ---- Decorations (D2.3) ---- */
    add(mapPlaneGeometry(), new MeshStandardMaterial({ map: textures.map ?? undefined, color: textures.map ? '#ffffff' : room.paper, roughness: .95 }))
    add(posterGeometry(), new MeshStandardMaterial({ map: textures.posters ?? undefined, color: textures.posters ? '#ffffff' : room.paper, roughness: .9 }))
    add(greeneryGeometry(), new MeshStandardMaterial({ vertexColors: true, roughness: .9, flatShading: true }))
  }
  return { group: g, chandelier }
}

/** Shared light set from Secret Table's `RoomShell.tsx` (`ROOM_LIGHTS`). */
export const ROOM_LIGHTS = {
  hemisphere: { sky: '#e8d6b8', ground: '#3a2a1c', intensity: 1.2 },
  key: { position: [-3, 6, 3] as [number, number, number], color: '#ffe6c7', intensity: 2.4 },
  fill: { position: [0, 2, -6] as [number, number, number], color: '#9db7c9', intensity: .9 },
} as const
