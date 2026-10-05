import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMarketStore } from '../store/useMarketStore';
import { X, DollarSign, ShieldCheck } from 'lucide-react';

export const DepositModal = () => {
  const { deposit } = useAuthStore();
  const { depositModalOpen, setDepositModalOpen } = useMarketStore();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!depositModalOpen) return null;

  const handleClose = () => {
    setDepositModalOpen(false);
    setAmount('');
  };

  const handleQuickAdd = (val) => {
    setAmount(val.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setLoading(true);
    const res = await deposit(num);
    setLoading(false);
    if (res.success) {
      handleClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--pastel-mint-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--pastel-mint-text)'
              }}
            >
              <DollarSign size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Depósito em Carteira
            </h3>
          </div>

          <button
            onClick={handleClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-subtle)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Valores Rápidos</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: 'var(--pastel-blue-bg)', color: 'var(--pastel-blue-text)', border: '1px solid var(--pastel-blue-border)' }}
                onClick={() => handleQuickAdd(100)}
              >
                + R$ 100
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: 'var(--pastel-mint-bg)', color: 'var(--pastel-mint-text)', border: '1px solid var(--pastel-mint-border)' }}
                onClick={() => handleQuickAdd(500)}
              >
                + R$ 500
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: 'var(--pastel-lavender-bg)', color: 'var(--pastel-lavender-text)', border: '1px solid var(--pastel-lavender-border)' }}
                onClick={() => handleQuickAdd(1000)}
              >
                + R$ 1.000
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Valor do Depósito (R$)</label>
            <input
              type="number"
              step="0.01"
              min="10"
              max="50000"
              className="form-input"
              placeholder="Ex: 250,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              backgroundColor: 'var(--pastel-mint-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.78rem',
              color: 'var(--pastel-mint-text)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ShieldCheck size={16} />
            <span>Transação atômica ACID processada diretamente no banco de dados SQLite.</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }} disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar Depósito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
