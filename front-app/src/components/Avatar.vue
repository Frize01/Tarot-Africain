<template>
  <div class="relative" :class="sizeAdapt[size][1]">

    <div class="avatar avatar-placeholder">
      <div
        class="bg-neutral text-neutral-content rounded-full border-4 ]"
        :class="sizeAdapt[size][1]"
        :style="{ backgroundColor: !imageUrl ? color || '#999' : 'transparent', borderColor: color || '#999' }">

        <img
          v-if="imageUrl"
          :src="imageUrl"
          alt="player image" />

        <span v-else
          :class="sizeAdapt[size][0]">{{ name.substring(0, 2).toUpperCase() }}
        </span>
      </div>
    </div>

    <div
      v-if="lifePoints !== undefined"
      class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-5 bg-gray-800 border-2 text-white text-lg font-bold px-3 rounded flex items-center"
      :style="{
        borderColor: color || '#999',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4))`,
        backgroundColor: color || '#999'
      }"
    >
      {{ lifePoints }}
      <span class="ml-1">
        <svg :fill="color" width="16px" height="16px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
          <path d="M220.3457,136.50781l-81.03125,81.03125a16.013,16.013,0,0,1-22.625,0L33.58008,134.42969a59.974,59.974,0,0,1,2.34375-87.07031c23.28125-21.01563,61.25-19.05469,84.57812,4.29687l7.5,7.49219,9.57813-9.57813a60.69786,60.69786,0,0,1,43.98437-17.55469A59.54956,59.54956,0,0,1,224.627,51.90625C245.61133,75.20312,243.68945,113.15625,220.3457,136.50781Z"/>
        </svg>
      </span>
    </div>

    <div v-if="foldsMade !== null"
      class="absolute top-0 border-2 left-0 -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center"
      :style="{
        borderColor: color || '#999',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4))`,
        backgroundColor: color || '#999'
      }"
    >
      {{ foldsMade }}
      <span class="ml-1 text-lg">
        <svg height="24" width="24" version="1.1"
	        viewBox="0 0 512 512"  xml:space="preserve">
          <g fill="white">
            <path class="st0" d="M392.293,0H119.708c-24.42,0.008-44.194,19.783-44.202,44.202v423.597
              c0.008,24.419,19.783,44.193,44.202,44.202h272.585c24.418-0.008,44.193-19.783,44.202-44.202V44.202
              C436.486,19.783,416.711,0.008,392.293,0z M392.293,490.311H119.708c-12.426-0.024-22.488-10.087-22.513-22.512V44.202
              c0.025-12.425,10.087-22.488,22.513-22.512h272.585c12.425,0.024,22.488,10.087,22.512,22.512v423.597
              C414.781,480.224,404.718,490.286,392.293,490.311z"/>
            <path class="st0" d="M314.098,190.006c-21.575-17.15-51.722-5.133-58.102,18.846c-6.363-23.979-36.51-35.996-58.086-18.846
              c-20.662,16.442-18.993,49.181,1.239,75.416c18.699,24.248,47.917,47.616,55.78,63.838l1.067,0.798l1.084-0.798
              c7.863-16.223,37.08-39.591,55.78-63.838C333.091,239.187,334.753,206.449,314.098,190.006z"/>
            <path class="st0" d="M182.625,60.327c-9.786-7.765-23.442-2.323-26.334,8.538c-2.876-10.861-16.532-16.304-26.318-8.538
              c-9.354,7.455-8.612,22.276,0.562,34.163c8.474,11.008,21.714,21.584,25.274,28.925l0.481,0.366l0.497-0.366
              c3.561-7.341,16.801-17.917,25.274-28.925C191.237,82.602,191.979,67.782,182.625,60.327z"/>
            <path class="st0" d="M355.7,414.56c-2.876-10.861-16.531-16.304-26.317-8.538c-9.354,7.455-8.612,22.276,0.562,34.164
              c8.473,11.007,21.706,21.583,25.274,28.924l0.48,0.366l0.498-0.366c3.561-7.341,16.801-17.917,25.274-28.924
              c9.174-11.888,9.916-26.709,0.562-34.164C372.249,398.257,358.593,403.699,355.7,414.56z"/>
          </g>
        </svg>
      </span>
    </div>


    <!-- <div
      v-if="foldsAnnounced !== undefined"
      class="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-green-700 bg-opacity-90 text-white text-xs font-bold px-2 py-1 rounded-lg"
    >
      x{{ foldsAnnounced }}
    </div> -->

    <div v-if="foldsAnnounced !== null"
      class="absolute top-0 border-2 right-0 translate-x-1/4 -translate-y-1/4 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center"
      :style="{
        borderColor: color || '#999',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4))`,
        backgroundColor: color || '#999'
      }"
    >
        {{ foldsAnnounced }}

        <svg width="16" height="16" viewBox="0 0 30 30">
          <g style="opacity:1">
            <path
              id="rect881"
              style="fill:#ffffff;fill-opacity:1;stroke-width:0.264583"
              d="m 21.896484,5.0566406 -0.875,1.7832032 c 1.606692,0.78762 2.911492,2.1908405 3.539063,4.0253902 0.62757,1.83455 0.455603,3.744873 -0.332031,5.351563 l 1.783203,0.873047 C 27.026493,15.019794 27.255618,12.56465 26.453125,10.21875 25.65063,7.8728599 23.966527,6.0714206 21.896484,5.0566406 Z M 16.833984,5.9257812 3.2734375,15.6875 c -0.2145341,1.245805 0.048882,2.39094 0.6386719,3.466797 l 3.4394531,-0.02734 1.484375,5.433594 4.0820315,0.0059 -1.414063,-5.439453 9.28125,-0.414062 C 20.21855,15.356069 19.152501,12.26109 16.833984,5.9257812 Z M 20.576172,7.75 19.699219,9.5351562 c 0.917304,0.4496801 1.664005,1.2500708 2.023437,2.3007818 0.359434,1.05071 0.260258,2.141303 -0.189453,3.058593 l 1.785156,0.875 c 0.676826,-1.38065 0.829275,-3.018018 0.294922,-4.580078 C 23.078924,9.627393 21.956828,8.42683 20.576172,7.75 Z" />
          </g>
        </svg>

    </div>

  </div>
</template>

<script setup lang="ts">


const props = withDefaults(
  defineProps<{
    name?: string
    color?: string
    size?: "3xl" | "2xl" | "xl" | "lg" | "md" | "sm"
    lifePoints?: number
    foldsMade?: number
    foldsAnnounced?: number | string
    imageUrl?: string
  }>(),
  {
    name: "??",
    size: "md"
  }
)

const sizeAdapt = {
  "3xl": ["text-3xl", "w-24 h-24"],
  "2xl": ["text-2xl", "w-20 h-20"],
  "xl": ["text-xl", "w-16 h-16"],
  "lg": ["text-lg", "w-12 h-12"],
  "md": ["text-md", "w-10 h-10"],
  "sm": ["text-sm", "w-8 h-8"]
}
</script>
