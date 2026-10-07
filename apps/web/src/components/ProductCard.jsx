import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMarketStore } from '../store/useMarketStore';
import { formatBRL } from '../utils/masks';
import { ShoppingCart, User, Phone, MapPin, CheckCircle, ShieldAlert, Edit, Trash } from 'lucide-react';

const categoryColors = {
  Eletrônicos: { bg: 'var(--pastel-blue-bg)', text: 'var(--pastel-blue-text)', border: 'var(--pastel-blue-border)' },
  Periféricos: { bg: 'var(--pastel-lavender-bg)', text: 'var(--pastel-lavender-text)', border: 'var(--pastel-lavender-border)' },
  Móveis: { bg: 'var(--pastel-peach-bg)', text: 'var(--pastel-peach-text)', border: 'var(--pastel-peach-border)' },
  Outros: { bg: 'var(--pastel-mint-bg)', text: 'var(--pastel-mint-text)', border: 'var(--pastel-mint-border)' }
};

const categoryFallbacks = {
  Eletrônicos: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80',
  Periféricos: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
  Móveis: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  Outros: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
};

const getProductImage = (product) => {
  if (product.imageUrl && product.imageUrl.trim() !== '') {
    return product.imageUrl;
  }

  const titleLower = (product.title || '').toLowerCase();

  if (titleLower.includes('macbook') || titleLower.includes('notebook') || titleLower.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';
  }
  if (titleLower.includes('display') || titleLower.includes('monitor') || titleLower.includes('tela')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80';
  }
  if (titleLower.includes('keyboard') || titleLower.includes('teclado') || titleLower.includes('trackpad')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80';
  }
  if (titleLower.includes('herman') || titleLower.includes('aeron') || titleLower.includes('cadeira') || titleLower.includes('chair')) {
    return 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80';
  }
  if (titleLower.includes('iphone') || titleLower.includes('celular') || titleLower.includes('smartphone')) {
    return 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80';
  }
  if (titleLower.includes('airpods') || titleLower.includes('fone') || titleLower.includes('headphone')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  }

  return categoryFallbacks[product.category] || categoryFallbacks.Outros;
};

export const ProductCard = ({ product }) => {
  const { user, setAuthModal } = useAuthStore();
  const { buyProduct, setEditProductModalOpen, setSelectedProduct, deleteProduct } = useMarketStore();
  const [buying, setBuying] = useState(false);

  const isOwnProduct = user && user.id === product.sellerId;
  const colors = categoryColors[product.category] || categoryColors.Outros;

  const handleBuy = async () => {
    if (!user) {
      setAuthModal(true, 'login');
      return;
    }

    if (isOwnProduct) return;

    setBuying(true);
    await buyProduct(product.id);
    setBuying(false);
  };

  return (
    <div
      className="apple-card"
      style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        height: '100%'
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            {product.category}
          </span>

          {isOwnProduct ? (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--pastel-peach-bg)',
                color: 'var(--pastel-peach-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <ShieldAlert size={12} />
              Seu Anúncio
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}
            >
              Disponível
            </span>
          )}
        </div>

        {/* Product Image above Title */}
        <div
          style={{
            width: '100%',
            height: '185px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '1rem',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border-subtle)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={getProductImage(product)}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = categoryFallbacks[product.category] || categoryFallbacks.Outros;
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
        </div>

        {/* Product Details */}
        <h4
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.45rem',
            lineHeight: 1.35
          }}
        >
          {product.title}
        </h4>

        <p
          style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '1.25rem'
          }}
        >
          {product.description}
        </p>

        {/* Seller Info Container */}
        <div
          style={{
            backgroundColor: 'var(--surface-subtle)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            <User size={14} color="var(--apple-blue)" />
            <span>Vendedor: {product.seller?.name || 'Vendedor Verificado'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={12} />
              <span>{product.seller?.phone || '(00) 00000-0000'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={12} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.seller?.address || 'São Paulo - SP'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 'auto'
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Preço
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatBRL(product.price)}
          </div>
        </div>

        {isOwnProduct ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--surface-subtle)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}
            >
              Auto-compra bloqueada
            </span>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setSelectedProduct(product);
                setEditProductModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Edit size={14} />
              Editar
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteProduct(product.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Trash size={14} />
              Remover
            </button>
          </div>
        ) : (
          <button
            className="btn btn-sm btn-primary"
            onClick={handleBuy}
            disabled={buying}
          >
            <ShoppingCart size={15} />
            {buying ? 'Processando ACID...' : 'Comprar Agora'}
          </button>
        )}
      </div>
    </div>
  );
};
