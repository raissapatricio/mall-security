import { create } from 'zustand';
import { api } from '../api/client';
import { useAuthStore } from './useAuthStore';

export const useMarketStore = create((set, get) => ({
  products: [],
  isLoading: false,
  filterCategory: '',
  searchQuery: '',
  depositModalOpen: false,
  createProductModalOpen: false,

  setDepositModalOpen: (open) => set({ depositModalOpen: open }),
  setCreateProductModalOpen: (open) => set({ createProductModalOpen: open }),
  setFilterCategory: (cat) => set({ filterCategory: cat }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchProducts: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/market/products');
      set({ products: res.data.products, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      useAuthStore.getState().addToast('Não foi possível carregar a vitrine de produtos.', 'error');
    }
  },

  buyProduct: async (productId) => {
    try {
      const res = await api.post(`/market/buy/${productId}`);
      // Atualiza saldo do comprador no store de auth
      useAuthStore.getState().updateUserBalance(res.data.newBalance);
      // Remove produto da vitrine local (já que agora está vendido)
      set((state) => ({
        products: state.products.filter((p) => p.id !== productId)
      }));
      useAuthStore.getState().addToast(res.data.message, 'success');
      return { success: true };
    } catch (err) {
      useAuthStore.getState().addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  },

  createProduct: async (productData) => {
    try {
      const res = await api.post('/market/products', productData);
      set((state) => ({
        products: [res.data.product, ...state.products],
        createProductModalOpen: false
      }));
      useAuthStore.getState().addToast('Produto anunciado com sucesso!', 'success');
      return { success: true };
    } catch (err) {
      const detailMsg = err.details?.length ? err.details.map((d) => d.message).join(' ') : err.message;
      useAuthStore.getState().addToast(detailMsg, 'error');
      return { success: false, error: detailMsg };
    }
  }
}));
