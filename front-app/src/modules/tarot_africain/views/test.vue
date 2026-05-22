<template>
  <div class="main-container bg-red-400">
    <MyFelt />
  </div>
</template>

<script setup lang="ts">

import MyFelt from '@/modules/components/MyFelt.vue';

</script>

<style scoped>
.main-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
