<template>

  <button @click="handleLogout">
    Déconnection
  </button>

</template>


<script setup lang="ts">

  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import apiMethods from '@/api'

  const { logoutUser } = useAuth()
  const router = useRouter()



  async function handleLogout() {

    const message=''
    const result = await apiMethods.logout();

    if (result.success) {
      logoutUser();
      router.push('/');
    } else {
      console.log('error',result.message);
    }
  }
</script>
