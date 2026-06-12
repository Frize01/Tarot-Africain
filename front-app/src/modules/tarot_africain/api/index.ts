import { apiHandler } from "@/api/utils";

export default {
  // créer salle
  createTarotRoom(gameId: number = 1) {
    return apiHandler('post', '/api/rooms', { game_id: gameId });
  },

  makeRoomPublic(roomId: string) {
    return apiHandler('post', `/api/rooms/${roomId}/open-room`);
  },

  destroyTarotRoom(roomId: string | number) {
    return apiHandler('delete', `/api/rooms/${roomId}`);
  },

  // join room avec uuid
  joinTarotRoom(roomCode: string) {
    return apiHandler('post', `/api/rooms/${roomCode}/join`);
  },

  // start
  startTarotGame(roomId: string) {
    return apiHandler('post', `/api/rooms/${roomId}/start`);
  },

  // get all tarot room available
  getAvailableRooms(gameId: number) {
    return apiHandler('get', `/api/rooms/${gameId}/available-rooms`);
  },

  // ask main
  getTarotHand(roomId: string) {
    return apiHandler('post', `/api/rooms/${roomId}/deal`);
  },

  // deal
  announceTricks(roomId: string, count: number) {
    return apiHandler('post', `/api/rooms/${roomId}/announce`, { count });
  },

  // joue une carte
  playTarotCard(roomId: string, cardId: number, excuseValue: number | null = null) {
    return apiHandler('post', `/api/rooms/${roomId}/play`, {
      card_id: cardId,
      excuse_value: excuseValue
    });
  }
};
