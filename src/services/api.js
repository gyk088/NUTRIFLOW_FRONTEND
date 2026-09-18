import axios from 'axios'
import { getToken, getSession, logout } from '@/services/auth.js'

const apiClient = axios.create({
  timeout: 30000,
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// A 401 on an already-authenticated request means the session was revoked or
// expired server-side — bounce back to /auth instead of leaving the UI stuck
// showing stale data behind failed requests.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getSession()) {
      logout()
    }
    return Promise.reject(error)
  }
)

export default apiClient
