import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldCheck, AlertCircle, Info, MessageSquare, Check } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast, simulatedSms, setSimulatedSms, setAuthModal } = useAuthStore();

  return (
    <>
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`apple-toast ${toast.type}`}>
            {toast.type === 'success' && <ShieldCheck size={18} color="var(--pastel-mint-text)" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--pastel-rose-text)" />}
            {toast.type === 'info' && <Info size={18} color="var(--apple-blue)" />}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                fontSize: '1.1rem',
                padding: '0 4px'
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* SMS Simulado Apple Card Notification */}
      {simulatedSms && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            maxWidth: '400px',
            width: 'calc(100% - 4rem)',
            zIndex: 2500
          }}
        >
          <div
            className="apple-card"
            style={{
              padding: '1.25rem 1.4rem',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-floating)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--apple-blue)' }}>
                <MessageSquare size={16} />
                <span>MENSAGEM SMS SIMULADA</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Agora mesmo</span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
              {simulatedSms.text}
            </p>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                className="btn btn-sm btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setSimulatedSms(null)}
              >
                Dispensar
              </button>
              <button
                className="btn btn-sm btn-primary"
                style={{ flex: 1.4 }}
                onClick={() => {
                  setAuthModal(true, 'reset');
                }}
              >
                <Check size={14} />
                Redefinir Senha
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
