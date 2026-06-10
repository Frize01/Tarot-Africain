export function getStaggerIndex(index, totalCount, direction = 'start') {
  if (direction === 'end') return totalCount - 1 - index
  if (direction === 'center') return Math.abs(index - Math.floor(totalCount / 2))
  return index
}

export function animateElements(elements, options, applyStyle) {
  const { duration, delay, stagger, direction } = options
  const count = elements.length

  return new Promise((resolve) => {
    let resolved = false
    const triggerResolve = () => {
      if (!resolved) { resolved = true; resolve() }
    }

    let maxDelay = 0

    elements.forEach((el, i) => {
      if (!el) return

      const staggerIndex = getStaggerIndex(i, count, direction)
      const totalDelay = delay + staggerIndex * stagger
      if (totalDelay > maxDelay) maxDelay = totalDelay

      el.style.transition = 'none'
      applyStyle(el, 'prepare')

      void el.offsetHeight

      applyStyle(el, 'animate', totalDelay)
    })
    setTimeout(triggerResolve, maxDelay + duration + 50)
  })
}
