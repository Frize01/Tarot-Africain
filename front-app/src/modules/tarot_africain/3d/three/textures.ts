import * as THREE from 'three'

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!]
}

function toTexture(canvas: HTMLCanvasElement, repeat?: [number, number]) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(repeat[0], repeat[1])
  }
  return tex
}

/* ---------------- Cartes de tarot ---------------- */
const CW = 256
const CH = 372
const cache = new Map<string, THREE.Texture>()

const GOLD = '#c9a24a'
const RED = '#7a1a1a'

function hueFor(v: number) {
  return Math.round((v / 21) * 300)
}

function paper(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CW / 2, CH / 2, 30, CW / 2, CH / 2, CH * 0.7)
  g.addColorStop(0, '#fbf4e2')
  g.addColorStop(1, '#e6d3ab')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, CW, CH)
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(90,60,25,${Math.random() * 0.06})`
    ctx.fillRect(Math.random() * CW, Math.random() * CH, 2, 2)
  }
}

function frame(ctx: CanvasRenderingContext2D, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 7
  ctx.strokeRect(12, 12, CW - 24, CH - 24)
  ctx.lineWidth = 2
  ctx.strokeRect(24, 24, CW - 48, CH - 48)
}

function corner(ctx: CanvasRenderingContext2D, text: string, color: string) {
  const draw = () => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(-26, -24, 52, 48, 8)
    ctx.fill()
    ctx.fillStyle = '#fff8e6'
    ctx.font = `bold ${text.length > 1 ? 32 : 36}px Georgia, serif`
    ctx.fillText(text, 0, 2)
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.save(); ctx.translate(52, 54); draw(); ctx.restore()
  ctx.save(); ctx.translate(CW - 52, CH - 54); ctx.rotate(Math.PI); draw(); ctx.restore()
}

function sun(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 3
  for (let i = 0; i < 24; i++) {
    ctx.rotate((Math.PI * 2) / 24)
    ctx.beginPath()
    ctx.moveTo(r * 0.75, 0)
    ctx.lineTo(r * (i % 2 ? 1.0 : 1.18), 0)
    ctx.stroke()
  }
  ctx.globalAlpha = 0.18
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function trumpFront(v: number) {
  const [c, ctx] = makeCanvas(CW, CH)
  const color = `hsl(${hueFor(v)}, 55%, 32%)`
  paper(ctx)
  frame(ctx, color)
  corner(ctx, String(v), color)
  sun(ctx, CW / 2, CH / 2 - 10, 92, color)
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${v > 9 ? 120 : 140}px Georgia, serif`
  ctx.fillText(String(v), CW / 2, CH / 2 - 4)
  ctx.font = 'bold 22px Georgia, serif'
  ctx.fillStyle = RED
  ctx.fillText('ATOUT', CW / 2, CH - 62)
  return toTexture(c)
}

// value indéfini = Excuse non jouée (★, « 0 ou 22 »).
// value = 0 ou 22 = Excuse posée → on affiche le nombre choisi pour que tout le monde le voie.
function excuseFront(value?: number) {
  const [c, ctx] = makeCanvas(CW, CH)
  const played = value != null
  const big = played ? String(value) : '★'
  paper(ctx)
  frame(ctx, GOLD)
  corner(ctx, big, RED)
  sun(ctx, CW / 2, CH / 2 - 20, 96, GOLD)
  ctx.fillStyle = RED
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = played ? 'bold 140px Georgia, serif' : '150px serif'
  ctx.fillText(big, CW / 2, CH / 2 - 20)
  ctx.font = 'bold 30px Georgia, serif'
  ctx.fillText('EXCUSE', CW / 2, CH - 84)
  ctx.font = 'bold 22px Georgia, serif'
  ctx.fillStyle = '#8a6a12'
  ctx.fillText(played ? `VAUT ${value}` : '0  ou  22', CW / 2, CH - 56)
  return toTexture(c)
}

function cardBack() {
  const [c, ctx] = makeCanvas(CW, CH)
  ctx.fillStyle = '#6b1717'
  ctx.fillRect(0, 0, CW, CH)
  ctx.save()
  ctx.beginPath()
  ctx.rect(24, 24, CW - 48, CH - 48)
  ctx.clip()
  ctx.strokeStyle = 'rgba(232,196,106,0.3)'
  ctx.lineWidth = 2
  for (let i = -CH; i < CW + CH; i += 20) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + CH, CH); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(i + CH, 0); ctx.lineTo(i, CH); ctx.stroke()
  }
  ctx.restore()
  frame(ctx, GOLD)
  sun(ctx, CW / 2, CH / 2, 70, '#f0cf7a')
  ctx.beginPath()
  ctx.arc(CW / 2, CH / 2, 50, 0, Math.PI * 2)
  ctx.fillStyle = '#4a0e0e'
  ctx.fill()
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.fillStyle = '#f0cf7a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 38px Georgia, serif'
  ctx.fillText('TA', CW / 2, CH / 2 + 2)
  return toTexture(c)
}

export function cardTexture(id: string) {
  const key = id.startsWith('X') ? 'back' : id
  if (!cache.has(key)) {
    let tex
    if (key === 'back') tex = cardBack()
    else if (key === 'E') tex = excuseFront()           // Excuse non encore jouée
    else if (key[0] === 'E') tex = excuseFront(Number(key.slice(1))) // 'E0' / 'E22' : Excuse posée
    else tex = trumpFront(Number(key))
    cache.set(key, tex)
  }
  return cache.get(key)!
}

/* ---------------- Tapis / bois / décor ---------------- */
export function feltTexture() {
  const S = 1024
  const [c, ctx] = makeCanvas(S, S)
  const g = ctx.createRadialGradient(S / 2, S / 2, 40, S / 2, S / 2, S / 2)
  g.addColorStop(0, '#236b46')
  g.addColorStop(0.75, '#1a5236')
  g.addColorStop(1, '#123d28')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  for (let i = 0; i < 40000; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.035)'
    ctx.fillRect(Math.random() * S, Math.random() * S, 1.5, 1.5)
  }
  // filets dorés
  ctx.strokeStyle = 'rgba(232,196,106,0.55)'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.arc(S / 2, S / 2, S * 0.43, 0, Math.PI * 2); ctx.stroke()
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(S / 2, S / 2, S * 0.415, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(232,196,106,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(S / 2, S / 2, S * 0.17, 0, Math.PI * 2); ctx.stroke()
  return toTexture(c)
}

export function woodTexture(base = '#5e2f1a', repeat: [number, number] = [1, 1]) {
  const [c, ctx] = makeCanvas(1024, 1024)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 1024, 1024)
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * 1024
    const dark = Math.random() < 0.6
    ctx.strokeStyle = dark ? `rgba(30,12,4,${Math.random() * 0.22})` : `rgba(220,150,90,${Math.random() * 0.12})`
    ctx.lineWidth = Math.random() * 3 + 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    const amp = Math.random() * 18
    ctx.bezierCurveTo(300, y + amp, 700, y - amp, 1024, y + amp * 0.5)
    ctx.stroke()
  }
  return toTexture(c, repeat)
}

export function plankTexture(repeat: [number, number] = [7, 7]) {
  const [c, ctx] = makeCanvas(1024, 1024)
  const rows = 8
  const h = 1024 / rows
  for (let r = 0; r < rows; r++) {
    let x = -Math.random() * 400
    while (x < 1024) {
      const w = 300 + Math.random() * 300
      ctx.fillStyle = `hsl(22, 40%, ${13 + Math.random() * 7}%)`
      ctx.fillRect(x, r * h, w, h)
      for (let i = 0; i < 14; i++) {
        ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.18})`
        ctx.lineWidth = Math.random() * 2
        const y = r * h + Math.random() * h
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + (Math.random() - 0.5) * 6); ctx.stroke()
      }
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillRect(x, r * h, 3, h)
      x += w
    }
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, r * h, 1024, 3)
  }
  return toTexture(c, repeat)
}

export function wallpaperTexture(repeat: [number, number] = [14, 1]) {
  const [c, ctx] = makeCanvas(256, 512)
  ctx.fillStyle = '#2a1410'
  ctx.fillRect(0, 0, 256, 512)
  ctx.fillStyle = '#331a14'
  ctx.fillRect(0, 0, 128, 512)
  ctx.fillStyle = 'rgba(240,200,110,0.08)'
  for (let y = 20; y < 380; y += 64) {
    ctx.beginPath(); ctx.arc(64, y, 9, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(192, y + 32, 9, 0, Math.PI * 2); ctx.fill()
  }
  ctx.fillStyle = '#4a2414'
  ctx.fillRect(0, 392, 256, 120)
  ctx.fillStyle = GOLD
  ctx.fillRect(0, 388, 256, 5)
  return toTexture(c, repeat)
}

export function dotTexture() {
  const [c, ctx] = makeCanvas(32, 32)
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(c)
}
