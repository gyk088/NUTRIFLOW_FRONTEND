import { defineStore } from 'pinia'
import apiClient from '@/services/api.js'
import { notifyServerError } from '@/services/notify.js'
import { setUser, setSession, getUser, getSession, logout as clearAuthStorage } from '@/services/auth.js'

export const useAuth = defineStore('auth', {
  state: () => ({
    // Гидратируется из localStorage сразу при создании стора, чтобы
    // isAuthenticated был верным сразу после перезагрузки страницы —
    // interceptor в services/api.js всё равно читает токен напрямую из
    // localStorage, но роут-гарду и UI нужен этот же ответ синхронно из стора.
    user: getUser() || null,
    session: getSession() || null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.session?.token),
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'super_admin',
    isSuperAdmin: (state) => state.user?.role === 'super_admin'
  },

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const resp = await apiClient.post('/api/v1/auth/login', { email, password })
        this.user = resp.data.user
        this.session = resp.data.session
        setUser(this.user)
        setSession(this.session)
        return true
      } catch (e) {
        notifyServerError(e?.response?.data?.message || 'Не удалось войти')
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const token = this.session?.token
      if (token) {
        try {
          await apiClient.post('/api/v1/auth/sessions/revoke', { token })
        } catch {
          // best-effort — выходим локально в любом случае
        }
      }
      // Внутри вызывает window.location.reload() — должно быть последним
      // действием, иначе запрос выше не успеет уйти.
      clearAuthStorage()
    }
  }
})
