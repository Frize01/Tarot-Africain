import { apiHandler } from "@/api/utils";

export default {
  getGames() {
    return apiHandler('get', '/api/games');
  },
  getGameDetails(id: number) {
    return apiHandler('get', `/api/games/${id}`);
  },

  getCsrfCookie() {
    return apiHandler('get', '/sanctum/csrf-cookie');
  },

  login(email: string, password: string, remember: boolean) {
    return apiHandler('post', '/api/login', { email, password, remember });
  },

  register(firstname: string, lastname: string, email: string, password: string) {
    return apiHandler('post', '/api/register', {
      firstname,
      lastname,
      email,
      password
    });
  },
  logout() {
    return apiHandler('post', '/api/logout');
  },
};
