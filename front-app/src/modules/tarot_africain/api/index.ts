import { apiHandler } from "@/api/utils";

export default {
  // créer salle
  createTarotRoom() {
    return apiHandler('post', '/api/rooms');
  },

  // join room avec uuid
  joinTarotRoom(roomId: string) {
    return apiHandler('post', `/api/rooms/${roomId}/join`);
  },

  // start
  startTarotGame(roomId: string) {
    return apiHandler('post', `/api/rooms/${roomId}/start`);
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
