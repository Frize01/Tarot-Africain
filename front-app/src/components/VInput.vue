<script setup lang="ts">
const model = defineModel<string>()

defineProps<{
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  placeholder?: string
  autocomplete?: string
  required?: boolean
  positionContent?: 'left' | 'right'
  colorContent?: string
}>()
</script>

<template>
  <label
    class="input input-bordered flex items-center gap-2 w-full focus-within:border-neutral focus-within:outline-none"
    :class="{ 'flex-row-reverse': positionContent === 'right' }"
  >
    <span v-if="$slots.content" :class="colorContent || 'opacity-70'">
      <slot name="content"></slot>
    </span>

    <input
      v-model="model"
      :type="type || 'text'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      class="grow"
    />
  </label>
</template>

