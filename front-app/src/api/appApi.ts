import { apiHandler } from "@/api/utils";

function readCookie(name: string): string {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m && m[1] ? decodeURIComponent(m[1]) : ''
}

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

  // --- Profil / sécurité ---
  updateProfile(data: { firstname: string; lastname: string; email: string }) {
    return apiHandler('put', '/api/profile', data);
  },
  updatePassword(data: { current_password: string; password: string; password_confirmation: string }) {
    return apiHandler('put', '/api/password', data);
  },

  // --- Présence générique (réutilisable par tous les jeux) ---
  getRoomPresence(roomId: string | number) {
    return apiHandler('get', `/api/rooms/${roomId}/presence`);
  },
  setRoomPresence(roomId: string | number, away: boolean) {
    return apiHandler('post', `/api/rooms/${roomId}/presence`, { away });
  },
  /**
   * Signale la présence à la FERMETURE de l'onglet/fenêtre (ou reload).
   * fetch keepalive = survit au unload et porte le header CSRF (sendBeacon ne peut pas).
   */
  presenceBeacon(roomId: string | number, away: boolean) {
    const root = (import.meta.env.VITE_API_ROOT as string) ?? '';
    try {
      fetch(`${root}/api/rooms/${roomId}/presence`, {
        method: 'POST',
        keepalive: true,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': readCookie('XSRF-TOKEN'),
        },
        body: JSON.stringify({ away }),
      });
    } catch { /* unload : best effort */ }
  },
};
