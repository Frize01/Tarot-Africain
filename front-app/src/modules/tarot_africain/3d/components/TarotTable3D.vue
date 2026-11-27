<script setup lang="ts">
/**
 * Scène 3D du Tarot Africain — rendu repris et adapté de Secret Table
 * (https://github.com/mertertek/secret-table-game, CC BY-NC-SA 4.0) :
 * salle, table, chaises, personnages paramétriques, mains SDF, vue à la 1re personne.
 *
 * La scène lit l'état de jeu (props.game) à chaque frame et place chaque carte
 * (main, pli en cours, plis gagnés). Elle n'émet qu'un événement : `play`.
 */
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import type { GameState } from '../game/types'
import { avatarForSeat, labelHeight } from '../vendor/secret-table/characters/spec'
import type { SkinId } from '../vendor/secret-table/characters/spec'
import { clamp } from '../vendor/secret-table/prototype/model'
import { buildRoom, roomFog, ROOM_LIGHTS } from '../three/st/room'
import { buildTable, buildChair } from '../three/st/table'
import { Avatar } from '../three/st/avatar'
import { OpponentHand, restingHands } from '../three/st/hands'
import { FirstPersonRig } from '../three/st/firstPerson'
import { createCard, setGlow, type CardObject } from '../three/st/cards'

const props = defineProps<{ game: GameState; canPlay: boolean }>()
const emit = defineEmits<{ play: [id: string] }>()

/* Bornes de regard (Secret Table `prototype/model.ts` lookLimits).
 * yaw volontairement réduit en vue assise : au-delà on verrait notre corps vide derrière. */
const LOOK = { yaw: 0.62, pitchMin: -32 * Math.PI / 180, pitchMax: 12 * Math.PI / 180 }
const CENTER_LOOK = { yaw: 0, pitch: -.26 }
const YAW_SPEED = 1.5
/* Amplitude de regard vers le bas (depuis le centre) qui abaisse complètement l'éventail */
const FAN_DROP_SPAN = .16
/* Zoom « pli » : en baissant le regard, la caméra passe au-dessus de nos cartes et plonge vers le centre.
 * Les cartes posées forment un anneau autour du centre → on cadre tout l'anneau, visé un peu
 * vers le côté adverse pour bien voir les cartes des autres. */
const TRICK_POS = new THREE.Vector3(0, 1.26, 1.12)
/* Cible au niveau du tapis (les cartes posées sont à y ≈ 0) : on vise le vrai centre, pas le texte au loin */
const TRICK_TARGET = new THREE.Vector3(0, .03, .04)
const TRICK_FOV = 55

/* Points de vue (Secret Table `CameraMode`) : 'seat' = 1re personne, 'overview' = vue haute de la table.
 * La bascule est automatique : vue d'ensemble quand ce n'est pas notre tour, vue assise sinon. */
type CamMode = 'seat' | 'overview'
const camMode = ref<CamMode>('overview')
/* Vue d'ensemble : caméra en orbite au-dessus de la table, regardant son centre */
const OVERVIEW = { radius: 3.4, height: 3.05, fov: 42 }
const OVERVIEW_TARGET = new THREE.Vector3(0, .35, 0)
/* Fondu de caméra entre les deux vues (0 = assis, 1 = vue d'ensemble) */
let viewBlend = 1
let viewTarget = 1
let seatFov = 64
/* Facteur de levée courant (0 = éventail baissé / regard vers le bas, 1 = levé / regard avant) */
let lookRaise = 1

/* « C'est notre tour » : on doit miser ou jouer */
const isMyTurn = computed(() => {
  const g = props.game
  return g.current === g.me && (g.phase === 'betting' || g.phase === 'playing' || g.phase === 'excuse')
})

const mount = ref<HTMLDivElement | null>(null)
const labels = reactive(props.game.players.map(() => ({ x: 0, y: 0, ax: -50, visible: false })))

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let clock: THREE.Clock
let raf = 0
let fp: FirstPersonRig

type Seat = { angle: number; chair: THREE.Vector3; group: THREE.Group; avatar?: Avatar; hand?: OpponentHand; character: string; label: number }
const seats: Seat[] = []
const cards = new Map<string, CardObject>()

const look = { yaw: CENTER_LOOK.yaw, pitch: CENTER_LOOK.pitch }
const lookTarget = { ...CENTER_LOOK }
let yawInput = 0
const pointer = new THREE.Vector2(9, 9)
const raycaster = new THREE.Raycaster()
let hovered: CardObject | null = null
let drag: { x: number; y: number; yaw: number; pitch: number; moved: boolean } | null = null

/* ------------------------------------------------------------------ */
function seatAngle(i: number) {
  const n = props.game.players.length
  return ((i - props.game.me + n) % n) / n * Math.PI * 2
}

function init() {
  const el = mount.value!
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = .78
  el.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.fog = roomFog()
  scene.background = new THREE.Color(scene.fog.color)
  camera = new THREE.PerspectiveCamera(64, 1, .025, 100)

  // Lumières (Secret Table `ROOM_LIGHTS`, assombries pour l'ambiance bar)
  const L = ROOM_LIGHTS
  scene.add(new THREE.HemisphereLight(L.hemisphere.sky, L.hemisphere.ground, L.hemisphere.intensity * .35))
  const key = new THREE.DirectionalLight(L.key.color, L.key.intensity * .35)
  key.position.set(...L.key.position)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 })
  key.shadow.bias = -.0003
  key.shadow.normalBias = .018
  scene.add(key)
  const fill = new THREE.DirectionalLight(L.fill.color, L.fill.intensity * .4)
  fill.position.set(...L.fill.position)
  scene.add(fill)
  // Lampe au-dessus de la table : flaque de lumière chaude sur le tapis
  const pool = new THREE.SpotLight('#ffcf8f', 9, 6, .62, .55, 1.4)
  pool.position.set(0, 2.05, .2)
  pool.target.position.set(0, 0, .2)
  pool.castShadow = true
  pool.shadow.mapSize.set(1024, 1024)
  pool.shadow.bias = -.0003
  scene.add(pool, pool.target)

  const { group: roomGroup } = buildRoom('standard')
  scene.add(roomGroup, buildTable())

  props.game.players.forEach((p, i) => {
    const a = seatAngle(i)
    const sx = Math.sin(a), sz = Math.cos(a)
    const chair = new THREE.Vector3(sx * 2.64, -.74, sz * 2.0)
    const avatarSel = avatarForSeat(i + 1)
    const character = avatarSel.character
    const skin = (['acik', 'orta', 'koyu'] as SkinId[])[i % 3]
    const group = new THREE.Group()
    group.position.set(chair.x, 0, chair.z)
    group.rotation.y = a
    scene.add(group)
    const seat: Seat = { angle: a, chair, group, character, label: labelHeight(character) }
    if (i !== props.game.me) {
      const chairMesh = buildChair()
      chairMesh.position.copy(chair)
      chairMesh.rotation.y = a
      scene.add(chairMesh)
      const avatar = new Avatar(character, skin, renderer.capabilities.getMaxAnisotropy())
      const hand = new OpponentHand(avatar.shoulders, skin)
      group.add(avatar.root, restingHands(avatar.shoulders, skin, [-1]), hand.root)
      seat.avatar = avatar
      seat.hand = hand
    }
    seats.push(seat)
  })

  fp = new FirstPersonRig('orta', '#3b2a22')
  scene.add(fp.root)

  clock = new THREE.Clock()
  onResize()
  loop()
}

function onResize() {
  const el = mount.value
  if (!el || !renderer) return
  const w = el.clientWidth, h = el.clientHeight
  const aspect = w / Math.max(1, h)
  // Secret Table `SeatCamera` : fov vertical tel que ~52° restent visibles à l'horizontale
  seatFov = Math.min(100, Math.max(64, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(26)) / aspect))))
  camera.aspect = aspect
  camera.updateProjectionMatrix()
  // En portrait, on baisse un peu le regard pour garder la table dans le cadre
  CENTER_LOOK.pitch = aspect < 1 ? -.42 : -.26
  if (!drag) lookTarget.pitch = CENTER_LOOK.pitch
  renderer.setSize(w, h)
}

/* ------------------------------------------------------------------ */
/*  Synchronisation état → cartes 3D                                  */
/* ------------------------------------------------------------------ */
const DEAL_ORIGIN = new THREE.Vector3(0, .35, 0)
const tmpV = new THREE.Vector3()
const tmpQ = new THREE.Quaternion()
const tmpE = new THREE.Euler()

function jitter(id: string, amp: number) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0
  return (((h % 1000) / 1000) - .5) * amp
}

function syncCards(dt: number, t: number) {
  const g = props.game
  type Loc = { t: 'hand'; p: number; k: number } | { t: 'trick'; p: number; k: number } | { t: 'won'; p: number; j: number }
  const want = new Map<string, Loc>()
  g.players.forEach((p, i) => p.hand.forEach((id, k) => want.set(id, { t: 'hand', p: i, k })))
  g.trick.forEach((tp, k) => want.set(tp.card, { t: 'trick', p: tp.player, k }))
  g.wonPiles.forEach((pile, i) => pile.forEach((id, j) => want.set(id, { t: 'won', p: i, j })))

  for (const [id, c] of cards) {
    if (!want.has(id)) {
      c.parent?.remove(c)
      cards.delete(id)
      if (hovered === c) hovered = null
    }
  }

  const handCards: CardObject[][] = g.players.map(() => [])
  const k = 1 - Math.exp(-dt * 7)
  const winning = g.phase === 'trickEnd' && g.trick.length ? g.trick.reduce((a, b) => (b.value > a.value ? b : a)).card : null
  const alive = g.players.filter((p) => !p.eliminated).length

  for (const [id, loc] of want) {
    let c = cards.get(id)
    if (!c) {
      c = createCard(id)
      cards.set(id, c)
      scene.add(c)
      c.position.copy(DEAL_ORIGIN)
      c.rotation.set(0, 0, Math.PI)
      c.scale.setScalar(.6)
    }
    if (loc.t === 'hand') { handCards[loc.p]![loc.k] = c; continue }

    if (c.parent !== scene) scene.attach(c)
    c.userData.hovered = false
    const a = seats[loc.p]!.angle
    if (loc.t === 'trick') {
      const lift = id === winning ? .03 : 0
      // Pli resserré vers le centre : les cartes posées forment un tas compact, lisible même en portrait
      tmpV.set(Math.sin(a) * .46, .012 + loc.k * .003 + lift, Math.cos(a) * .34)
      tmpE.set(0, jitter(id, .5), 0)
      setGlow(c, id === winning, '#8fe0a0')
    } else {
      const trickIdx = Math.floor(loc.j / Math.max(1, alive))
      const side = a + .38
      tmpV.set(Math.sin(side) * 1.52, .012 + loc.j * .0085, Math.cos(side) * 1.02)
      tmpE.set(0, a + (trickIdx % 2) * .5 + jitter(id, .12), Math.PI)
      setGlow(c, false)
    }
    c.position.lerp(tmpV, k)
    c.scale.lerp(ONE, k)
    tmpQ.setFromEuler(tmpE)
    c.quaternion.slerp(tmpQ, k)
  }

  const active = ['betting', 'playing', 'excuse'].includes(g.phase)
  seats.forEach((seat, i) => {
    if (i === g.me) return
    seat.hand!.layout(handCards[i]!, g.blind, dt, active && g.current === i, t)
  })
  if (hovered && !handCards[g.me]!.includes(hovered)) hovered = null
  const myTurn = g.current === g.me && ['betting', 'playing', 'excuse'].includes(g.phase)
  const shown = myTurn || g.phase === 'dealing'
  // En regardant vers le bas (glisser vers le haut), on abaisse l'éventail pour voir les cartes posées
  fp.update(handCards[g.me]!, props.canPlay ? hovered : null, g.blind, dt, shown ? lookRaise : 0)
}
const ONE = new THREE.Vector3(1, 1, 1)

/* ------------------------------------------------------------------ */
/*  Personnages : regard + expressions                                */
/* ------------------------------------------------------------------ */
const headTarget = new THREE.Vector3()
function updateAvatars(dt: number) {
  const g = props.game
  const focus = g.phase === 'trickEnd' && g.lastTrickWinner !== null ? g.lastTrickWinner : g.current
  seats.forEach((seat, i) => {
    const av = seat.avatar
    if (!av) return
    av.setAlive(!g.players[i]!.eliminated)
    if (g.phase === 'roundEnd') {
      const r = g.results.find((x) => x.player === i)
      av.setExpression(r ? (r.lost ? (r.lost > 1 ? 'surprised' : 'grumpy') : 'smile') : 'neutral')
    } else if (g.phase === 'trickEnd' && g.lastTrickWinner === i) av.setExpression('smile')
    else if (!g.players[i]!.eliminated) av.setExpression('neutral')

    if (focus === i) {
      // regarde ses propres cartes / le pli
      av.target.yaw = 0
      av.target.pitch = -.25
    } else {
      const f = seats[focus]!
      headTarget.set(f.chair.x, .45, f.chair.z)
      if (focus === g.me) headTarget.set(0, .45, 1.9)
      seat.group.worldToLocal(headTarget)
      av.target.yaw = clamp(Math.atan2(-headTarget.x, -headTarget.z), -.65, .65)
      av.target.pitch = -.05
    }
    av.update(dt)
  })
}

/* ------------------------------------------------------------------ */
const lookAt = new THREE.Vector3()
const seatPos = new THREE.Vector3()
const seatLookAt = new THREE.Vector3()
const ovPos = new THREE.Vector3()
const smoothstep = (x: number) => x * x * (3 - 2 * x)
function loop() {
  raf = requestAnimationFrame(loop)
  const dt = Math.min(clock.getDelta(), .05)
  const t = clock.elapsedTime

  const k = 1 - Math.exp(-dt * 10)
  look.yaw += (lookTarget.yaw - look.yaw) * k
  look.pitch += (lookTarget.pitch - look.pitch) * k

  // Facteur de levée (regard) : 1 = éventail levé/regard avant, 0 = baissé/regard vers la table
  lookRaise = THREE.MathUtils.clamp(1 - (CENTER_LOOK.pitch - look.pitch) / FAN_DROP_SPAN, 0, 1)
  // Facteur « pli » : proportion du regard vers le bas (du centre jusqu'à la limite basse)
  const peek = smoothstep(THREE.MathUtils.clamp((CENTER_LOOK.pitch - look.pitch) / (CENTER_LOOK.pitch - LOOK.pitchMin), 0, 1))

  // Lacet : borné normalement en vue assise, resserré vers 0 quand on baisse → on reste centré sur le pli
  const yawLimit = camMode.value === 'overview' ? Math.PI : LOOK.yaw * (1 - peek)
  lookTarget.yaw = clamp(lookTarget.yaw + yawInput * YAW_SPEED * dt, -yawLimit, yawLimit)

  // Fondu doux entre vue assise et vue d'ensemble (Secret Table `CameraMode`)
  viewBlend += (viewTarget - viewBlend) * (1 - Math.exp(-dt * 5))
  const b = smoothstep(THREE.MathUtils.clamp(viewBlend, 0, 1))

  // Vue assise : œil au-dessus de la chaise locale
  seatPos.set(0, .51 + Math.sin(t * .7) * .003, 2.035)
  seatLookAt.set(-Math.sin(look.yaw) * Math.cos(look.pitch), Math.sin(look.pitch), -Math.cos(look.yaw) * Math.cos(look.pitch)).add(seatPos)
  // Zoom « pli » : on fond vers une caméra au-dessus de nos cartes, cadrée sur l'anneau de cartes posées
  seatPos.lerp(TRICK_POS, peek)
  seatLookAt.lerp(TRICK_TARGET, peek)
  const seatFovNow = seatFov + (TRICK_FOV - seatFov) * peek
  // Vue d'ensemble : caméra en orbite au-dessus de la table
  ovPos.set(Math.sin(look.yaw) * OVERVIEW.radius, OVERVIEW.height, Math.cos(look.yaw) * OVERVIEW.radius)

  camera.position.lerpVectors(seatPos, ovPos, b)
  lookAt.lerpVectors(seatLookAt, OVERVIEW_TARGET, b)
  camera.lookAt(lookAt)
  const fov = seatFovNow + (OVERVIEW.fov - seatFovNow) * b
  if (Math.abs(camera.fov - fov) > 1e-3) { camera.fov = fov; camera.updateProjectionMatrix() }

  syncCards(dt, t)
  updateAvatars(dt)
  updateHover()
  updateLabels()
  renderer.render(scene, camera)
}

/* ------------------------------------------------------------------ */
/*  Interaction                                                       */
/* ------------------------------------------------------------------ */
function setPointer(e: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
}

function pickMyCard(): CardObject | null {
  const mine = props.game.players[props.game.me]!.hand.map((id) => cards.get(id)).filter(Boolean) as CardObject[]
  if (!mine.length) return null
  raycaster.setFromCamera(pointer, camera)
  // Survol testé sur les proxies figés au repos (stables sous le curseur), pas sur les cartes animées
  const hits = raycaster.intersectObjects(fp.hitProxies.slice(0, mine.length), false)
  if (!hits.length) return null
  const id = hits[0]!.object.userData.cardId as string | undefined
  return id ? (cards.get(id) ?? null) : null
}

function updateHover() {
  const card = props.canPlay && !drag?.moved ? pickMyCard() : null
  if (card !== hovered) {
    if (hovered) setGlow(hovered, false)
    hovered = card
    if (hovered) setGlow(hovered, true)
    renderer.domElement.style.cursor = hovered ? 'pointer' : drag ? 'grabbing' : 'grab'
  }
}

function onPointerDown(e: PointerEvent) {
  setPointer(e)
  drag = { x: e.clientX, y: e.clientY, yaw: lookTarget.yaw, pitch: lookTarget.pitch, moved: false }
  renderer.domElement.setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  setPointer(e)
  if (!drag) return
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y
  if (dx * dx + dy * dy >= 36) drag.moved = true
  if (drag.moved) {
    // Secret Table `draggedLook` (orbite complète en vue d'ensemble)
    const yawLimit = camMode.value === 'overview' ? Math.PI : LOOK.yaw
    lookTarget.yaw = clamp(drag.yaw - dx * .0034, -yawLimit, yawLimit)
    lookTarget.pitch = clamp(drag.pitch + dy * .0028, LOOK.pitchMin, LOOK.pitchMax)
  }
}
function onPointerUp(e: PointerEvent) {
  setPointer(e)
  const wasDrag = drag?.moved
  drag = null
  if (wasDrag || !props.canPlay) return
  const card = pickMyCard()
  if (card) emit('play', card.userData.id)
}
function onPointerLeave() { pointer.set(9, 9) }

function onKey(e: KeyboardEvent, down: boolean) {
  if (e.key === 'ArrowLeft' || e.key === 'q') yawInput = down ? 1 : yawInput === 1 ? 0 : yawInput
  if (e.key === 'ArrowRight' || e.key === 'd') yawInput = down ? -1 : yawInput === -1 ? 0 : yawInput
}
const onKeyDown = (e: KeyboardEvent) => onKey(e, true)
const onKeyUp = (e: KeyboardEvent) => onKey(e, false)
const startTurnCam = (dir: number) => { yawInput = -dir }
const stopTurnCam = () => { yawInput = 0 }
const recenter = () => { lookTarget.yaw = CENTER_LOOK.yaw; lookTarget.pitch = CENTER_LOOK.pitch }

// Bascule automatique : vue assise quand c'est notre tour, vue d'ensemble sinon
function setMode(mode: CamMode) {
  if (camMode.value === mode) return
  camMode.value = mode
  viewTarget = mode === 'overview' ? 1 : 0
  // on recentre le regard/l'orbite à chaque changement de vue
  lookTarget.yaw = CENTER_LOOK.yaw; lookTarget.pitch = CENTER_LOOK.pitch; look.yaw = CENTER_LOOK.yaw
}
watch(isMyTurn, (mine) => setMode(mine ? 'seat' : 'overview'), { immediate: true })

function updateLabels() {
  const w = renderer.domElement.clientWidth
  const h = renderer.domElement.clientHeight
  seats.forEach((seat, i) => {
    if (i === props.game.me) return
    tmpV.set(seat.chair.x, seat.label + .06, seat.chair.z).project(camera)
    // Plaque ancrée sur la tête, mais qui pivote autour d'elle selon la position horizontale :
    // tête à gauche → s'étend vers la droite, tête à droite → vers la gauche. Elle reste donc
    // entièrement à l'écran et collée à la tête, sans glisser. Visible tant que la tête est en vue.
    const nx = THREE.MathUtils.clamp((tmpV.x + 1) / 2, 0, 1)
    labels[i]!.visible = tmpV.z < 1 && Math.abs(tmpV.x) < 1.05 && Math.abs(tmpV.y) < 1.1
    labels[i]!.x = nx * w
    labels[i]!.y = THREE.MathUtils.clamp((1 - tmpV.y) / 2, .06, .94) * h
    labels[i]!.ax = -nx * 100
  })
}

const initials = (name: string) => name.slice(0, 2).toUpperCase()

onMounted(() => {
  init()
  const el = renderer.domElement
  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', onPointerUp)
  el.addEventListener('pointercancel', () => { drag = null })
  el.addEventListener('pointerleave', onPointerLeave)
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  renderer.dispose()
})
</script>

<template>
  <div class="table3d">
    <div ref="mount" class="canvas" />
    <div class="vignette" />

    <template v-for="(p, i) in game.players" :key="p.id">
      <div
        v-if="i !== game.me && labels[i]!.visible"
        class="seat"
        :class="{
          active: game.current === i && ['betting', 'playing', 'excuse'].includes(game.phase),
          out: p.eliminated,
          won: game.phase === 'trickEnd' && game.lastTrickWinner === i,
        }"
        :style="{ transform: `translate(${labels[i]!.x}px, ${labels[i]!.y}px) translate(${labels[i]!.ax}%, -100%)` }"
      >
        <div class="plate" :class="{ away: p.away }">
          <span class="dot" :style="{ background: p.away ? '#4a4a55' : p.color }">{{ p.away ? '🤖' : initials(p.name) }}</span>
          <span class="name">{{ p.name }}<span v-if="p.away" class="ai-tag">IA</span></span>
          <span class="lives">{{ p.lives }} ♥</span>
          <span v-if="game.dealer === i" class="dealer">D</span>
        </div>
        <div v-if="p.bet !== null" class="bet">Pari {{ p.bet }} · Plis {{ p.tricks }}</div>
      </div>
    </template>

    <button
      class="arrow left" aria-label="Tourner à gauche"
      @pointerdown.prevent="startTurnCam(-1)" @pointerup="stopTurnCam"
      @pointerleave="stopTurnCam" @pointercancel="stopTurnCam" @contextmenu.prevent
    >‹</button>
    <button
      class="arrow right" aria-label="Tourner à droite"
      @pointerdown.prevent="startTurnCam(1)" @pointerup="stopTurnCam"
      @pointerleave="stopTurnCam" @pointercancel="stopTurnCam" @contextmenu.prevent
    >›</button>
    <button class="recenter" aria-label="Recentrer la caméra" @click="recenter">◎</button>
  </div>
</template>

<style scoped>
.table3d { position: absolute; inset: 0; touch-action: none; }
.canvas { position: absolute; inset: 0; }
.canvas :deep(canvas) { display: block; width: 100%; height: 100%; }
.vignette {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at 50% 55%, transparent 45%, rgba(0, 0, 0, .7) 100%);
}

/* Plaque nominative inspirée du D6 nameplate de Secret Table */
.seat {
  position: absolute; left: 0; top: 0;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  pointer-events: none;
}
.plate {
  display: flex; align-items: center; gap: 6px;
  padding: 3px 9px 3px 3px; border-radius: 6px;
  background: rgba(23, 36, 31, .86);
  border: 1px solid #59625a;
  color: #eee1c7; font-size: 12px; white-space: nowrap;
  transition: border-color .3s, box-shadow .3s;
}
.seat.active .plate { border-color: #e3be73; box-shadow: 0 0 14px rgba(227, 190, 115, .55); }
.seat.won .plate { border-color: #8fd3a5; box-shadow: 0 0 14px rgba(143, 211, 165, .55); }
.seat.out { opacity: .45; filter: grayscale(1); }
.dot {
  width: 22px; height: 22px; border-radius: 50%;
  display: grid; place-items: center; font-size: 10px; font-weight: 700; color: #fff;
}
.name { font-weight: 600; }
.plate.away { border-color: #7f8aa0; border-style: dashed; }
.plate.away .dot { font-size: 13px; }
.ai-tag {
  margin-left: 5px; padding: 0 5px; border-radius: 4px;
  background: #4a4a55; color: #cfe0ff; font-size: 9px; font-weight: 800; letter-spacing: .5px;
  vertical-align: middle;
}
.lives { color: #ff8a8a; font-weight: 700; }
.dealer {
  width: 16px; height: 16px; border-radius: 50%;
  background: #e3be73; color: #1b1f1e; font-size: 10px; font-weight: 800;
  display: grid; place-items: center;
}
.bet {
  font-size: 11px; padding: 1px 8px; border-radius: 10px;
  background: rgba(23, 36, 31, .8); color: #e3be73;
}

.arrow, .recenter { display: none; }
@media (max-width: 820px), (pointer: coarse) {
  .arrow {
    display: grid; place-items: center;
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 50px; height: 80px;
    font-size: 46px; line-height: 1;
    color: #e3be73;
    background: rgba(20, 14, 10, .45);
    border: none; outline: none;
    border-radius: 14px;
    touch-action: none;
    z-index: 5;
  }
  .arrow:active { background: rgba(110, 80, 30, .6); }
  .arrow.left { left: max(8px, env(safe-area-inset-left)); }
  .arrow.right { right: max(8px, env(safe-area-inset-right)); }
  .recenter {
    display: grid; place-items: center;
    position: absolute;
    right: max(10px, env(safe-area-inset-right));
    top: calc(max(14px, env(safe-area-inset-top)) + 56px);
    width: 36px; height: 36px; border-radius: 50%;
    font-size: 18px; color: #e3be73;
    background: rgba(20, 14, 10, .5);
    border: none;
    z-index: 5;
  }
  .plate { font-size: 10px; }
  .dot { width: 18px; height: 18px; font-size: 9px; }
  .bet { font-size: 10px; }
}
</style>
