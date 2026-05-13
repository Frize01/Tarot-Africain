<script setup lang="ts">

  import { ref } from 'vue'

  import VButton from '@/components/VButton.vue'
  import VInput from '@/components/VInput.vue'

  const email = ref('')
  const password = ref('')
  const rememberMe = ref(false)

  function handleLogin() {
    console.log('Login attempt:', { email: email.value, password: password.value, rememberMe: rememberMe.value })
  }

</script>

<template>
  <!-- ── Login ── -->
  <form class="grid gap-4" @submit.prevent>

    <VInput
      v-model="email"
      type="email"
      placeholder="Email"
      autocomplete="email"
      required
    />

    <VInput
      v-model="password"
      type="password"
      placeholder="Mot de passe"
      autocomplete="current-password"
      required
    />



    <!-- Remember -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <label class="label cursor-pointer gap-2 py-0">
        <input type="checkbox" class="checkbox checkbox-sm shrink-0" v-model="rememberMe" />
        <span class="label-text text-sm">Se souvenir de moi</span>
      </label>
      <a class="link link-hover text-sm">Mot de passe oublié?</a>
    </div>

    <v-button
      color="bg-neutral"
      textColor="text-white"
      @click="handleLogin">
      Se connecter
    </v-button>

    <div class="divider my-0 text-xs opacity-70">ou se connecter avec</div>

    <!-- Reseaux -->
    <div class="grid grid-cols-3 gap-2">

      <v-button
        aria-label="Sign in with Google"
        color="bg-white">
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <g>
            <path d="m0 0H512V512H0" fill="#fff"/>
            <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"/>
            <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"/>
            <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"/>
            <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"/>
          </g>
        </svg>
      </v-button>

      <v-button
        aria-label="Sign in with Twitter"
        color="bg-white">
        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
        </svg>
      </v-button>

      <v-button
        aria-label="Sign in with GitHub"
        color="bg-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 640 640" fill="currentColor">
          <path d="M319.988 7.973C143.293 7.973 0 151.242 0 327.96c0 141.392 91.678 261.298 218.826 303.63 16.004 2.964 21.886-6.957 21.886-15.414 0-7.63-.319-32.835-.449-59.552-89.032 19.359-107.8-37.772-107.8-37.772-14.552-36.993-35.529-46.831-35.529-46.831-29.032-19.879 2.209-19.442 2.209-19.442 32.126 2.245 49.04 32.954 49.04 32.954 28.56 48.922 74.883 34.76 93.131 26.598 2.882-20.681 11.15-34.807 20.315-42.803-71.08-8.067-145.797-35.516-145.797-158.14 0-34.926 12.52-63.485 32.965-85.88-3.33-8.078-14.291-40.606 3.083-84.674 0 0 26.87-8.61 88.029 32.8 25.512-7.075 52.878-10.642 80.056-10.76 27.2.118 54.614 3.673 80.162 10.76 61.076-41.386 87.922-32.8 87.922-32.8 17.398 44.08 6.485 76.631 3.154 84.675 20.516 22.394 32.93 50.953 32.93 85.879 0 122.907-74.883 149.93-146.117 157.856 11.481 9.921 21.733 29.398 21.733 59.233 0 42.792-.366 77.28-.366 87.804 0 8.516 5.764 18.473 21.992 15.354 127.076-42.354 218.637-162.274 218.637-303.582 0-176.695-143.269-319.988-320-319.988l-.023.107z"/>
        </svg>
      </v-button>

    </div>
  </form>
</template>
