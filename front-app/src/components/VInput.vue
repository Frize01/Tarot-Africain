<script setup lang="ts">
const model = defineModel<string>()

const props = defineProps<{
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  placeholder?: string
  autocomplete?: string
  required?: boolean
  positionContent?: 'left' | 'right'
  colorContent?: string
  color?: string
}>()

</script>

<template>
  <label
    class="input input-bordered flex items-center gap-2 w-full focus-within:border-neutral focus-within:outline-none"
    :class="[
      { 'flex-row-reverse': positionContent === 'right' },
    ]"
    :style="{ backgroundColor: color }"
  >

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

