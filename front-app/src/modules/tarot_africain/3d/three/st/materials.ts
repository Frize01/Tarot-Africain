/**
 * Adapted from Secret Table — `packages/scene/src/materials/SceneMaterials.tsx`
 * (https://github.com/mertertek/secret-table-game, CC BY-NC-SA 4.0).
 * React context removed: textures are created once and shared.
 */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

export function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponible')
  draw(ctx)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function surfaceTexture(kind: 'wood' | 'felt') {
  const texture = canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = kind === 'wood' ? '#72533f' : '#477363'
    ctx.fillRect(0, 0, 512, 512)
    let seed = 37
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
    if (kind === 'wood') {
      for (let y = 0; y < 512; y += 1) {
        ctx.strokeStyle = `rgba(${random() > .5 ? '37,17,8' : '202,158,104'},${random() * .11})`
        ctx.lineWidth = random() * 2 + .3
        ctx.beginPath()
        for (let x = 0; x <= 512; x += 8) {
          const dy = Math.sin(x / 83 + y / 44) * 6 + Math.sin(x / 31 + y / 73) * 2
          if (x === 0) ctx.moveTo(x, y + dy); else ctx.lineTo(x, y + dy)
        }
        ctx.stroke()
      }
    } else {
      for (let i = 0; i < 46000; i++) {
        ctx.fillStyle = `rgba(${random() > .5 ? '224,238,210' : '2,23,13'},${random() * .19})`
        ctx.fillRect(random() * 512, random() * 512, .7, 1.6)
      }
    }
  })
  texture.wrapS = texture.wrapT = RepeatWrapping
  if (kind === 'felt') texture.repeat.set(3, 3)
  return texture
}

let shared: { wood: CanvasTexture; felt: CanvasTexture } | null = null
export function sceneMaterials() {
  shared ??= { wood: surfaceTexture('wood'), felt: surfaceTexture('felt') }
  return shared
}

/** Same lettering helper as Secret Table's `objects/Surface.tsx`. */
export function lettering(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number,
  color = '#252b2c', serif = false, maxWidth?: number) {
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${serif ? 600 : 550} ${size}px ${serif ? 'Georgia, serif' : 'Poppins, sans-serif'}`
  ctx.fillText(text, x, y, maxWidth)
}
