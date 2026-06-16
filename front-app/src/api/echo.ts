//import Echo from 'laravel-echo'
//import Pusher from 'pusher-js'
//import axios from 'axios'
//
//window.Pusher = Pusher
//
//axios.defaults.withCredentials = true
//axios.defaults.baseURL = 'http://localhost:9999'
//
//export const echo = new Echo({
//  broadcaster: 'reverb',
//  key: import.meta.env.VITE_REVERB_APP_KEY,
//  wsHost: import.meta.env.VITE_REVERB_HOST,
//  wsPort: import.meta.env.VITE_REVERB_PORT,
//  wssPort: import.meta.env.VITE_REVERB_PORT,
//  forceTLS: false,
//  enabledTransports: ['ws', 'wss'],
//  authorizer: (channel: any) => {
//    return {
//      authorize: (socketId: string, callback: Function) => {
//        axios.post('/broadcasting/auth', {
//          socket_id: socketId,
//          channel_name: channel.name,
//        })
//          .then((response) => callback(null, response.data))
//          .catch((error) => callback(error))
//      },
//    }
//  },
//})


import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import authApi from './authApi'

window.Pusher = Pusher

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: parseInt(import.meta.env.VITE_REVERB_PORT as string),
  wssPort: parseInt(import.meta.env.VITE_REVERB_PORT as string),
  forceTLS: false,
  enabledTransports: ['ws'], // On force uniquement 'ws', pas de 'wss' en local sans certificat SSL
  authorizer: (channel: any) => {
    return {
      authorize: (socketId: string, callback: Function) => {
        authApi.post('/broadcasting/auth', {
          socket_id: socketId,
          channel_name: channel.name,
        })
          .then((response) => callback(null, response.data))
          .catch((error) => callback(error))
      },
    }
  },
})
