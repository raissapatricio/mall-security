import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMarketStore } from '../store/useMarketStore';
import { formatBRL } from '../utils/masks';
import { ShoppingCart, User, Phone, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';

const categoryColors = {
  Eletrônicos: { bg: 'var(--pastel-blue-bg)', text: 'var(--pastel-blue-text)', border: 'var(--pastel-blue-border)' },
  Periféricos: { bg: 'var(--pastel-lavender-bg)', text: 'var(--pastel-lavender-text)', border: 'var(--pastel-lavender-border)' },
  Móveis: { bg: 'var(--pastel-peach-bg)', text: 'var(--pastel-peach-text)', border: 'var(--pastel-peach-border)' },
  Outros: { bg: 'var(--pastel-mint-bg)', text: 'var(--pastel-mint-text)', border: 'var(--pastel-mint-border)' }
};

export const ProductCard = ({ product }) => {
  const { user, setAuthModal } = useAuthStore();
  const { buyProduct } = useMarketStore();
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
        padding: '1.6rem',
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
