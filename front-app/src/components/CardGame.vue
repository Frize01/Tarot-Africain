<script setup lang="ts">
interface Tag {
  title: string
  color: string
}

const props = defineProps<{
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  tags: Tag[]
}>()

const RUNES_LIST = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛚᛗᛜᛞᛟ'.split('')
const randomRunes = [...RUNES_LIST].sort(() => Math.random() - 0.5).slice(0, 5).join(' ')
</script>

<template>
  <div
    class="group relative overflow-hidden cursor-pointer border transition-all duration-300
      border-orange-900 shadow-[0_4px_24px_rgba(0,0,0,.6)]
      hover:border-orange-600/60 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,.7),0_0_20px_rgba(200,60,10,.2)]"
    style="background: linear-gradient(135deg, rgba(20,8,4,.85), rgba(35,12,5,.9) 100%, rgba(20,8,4,.85)); backdrop-filter: blur(8px);"
  >
    <!-- glow -->
    <div class="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,60,15,0.08),transparent_70%)]" />

    <div :class="['flex', image ? 'flex-row' : 'flex-col']">
      <figure v-if="image" class="relative shrink-0 w-36 overflow-hidden">
        <img
          :src="image" :alt="imageAlt || title"
          class="w-full h-full object-cover transition-all duration-500 opacity-60 group-hover:opacity-80 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-transparent to-black/70" />
      </figure>

      <div class="flex flex-col flex-1 min-w-0">
        <!-- random runes -->
        <div class="flex items-center gap-2 px-4 pt-4">
          <span class="font-serif text-sm tracking-widest text-orange-700/40 transition-colors group-hover:text-orange-400/75">
            {{ randomRunes }}
          </span>
          <div class="flex-1 h-px bg-gradient-to-r from-orange-800/30 to-transparent" />
        </div>

        <div class="card-body gap-2 pt-3">
          <h3 class="card-title font-luckiest text-sm tracking-widest text-orange-100/75 transition-colors group-hover:text-orange-50">
            {{ title }}
          </h3>

          <!-- sepparateur -->
          <div class="flex items-center gap-2 opacity-30 group-hover:opacity-70 transition-opacity">
            <div class="flex-1 h-px bg-orange-900" />
            <span class="text-xs text-orange-500">✦</span>
            <div class="flex-1 h-px bg-orange-900" />
          </div>

          <p v-if="description" class="text-xs italic line-clamp-3 text-orange-200/40 transition-colors group-hover:text-orange-200/65">
            {{ description }}
          </p>

          <div v-if="tags.length" class="flex flex-wrap gap-1.5 mt-1">
            <span
              v-for="tag in tags" :key="tag.title"
              class="badge badge-sm text-[10px] tracking-wider border"
              :style="{
                color: tag.color,
                borderColor: `${tag.color}50`,
                backgroundColor: `${tag.color}18`
              }"
            >{{ tag.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- rune R -->
    <span class="absolute bottom-0 right-3 font-serif text-6xl leading-none select-none pointer-events-none transition-colors text-orange-900/6 group-hover:text-orange-700/13">
      ᚱ
    </span>
  </div>
</template>
