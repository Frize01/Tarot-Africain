import { apiHandler } from "@/api/utils";

export default {
  getTarotRooms(params: object) {
    return apiHandler('get', '/api/v1/tarot/rooms', params);
  },
  joinTarotRoom(id: string) {
    return apiHandler('post', `/api/v1/tarot/rooms/${id}/join`);
  }
};
