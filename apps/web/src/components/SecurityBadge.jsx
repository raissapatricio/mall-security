import React from 'react';
import { Shield, Lock, Cpu, Database, CheckCircle2 } from 'lucide-react';

export const SecurityBadge = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--pastel-blue-bg)',
        border: '1px solid var(--pastel-blue-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.9rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--pastel-blue-text)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Shield size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--pastel-blue-text)' }}>
            Ambiente Blindado de Defesa Ativa (AppSec)
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Monorepo Express & React protegido com defesas coordenadas
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#ffffff',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Lock size={12} color="var(--pastel-mint-text)" />
          JWT HttpOnly + Bcrypt 12
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#ffffff',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Cpu size={12} color="var(--apple-blue)" />
          Helmet + Strict CORS + Rate Limit
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#ffffff',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Database size={12} color="var(--pastel-lavender-text)" />
          ACID SQLite + Zod Zero-Trust
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#ffffff',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <CheckCircle2 size={12} color="var(--pastel-peach-text)" />
          PCI-DSS Mascarado
        </span>
      </div>
    </div>
  );
};
