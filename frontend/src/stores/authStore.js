import { defineStore } from 'pinia'
import { api } from '../services/api'
export const useAuthStore = defineStore('authStore', {
  state: () => ({ currentUser: JSON.parse(localStorage.getItem('currentUser')) || null, token: localStorage.getItem('token') || null }),
  getters: { isAuthenticated: s => !!s.currentUser && !!s.token, isAdmin: s => s.currentUser?.role === 'admin', isEmployee: s => s.currentUser?.role === 'employee' },
  actions: {
    async login(email, password) { try { const data = await api.post('/auth/login', { email, password }); this.currentUser=data.user; this.token=data.token; localStorage.setItem('currentUser',JSON.stringify(data.user)); localStorage.setItem('token',data.token); return true } catch { return false } },
    logout() { this.currentUser=null; this.token=null; localStorage.removeItem('currentUser'); localStorage.removeItem('token') }
  }
})
