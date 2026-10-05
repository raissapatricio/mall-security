import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMarketStore } from '../store/useMarketStore';
import { formatBRL } from '../utils/masks';
import { CreditCard, MapPin, Phone, UserCheck, Plus, PackagePlus } from 'lucide-react';

export const WalletCard = () => {
  const { user } = useAuthStore();
  const { setDepositModalOpen, setCreateProductModalOpen } = useMarketStore();

  if (!user) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}
    >
      {/* Wallet Balance Card */}
      <div
        className="apple-card"
        style={{
          padding: '2rem',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-mint-bg)',
            opacity: 0.7,
            pointerEvents: 'none'
          }}
        />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
              Carteira Digital NexusPay
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--pastel-lavender-bg)',
                color: 'var(--pastel-lavender-text)'
              }}
            >
              Liquidação ACID
            </span>
          </div>

          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 1rem', letterSpacing: '-0.03em' }}>
            {formatBRL(user.balance)}
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1.5rem' }}>
            Saldo persistido com garantia transacional SQLite e disponível imediatamente para compras na vitrine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setDepositModalOpen(true)}
          >
            <Plus size={16} />
            Depositar Fundos
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setCreateProductModalOpen(true)}
          >
            <PackagePlus size={16} />
            Anunciar Produto
          </button>
        </div>
      </div>

      {/* User Security & Profile Card */}
      <div
        className="apple-card"
        style={{
          padding: '1.75rem 2rem',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {user.name}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CPF: {user.cpf}</span>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--pastel-mint-bg)',
              color: 'var(--pastel-mint-text)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <UserCheck size={14} />
            Conta Verificada
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CreditCard size={16} color="var(--apple-blue)" />
              Cartão PCI-DSS:
            </span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              •••• •••• •••• {user.cardLast4}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Phone size={16} color="var(--pastel-mint-text)" />
              Telefone:
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.phone}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}>
              <MapPin size={16} color="var(--pastel-peach-text)" />
              Endereço:
            </span>
            <span
              style={{
                fontWeight: 600,
                color: 'var(--text-primary)',
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={user.address}
            >
              {user.address}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>Sessão Protegida: JWT HttpOnly</span>
          <span style={{ color: 'var(--pastel-mint-text)', fontWeight: 600 }}>Ativo &bull; Seguro</span>
        </div>
      </div>
    </div>
  );
};
