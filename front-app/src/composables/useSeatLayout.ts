import { computed } from 'vue'
import type { Ref } from 'vue'
import { Player } from '@/modules/tarot_africain/models/Player'
import { useBreakpoint } from '@/composables/useBreakpoint'

const SEAT_CONFIGURATIONS_DEFAULT: Record<number, string[]> = {
  2: ['seat-top'],
  3: ['seat-left', 'seat-right'],
  4: ['seat-left', 'seat-top', 'seat-right'],
  5: ['seat-left', 'seat-top-left', 'seat-top-right', 'seat-right'],
}

const SEAT_CONFIGURATIONS_MOBILE: Record<number, string[]> = {
  2: ['seat-top'],
  3: ['seat-left', 'seat-right'],
  4: ['seat-left', 'seat-top', 'seat-right'],
  5: ['seat-left-top', 'seat-left-bottom', 'seat-right-top', 'seat-right-bottom'],
}

export const SEAT_ROTATIONS: Record<string, string> = {
  'seat-top':          '180deg',
  'seat-top-left':     '180deg',
  'seat-top-right':    '180deg',
  'seat-left':         '90deg',
  'seat-right':        '270deg',
  'seat-left-top':     '90deg',
  'seat-left-bottom':  '90deg',
  'seat-right-top':    '270deg',
  'seat-right-bottom': '270deg',
}

export const SEAT_STYLES: Record<string, Partial<CSSStyleDeclaration>> = {
  'seat-top':          { left: '50%',  top: '-2%',  translate: '-50%' },
  'seat-left':         { left: '-6%',  top: '50%',  translate: '0 -50%' },
  'seat-right':        { right: '-6%', top: '50%',  translate: '0 -50%' },
  'seat-top-left':     { left: '22%',  top: '-2%' },
  'seat-top-right':    { right: '22%', top: '-2%' },
  'seat-left-top':     { left: '-5%',  top: '28%',  translate: '0 -50%' },
  'seat-left-bottom':  { left: '-5%',  top: '65%',  translate: '0 -50%' },
  'seat-right-top':    { right: '-5%', top: '28%',  translate: '0 -50%' },
  'seat-right-bottom': { right: '-5%', top: '65%',  translate: '0 -50%' },
}

export function useSeatLayout(numPlayers: Ref<number>, opponents: Ref<Player[]>) {
  const { isMobile } = useBreakpoint()

  const seatsWithPlayers = computed(() => {
    const config = isMobile.value ? SEAT_CONFIGURATIONS_MOBILE : SEAT_CONFIGURATIONS_DEFAULT
    const seats = config[numPlayers.value] ?? []
    return seats.map((seat, index) => ({
      seat,
      seatStyle: SEAT_STYLES[seat] ?? {},
      player: opponents.value[index] ?? null,
    }))
  })

  return { seatsWithPlayers, SEAT_ROTATIONS }
}
