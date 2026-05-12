import axios from "axios";
import router from '@/router';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_ROOT, // Utilise les variables d'env Vite
  headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
  },
  withCredentials: true
});

authApi.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      router.push({ name: 'Login' });
    }
    return Promise.reject(error);
  }
);

export default authApi;
