<script setup lang="ts">
  interface Tag {
    id: number
    name: string
    color: string
  }

  defineProps<{
    name?: string
    description?: string
    image?: string
    imageAlt?: string
    tags: Tag[]
  }>()

  const RUNES = [
    'ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ',
    'ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ',
    'ᛚ','ᛗ','ᛜ','ᛞ','ᛟ'
  ]

  const randomRunes = RUNES
    .toSorted(() => Math.random() - 0.5)
    .slice(0, 5)
    .join(' ')
</script>

<template>
  <div
    class="
      group relative overflow-hidden cursor-pointer border
      border-orange-600/60
      -translate-y-0.5
      shadow-[0_8px_32px_rgba(0,0,0,.7),0_0_20px_rgba(200,60,10,.2)]
      transition-all duration-300
      hover:border-orange-500
      hover:shadow-[0_10px_40px_rgba(0,0,0,.8),0_0_28px_rgba(220,80,20,.25)]"
    style="
      background: linear-gradient(
        135deg,
        rgba(20,8,4,.85),
        rgba(35,12,5,.9),
        rgba(20,8,4,.85)
      );
      backdrop-filter: blur(8px);">

    <div class="
      absolute inset-0 pointer-events-none
      opacity-100
      bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,60,15,0.08),transparent_80%)]
      transition-opacity duration-300
      group-hover:opacity-100"/>

    <div :class="['flex', image ? 'flex-row' : 'flex-col']">
      <figure
        v-if="image" class="relative shrink-0 w-36 overflow-hidden">
        <img
          :src="image"
          :alt="imageAlt || name"
          class="
            h-full w-full object-cover
            opacity-80 scale-105
            transition-transform duration-500
            group-hover:scale-110 "/>

        <div class="absolute inset-0 bg-gradient-to-r from-transparent to-black/70"/>
      </figure>

      <div class="flex flex-1 min-w-0 flex-col">
        <div class="flex items-center gap-2 px-4 pt-4">
          <span class="font-serif text-sm tracking-widest text-orange-400/75">
            {{ randomRunes }}
          </span>

          <div
            class="h-px flex-1 bg-gradient-to-r from-orange-700/40 to-transparent"
          />
        </div>

        <div class="card-body gap-2 pt-3">
          <h3 class="card-name font-luckiest text-xl tracking-widesttext-orange-50">
            {{ name }}
          </h3>

          <div class="flex items-center gap-2 opacity-70">
            <div class="h-px flex-1 bg-orange-800" />
            <!-- <span class="text-xs text-orange-400">✦</span> -->
             <span class="text-xs text-orange-400">ᛟ</span>
            <div class="h-px flex-1 bg-orange-800" />
          </div>

          <p v-if="description" class="line-clamp-3 text-l italictext-orange-200">
            {{ description }}
          </p>

          <div v-if="tags.length" class="mt-1 flex flex-wrap gap-1.5">
            <span
              v-for="tag in tags"
              :key="tag.id"
              class="badge badge-sm border text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm"
              :style="{
                color: tag.color,
                borderColor: tag.color,
                backgroundColor: `${tag.color}33`
              }">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <span
      class="
        absolute bottom-0 right-3
        pointer-events-none select-none
        font-serif text-6xl leading-none
        text-orange-700/13
      "
    >
      ᚱ
    </span>
  </div>
</template>
