import { defineStore } from 'pinia'

export const useLobbyStore = defineStore('lobby', {
  state: () => ({
    roomId: '' as string,
    players: [] as { id: string; name: string; color: string; isHost: boolean }[],
    isHost: false,
    status: 'waiting' as 'waiting' | 'ready' | 'starting',
  }),

  actions: {
    // TODO: appel API, générer code, créer room
    createRoom(roomId: string) {
      this.roomId = roomId
      this.isHost = true
      this.status = 'waiting'
    },
    // TODO: appel api check room existe
    joinRoom(code: string) {
      this.roomId = code
      this.isHost = false
      this.status = 'waiting'
    },

    // TODO: appele par echo qd joueur join
    addPlayer(player: { id: string; name: string; color: string; isHost: boolean }) {
      this.players.push(player)
      if (this.players.length >= 3) this.status = 'ready'
    },

    // TODO: appele par echo qd joueur quitte
    removePlayer(id: string) {
      this.players = this.players.filter(p => p.id !== id)
      if (this.players.length < 3) this.status = 'waiting'
    },

    // TODO: appel api, broadcast lancement game
    startGame() {
      if (this.players.length < 3) return
      this.status = 'starting'
    },
  }
})
