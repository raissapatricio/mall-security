import { create } from 'zustand';
import { api } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  authModalOpen: false,
  authModalMode: 'login', // 'login' | 'register' | 'recovery' | 'reset'
  simulatedSms: null,
  toasts: [],

  addToast: (message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  setAuthModal: (open, mode = 'login') => {
    set({ authModalOpen: open, authModalMode: mode });
  },

  setSimulatedSms: (sms) => {
    set({ simulatedSms: sms });
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  login: async (cpf, password) => {
    try {
      const res = await api.post('/auth/login', { cpf, password });
      set({ user: res.data.user, authModalOpen: false });
      get().addToast(`Bem-vindo(a), ${res.data.user.name}!`, 'success');
      return { success: true };
    } catch (err) {
      get().addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  },

  register: async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      set({ user: res.data.user, authModalOpen: false });
      get().addToast('Conta criada com sucesso! Saldo inicial de R$ 1.000,00 creditado.', 'success');
      return { success: true };
    } catch (err) {
      const detailMsg = err.details?.length ? err.details.map((d) => d.message).join(' ') : err.message;
      get().addToast(detailMsg, 'error');
      return { success: false, error: detailMsg };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null });
      get().addToast('Sessão encerrada com sucesso.', 'info');
    } catch (err) {
      get().addToast(err.message, 'error');
    }
  },

  deposit: async (amount) => {
    try {
      const res = await api.post('/wallet/deposit', { amount });
      set((state) => ({
        user: state.user ? { ...state.user, balance: res.data.newBalance } : null
      }));
      get().addToast(res.data.message, 'success');
      return { success: true };
    } catch (err) {
      get().addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  },

  updateUserBalance: (newBalance) => {
    set((state) => ({
      user: state.user ? { ...state.user, balance: newBalance } : null
    }));
  },

  requestRecovery: async (cpf, phone) => {
    try {
      const res = await api.post('/auth/recovery-request', { cpf, phone });
      set({ simulatedSms: res.data.simulatedSms });
      get().addToast('SMS simulado recebido no celular!', 'info');
      return { success: true };
    } catch (err) {
      get().addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  },

  resetPassword: async (cpf, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { cpf, newPassword });
      set({ simulatedSms: null, authModalMode: 'login' });
      get().addToast(res.data.message, 'success');
      return { success: true };
    } catch (err) {
      get().addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  }
}));
