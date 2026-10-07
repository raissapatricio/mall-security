import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useMarketStore } from './store/useMarketStore';
import { Header } from './components/Header';
import { SecurityBadge } from './components/SecurityBadge';
import { WalletCard } from './components/WalletCard';
import { ProductCard } from './components/ProductCard';
import { AuthModal } from './components/AuthModal';
import { DepositModal } from './components/DepositModal';
import { EditProductModal } from './components/EditProductModal';
import { ToastContainer } from './components/ToastContainer';
import { Search, ShoppingBag, PlusCircle, Sparkles, Shield } from 'lucide-react';

export function App() {
  const { user, fetchMe, setAuthModal } = useAuthStore();
  const {
    products,
    isLoading,
    fetchProducts,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    setCreateProductModalOpen
  } = useMarketStore();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'announce'

  useEffect(() => {
    fetchMe();
    fetchProducts();
  }, [fetchMe, fetchProducts]);

  // Filter products by search query and category
  const filteredProducts = products.filter((prod) => {
    const matchQuery =
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory ? prod.category === filterCategory : true;
    return matchQuery && matchCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Toast & SMS Simulator */}
      <ToastContainer />

      {/* Navigation Header */}
      <Header />

      <main className="container" style={{ flex: 1, paddingBottom: '3rem' }}>
        {/* Security Defenses Overview Banner */}
        <SecurityBadge />

        {/* User Profile & Wallet if authenticated */}
        {user ? (
          <WalletCard />
        ) : (
          <div
            className="apple-card"
            style={{
              padding: '2.5rem 2rem',
              textAlign: 'center',
              marginBottom: '2.5rem',
              background: 'linear-gradient(180deg, #ffffff 0%, var(--surface-subtle) 100%)'
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: 'var(--pastel-blue-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--apple-blue)',
                margin: '0 auto 1.25rem'
              }}
            >
              <Sparkles size={28} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Mercado Seguro com Arquitetura Defensiva
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              Crie uma conta para receber <strong style={{ color: 'var(--pastel-mint-text)' }}>R$ 1.000,00</strong> em saldo fictício inicial, comprar produtos com transações atômicas ACID e anunciar itens com total proteção contra Race Conditions e IDOR.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => setAuthModal(true, 'register')}
              >
                Cadastrar e Ganhar R$ 1.000
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setAuthModal(true, 'login')}
              >
                Já tenho conta
              </button>
            </div>
          </div>
        )}

        {/* Tab Controls (Segmented Control Apple Style) */}
        <div className="segmented-control">
          <button
            className={`segment-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <ShoppingBag size={16} />
            Vitrine de Produtos ({filteredProducts.length})
          </button>
          <button
            className={`segment-btn ${activeTab === 'announce' ? 'active' : ''}`}
            onClick={() => {
              if (!user) {
                setAuthModal(true, 'login');
              } else {
                setCreateProductModalOpen(true);
              }
            }}
          >
            <PlusCircle size={16} />
            Anunciar Novo Produto
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search
              size={18}
              color="var(--text-tertiary)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Buscar produtos por nome ou detalhes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.6rem' }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Todas Categorias</option>
              <option value="Eletrônicos">Eletrônicos</option>
              <option value="Periféricos">Periféricos</option>
              <option value="Móveis">Móveis</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
            Carregando vitrine segura do banco de dados...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className="apple-card"
            style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}
          >
            <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Nenhum anúncio encontrado
            </h3>
            <p style={{ fontSize: '0.9rem' }}>Experimente mudar os filtros ou seja o primeiro a publicar um novo item.</p>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: '1.25rem' }}
              onClick={() => {
                if (!user) setAuthModal(true, 'login');
                else setCreateProductModalOpen(true);
              }}
            >
              Criar Primeiro Anúncio
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.6rem'
            }}
          >
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.8rem 0',
          backgroundColor: '#ffffff',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div className="container">
          <p>
            NexusPay Monorepo Defensivo &bull; Arquitetura Blindada contra Race Conditions, IDOR, SQL Injection e XSS.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal />
      <DepositModal />
      <CreateProductModal />
    </div>
  );
}

export default App;
