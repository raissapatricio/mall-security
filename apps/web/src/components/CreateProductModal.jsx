import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMarketStore } from '../store/useMarketStore';
import { X, PackagePlus, ShieldCheck } from 'lucide-react';

export const CreateProductModal = () => {
  const { user } = useAuthStore();
  const { createProductModalOpen, setCreateProductModalOpen, createProduct } = useMarketStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Eletrônicos');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!createProductModalOpen) return null;

  const handleClose = () => {
    setCreateProductModalOpen(false);
    setTitle('');
    setPrice('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) return;

    setLoading(true);
    const res = await createProduct({
      title,
      category,
      price: numPrice,
      description
    });
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
                backgroundColor: 'var(--pastel-lavender-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--pastel-lavender-text)'
              }}
            >
              <PackagePlus size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Anunciar no NexusMall
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
          <div className="form-group">
            <label className="form-label">Título do Produto</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: iPad Air M2 128GB Wi-Fi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Periféricos">Periféricos</option>
                <option value="Móveis">Móveis</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="100000"
                className="form-input"
                placeholder="Ex: 4890.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição do Produto</label>
            <textarea
              className="form-input"
              placeholder="Descreva as condições, tempo de uso e acessórios inclusos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              backgroundColor: 'var(--pastel-blue-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.78rem',
              color: 'var(--pastel-blue-text)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ShieldCheck size={16} />
            <span>
              Prevenção IDOR: Este anúncio será vinculado automaticamente ao seu usuário ({user?.name}) através da assinatura digital do JWT.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }} disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar Anúncio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
