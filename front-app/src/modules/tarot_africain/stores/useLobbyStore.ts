import { defineStore } from 'pinia'
import { echo } from '@/api/echo'

export const useLobbyStore = defineStore('lobby', {
  state: () => ({
    roomId: '',
    roomCode: '',
    players: [] as any[],
    myId: null as number | string | null,
    isHost: false,
    isPublic: false,
    status: 'waiting' as 'waiting' | 'ready' | 'starting',
  }),

  actions: {
    bindEvents(roomId: string) {
      echo.leave(`lobby.${roomId}`)

      echo.join(`lobby.${roomId}`)

        .here((users: any[]) => {
          console.log('Utilisateurs connectés au salon :', users)

          this.players = users.map(u => ({
            id: u.id,
            firstname: u.firstname,
            lastname: u.lastname,
            pivot: { is_host: u.isHost }
          }))

          this.checkStatus()
        })

        .joining((user: any) => {
          console.log(`${user.firstname} vient d'entrer dans le salon.`)

          const alreadyExists = this.players.some(p => p.id === user.id)
          if (!alreadyExists) {
            this.players.push({
              id: user.id,
              firstname: user.firstname,
              lastname: user.lastname,
              pivot: { is_host: user.isHost }
            })
          }

          this.checkStatus()
        })

        .leaving((user: any) => {
          console.log(`${user.firstname} a quitté le salon.`)

          this.players = this.players.filter(p => p.id !== user.id)

          this.checkStatus()
        })

        .listen('.GameStarted', () => {
          this.status = 'starting'
        })
    },

    checkStatus() {
      if (this.players.length >= 3) {
        this.status = 'ready'
      } else {
        this.status = 'waiting'
      }
    },

    initRoomData(roomData: any, currentUserId: number | string) {
      this.roomId = roomData.id
      this.roomCode = roomData.code
      this.myId = currentUserId
      this.isPublic = roomData.is_public || false

      const me = roomData.players?.find((p: any) => p.id === currentUserId)
      this.isHost = me?.pivot?.is_host || false

      this.bindEvents(roomData.id)
    }
  }
})
