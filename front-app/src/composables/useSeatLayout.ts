import { computed } from 'vue'
import type { Ref } from 'vue'
import { Player } from '@/modules/tarot_africain/models/Player'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useOrientation } from '@/composables/useOrientation'

export const SEAT_ROTATIONS: Record<string, string> = {
  'seat-top': '180deg',
  'seat-top-left': '180deg',
  'seat-top-right': '180deg',
  'seat-left': '90deg',
  'seat-right': '270deg',
  'seat-left-top': '90deg',
  'seat-left-bottom': '90deg',
  'seat-right-top': '270deg',
  'seat-right-bottom': '270deg',
}

export function useSeatLayout(numPlayers: Ref<number>, opponents: Ref<Player[]>) {
  const { isMobile } = useBreakpoint()
  const { isLandscape } = useOrientation()

  // 3 players
  const layout3 = computed(() => {
    if (isMobile.value && isLandscape.value) {
      return {
        'seat-left':  { left: '-12%', top: '50%', translate: '0 -50%' },
        'seat-right': { right: '-12%', top: '50%', translate: '0 -50%' },
      }
    } else if (isMobile.value) {
      return {
        'seat-left':  { left: '-15%', top: '55%', translate: '0 -50%' },
        'seat-right': { right: '-15%', top: '55%', translate: '0 -50%' },
      }
    } else {
      return {
        'seat-left':  { left: '-6%', top: '50%', translate: '0 -50%' },
        'seat-right': { right: '-6%', top: '50%', translate: '0 -50%' },
      }
    }
  })

  // 4 player
  const layout4 = computed(() => {
    if (isMobile.value && isLandscape.value) {
      return {
        'seat-left':  { left: '-10%', top: '60%', translate: '0 -50%' },
        'seat-top':   { left: '22%', top: '-5%' },
        'seat-right': { right: '-10%', top: '60%', translate: '0 -50%' },
      }
    } else if (isMobile.value) {
      return {
        'seat-left':  { left: '-15%', top: '55%', translate: '0 -50%' },
        'seat-top':   { left: '50%', top: '-2%', translate: '-50% 0' },
        'seat-right': { right: '-15%', top: '55%', translate: '0 -50%' },
      }
    } else {
      return {
        'seat-left':  { left: '-6%', top: '50%', translate: '0 -50%' },
        'seat-top':   { left: '22%', top: '-2%' },
        'seat-right': { right: '-6%', top: '50%', translate: '0 -50%' },
      }
    }
  })

  // 5 player
  const layout5 = computed(() => {
    if (isMobile.value && isLandscape.value) {
      return {
        'seat-left':      { left: '-2%', top: '55%', translate: '0 -50%' },
        'seat-top-left':  { left: '24%',  top: '-6%' },
        'seat-top-right': { right: '24%', top: '-6%' },
        'seat-right':     { right: '-2%', top: '55%', translate: '0 -50%' },
      }
    } else if (isMobile.value) {
      return {
        'seat-left-bottom':  { left: '-1%', top: '65%', translate: '0 -50%' },
        'seat-left-top':     { left: '-1%', top: '28%', translate: '0 -50%' },
        'seat-right-top':    { right: '-1%', top: '28%', translate: '0 -50%' },
        'seat-right-bottom': { right: '-1%', top: '65%', translate: '0 -50%' },
      }
    } else {
      return {
        'seat-left':      { left: '-6%',  top: '50%', translate: '0 -50%' },
        'seat-top-left':  { left: '22%',  top: '-2%' },
        'seat-top-right': { right: '22%', top: '-2%' },
        'seat-right':     { right: '-6%', top: '50%', translate: '0 -50%' },
      }
    }
  })

  const seatsWithPlayers = computed(() => {
    let currentLayout: Record<string, any> = {}

    if (numPlayers.value === 3) currentLayout = layout3.value
    else if (numPlayers.value === 4) currentLayout = layout4.value
    else if (numPlayers.value === 5) currentLayout = layout5.value
    else currentLayout = layout4.value

    return Object.entries(currentLayout).map(([seat, style], index) => ({
      seat,
      seatStyle: style,
      player: opponents.value[index] || null,
    }))
  })

  return { seatsWithPlayers, SEAT_ROTATIONS }
}
