<template>
  <button
    type="button"
    class="btn border-none"
    :class="[fullWidth ? 'w-full' : '', color, textColor, size]"
    :aria-label="ariaLabel"
  >
    <slot name="icon"></slot>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel?: string
    color?: string
    textColor?: string
    size?: string
    fullWidth?: boolean
  }>(),
  {
    color: 'bg-white',
    textColor: 'text-black',
    size: '',
    fullWidth: false
  }
)

defineSlots<{
  icon?: () => any
  default?: () => any
}>()
</script>
