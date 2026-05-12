<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="max-lg:collapse bg-base-200 lg:mb-48 shadow-sm w-full rounded-md">
    <input id="navbar-1-toggle" class="peer hidden" type="checkbox" />
    <label for="navbar-1-toggle" class="fixed inset-0 hidden max-lg:peer-checked:block"></label>
    <div class="collapse-title navbar">
      <div class="navbar-start">
        <label for="navbar-1-toggle" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
        </label>
        <button class="btn btn-ghost text-xl">logo</button>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <!-- <li><RouterLink to="/">Accueil</RouterLink></li> -->
          <!-- <li>
            <details>
              <summary>Parent</summary>
              <ul class="p-2 bg-base-100 w-40 z-1">
                <li><button>Submenu 1</button></li>
                <li><button>Submenu 2</button></li>
              </ul>
            </details>
          </li> -->
          <li><RouterLink to="/categories">Catégories</RouterLink></li>
          <li><RouterLink to="/about">À propos</RouterLink></li>
        </ul>
      </div>
      <div class="navbar-end flex gap-2">
        <input type="text" placeholder="Rechercher..." class="input input-bordered w-64 lg:w-auto hidden sm:block" />
        <button class="btn btn-primary gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-miterlimit="10"
            aria-hidden="true"
            >
            <circle cx="12" cy="7.25" r="5.73" />
            <path d="M1.5,23.48l.37-2.05A10.3,10.3,0,0,1,12,13h0a10.3,10.3,0,0,1,10.13,8.45l.37,2.05" />
          </svg>
          Se connecter
        </button>
      </div>
    </div>

    <div class="collapse-content lg:hidden z-1">
      <input type="text" placeholder="Rechercher..." class="input input-bordered w-full sm:hidden" />

      <ul class="menu">

        <!-- <li><RouterLink to="/">Accueil</RouterLink></li> -->
        <!-- <li>
          <button>Parent</button>
          <ul>
            <li><button>Submenu 1</button></li>
            <li><button>Submenu 2</button></li>
          </ul>
        </li> -->
        <li><RouterLink to="/categories">Catégories</RouterLink></li>
        <li><RouterLink to="/about">À propos</RouterLink></li>
      </ul>
    </div>
  </div>
</template>
