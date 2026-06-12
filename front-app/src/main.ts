import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './asset/main.css'

import App from './App.vue'
import router from './router'

import Toast, { POSITION, type PluginOptions } from "vue-toastification"
import "vue-toastification/dist/index.css"

const options: PluginOptions = {
    position: POSITION.BOTTOM_RIGHT,
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Toast, options)

app.mount('#app')
