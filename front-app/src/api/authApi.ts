import axios, { type AxiosError, type AxiosResponse } from 'axios'
import router from '@/router';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_ROOT,
  headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
  },
  withCredentials: true,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

authApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('user');
      router.push('/auth')
    }
    return Promise.reject(error)
  }
)

export default authApi;
