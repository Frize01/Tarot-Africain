import { defineStore } from 'pinia'
import { echo } from '@/api/echo'
import router from '@/router'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useLobbyStore = defineStore('lobby', {
  state: () => ({
    roomId: '',
    roomCode: '',
    players: [] as any[],
    myId: null as number | string | null,
    isHost: false,
    isPublic: false,
    isInLobby: false,
    status: 'waiting' as 'waiting' | 'ready' | 'starting',
  }),

  actions: {
    bindEvents(roomId: string) {
      echo.leave(`lobby.${roomId}`)

      echo.join(`lobby.${roomId}`)
        .here((users: any[]) => {
          console.log('Utilisateurs connectés au salon :', users)

          this.players = users
            .map(u => ({
              id: u.id,
              firstname: u.firstname,
              lastname: u.lastname,
              position: u.position ?? 0,
              pivot: { is_host: u.isHost }
            }))
            .sort((a, b) => a.position - b.position)

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
              position: user.position ?? this.players.length,
              pivot: { is_host: user.isHost }
            })
            this.players.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            toast.success(`${user.firstname} a rejoint le salon !`)
          }

          this.checkStatus()
        })

        .leaving((user: any) => {
          console.log(`${user.firstname} a quitté le salon.`)

          // La partie démarre : l'hôte quitte le lobby pour entrer en jeu, ce n'est
          // PAS une fermeture de salon. Tout le monde bascule via '.GameStarted'.
          if (this.status === 'starting') {
            return
          }

          if (user.isHost) {
            toast.error("L'hôte a fermé le salon. Vous avez été éjecté.")

            echo.leave(`lobby.${this.roomId}`)
            this.$reset()

            router.push('/tarot_africain/informations')
            return
          }

          this.players = this.players.filter(p => p.id !== user.id)
          toast.info(`${user.firstname} a quitté le salon.`)
          this.checkStatus()
        })

        .listen('.GameStarted', () => {
          this.status = 'starting'
          toast.warning("La partie commence, préparez-vous !")
          // tous les joueurs (host inclus) basculent vers la vue de jeu
          router.push(`/tarot_africain/game/${this.roomCode}`)
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
      this.isInLobby = true

      const me = roomData.players?.find((p: any) => p.id === currentUserId)
      this.isHost = me?.pivot?.is_host || false

      this.bindEvents(roomData.id)
    }
  }
})
