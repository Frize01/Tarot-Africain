// import { defineStore } from 'pinia'
// import { api, echo } from '@/api/mockApi'

// export const useLobbyStore = defineStore('lobby', {
//   state: () => ({
//     roomId: '',
//     roomCode:'',
//     players: [] as { id: string; name: string; color: string; isHost: boolean, imageUrl: string }[],
//     myId: 'player_' + Math.random().toString(36).substring(2, 7),
//     isHost: false,
//     status: 'waiting' as 'waiting' | 'ready' | 'starting',
//   }),

//   actions: {

//     bindEvents(roomId: string) {
//       echo.channel(`lobby.${roomId}`)
//         .listen('PlayerJoined', (data: any) => {
//           this.players.push(data.player)
//           if (this.players.length >= 3) this.status = 'ready'
//         })
//         .listen('PlayerLeft', (data: any) => {
//           this.players = this.players.filter(p => p.id !== data.playerId)
//           if (this.players.length < 3) this.status = 'waiting'
//         })
//         .listen('GameStarted', () => {
//           this.status = 'starting'
//         })
//     },

//     async createRoom(name: string, color: string) {
//       const { roomId } = await api.createRoom()
//       this.roomId = roomId
//       this.isHost = true
//       this.bindEvents(roomId)
//       await api.joinRoom(roomId, { playerId: this.myId, name, color })
//     },

//     async joinRoom(roomId: string, name: string, color: string) {
//       this.roomId = roomId
//       this.isHost = false
//       this.bindEvents(roomId)
//       const { players } = await api.joinRoom(roomId, { playerId: this.myId, name, color })
//       this.players = players
//     },

//     async startGame() {
//       await api.startGame(this.roomId)
//     }
//   }
// })


import { defineStore } from 'pinia'
import apiMethods from '@/api'
// import { Echo } from '@/api/echo'

export const useLobbyStore = defineStore('lobby', {
  state: () => ({
    roomId: '',
    roomCode: '',
    players: [] as any[],
    myId: null as number | string | null,
    isHost: false,
    status: 'waiting' as 'waiting' | 'ready' | 'starting',
  }),

  // actions: {
  //   bindEvents(roomCode: string) {
  //     window.Echo.channel(`lobby.${roomCode}`)
  //       .listen('PlayerJoined', (data: any) => {
  //         this.players = data.room.players
  //         this.checkStatus()
  //       })
  //       .listen('PlayerLeft', (data: any) => {
  //         this.players = data.room.players
  //         this.checkStatus()
  //       })
  //       .listen('GameStarted', () => {
  //         this.status = 'starting'
  //       })
  //   },

  //   checkStatus() {
  //     if (this.players.length >= 3) {
  //       this.status = 'ready'
  //     } else {
  //       this.status = 'waiting'
  //     }
  //   },

  //   initRoomData(roomData: any, currentUserId: number | string) {
  //     this.roomId = roomData.id
  //     this.roomCode = roomData.code
  //     this.players = roomData.players || []
  //     this.myId = currentUserId

  //     const me = this.players.find(p => p.id === currentUserId)
  //     this.isHost = me?.pivot?.is_host || false

  //     this.bindEvents(roomData.code)
  //     this.checkStatus()
  //   },

  //   async startGame() {
  //     await apiMethods.startTarotGame(this.roomId)
  //   }
  // }
})
