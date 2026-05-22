import { defineStore } from 'pinia'
import { api, echo } from '@/api/mockApi'

export const useLobbyStore = defineStore('lobby', {
  state: () => ({
    roomId: '',
    players: [] as { id: string; name: string; color: string; isHost: boolean, imageUrl: string }[],
    myId: 'player_' + Math.random().toString(36).substring(2, 7),
    isHost: false,
    status: 'waiting' as 'waiting' | 'ready' | 'starting',
  }),

  actions: {

    bindEvents(roomId: string) {
      echo.channel(`lobby.${roomId}`)
        .listen('PlayerJoined', (data: any) => {
          this.players.push(data.player)
          if (this.players.length >= 3) this.status = 'ready'
        })
        .listen('PlayerLeft', (data: any) => {
          this.players = this.players.filter(p => p.id !== data.playerId)
          if (this.players.length < 3) this.status = 'waiting'
        })
        .listen('GameStarted', () => {
          this.status = 'starting'
        })
    },

    async createRoom(name: string, color: string) {
      const { roomId } = await api.createRoom()
      this.roomId = roomId
      this.isHost = true
      this.bindEvents(roomId)
      await api.joinRoom(roomId, { playerId: this.myId, name, color })
    },

    async joinRoom(roomId: string, name: string, color: string) {
      this.roomId = roomId
      this.isHost = false
      this.bindEvents(roomId)
      const { players } = await api.joinRoom(roomId, { playerId: this.myId, name, color })
      this.players = players
    },

    async startGame() {
      await api.startGame(this.roomId)
    }
  }
})
