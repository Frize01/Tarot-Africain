import { apiHandler } from "@/api/utils";

export default {
  getGames() {
    return apiHandler('get', '/api/games');
  },
  getGameDetails(id: number) {
    return apiHandler('get', `/api/games/${id}`);
  }
};
