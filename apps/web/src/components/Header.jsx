import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMarketStore } from '../store/useMarketStore';
import { formatBRL } from '../utils/masks';
import { Shield, Wallet, Plus, LogOut, User } from 'lucide-react';

export const Header = () => {
  const { user, logout, setAuthModal } = useAuthStore();
  const { setDepositModalOpen } = useMarketStore();

  return (
    <header
      className="apple-glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0.85rem 0',
        marginBottom: '1.75rem'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Nexus<span style={{ color: 'var(--apple-blue)' }}>Pay</span>
            </span>
            <span
              style={{
                marginLeft: '0.5rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--pastel-mint-bg)',
                color: 'var(--pastel-mint-text)'
              }}
            >
              AppSec Shield
            </span>
          </div>
        </div>

        {/* User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {user ? (
            <>
              {/* Balance Chip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--pastel-mint-bg)',
                  border: '1px solid var(--pastel-mint-border)',
                  padding: '0.4rem 0.95rem',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <Wallet size={16} color="var(--pastel-mint-text)" />
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Saldo:</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--pastel-mint-text)' }}>
                  {formatBRL(user.balance)}
                </span>
              </div>

              {/* Deposit Quick Action */}
              <button
                className="btn btn-sm btn-pastel-mint"
                onClick={() => setDepositModalOpen(true)}
              >
                <Plus size={15} />
                Depositar
              </button>

              {/* User Name & Logout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  paddingLeft: '0.5rem',
                  borderLeft: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                  title={user.name}
                >
                  <User size={16} />
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={logout}
                  title="Sair com segurança"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setAuthModal(true, 'login')}
              >
                Entrar
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setAuthModal(true, 'register')}
              >
                Criar Conta Grátis
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
