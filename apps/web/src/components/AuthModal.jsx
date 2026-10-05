import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { formatCPF, formatPhone, formatCard, cleanDigits } from '../utils/masks';
import { Shield, Lock, CreditCard, X, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const AuthModal = () => {
  const {
    authModalOpen,
    authModalMode,
    setAuthModal,
    login,
    register,
    requestRecovery,
    resetPassword
  } = useAuthStore();

  const [loading, setLoading] = useState(false);

  // Login state
  const [loginCpf, setLoginCpf] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCard, setRegCard] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Recovery & Reset state
  const [recCpf, setRecCpf] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModal(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(loginCpf, loginPassword);
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await register({
      name: regName,
      cpf: regCpf,
      phone: regPhone,
      address: regAddress,
      cardNumber: regCard,
      password: regPassword
    });
    setLoading(false);
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await requestRecovery(recCpf, recPhone);
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    await resetPassword(recCpf || loginCpf, newPassword);
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {authModalMode !== 'login' && (
              <button
                type="button"
                onClick={() => setAuthModal(true, 'login')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {authModalMode === 'login' && 'Acesso Seguro NexusPay'}
              {authModalMode === 'register' && 'Criar Nova Conta'}
              {authModalMode === 'recovery' && 'Recuperação por SMS'}
              {authModalMode === 'reset' && 'Nova Senha de Acesso'}
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

        {/* MODE: LOGIN */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">CPF Cadastrado</label>
              <input
                type="text"
                className="form-input"
                placeholder="000.000.000-00"
                value={loginCpf}
                onChange={(e) => setLoginCpf(formatCPF(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Senha</label>
                <span
                  style={{ fontSize: '0.78rem', color: 'var(--apple-blue)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setAuthModal(true, 'recovery')}
                >
                  Esqueci minha senha
                </span>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
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
              <Lock size={15} />
              <span>Autenticação validada via Bcrypt e Cookie HttpOnly seguro contra XSS.</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Validando Credenciais...' : 'Entrar no Sistema'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Não possui uma conta?{' '}
              <span
                style={{ color: 'var(--apple-blue)', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setAuthModal(true, 'register')}
              >
                Criar cadastro com R$ 1.000
              </span>
            </div>
          </form>
        )}

        {/* MODE: REGISTER */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Amanda Nogueira"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">CPF (com validação)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="000.000.000-00"
                  value={regCpf}
                  onChange={(e) => setRegCpf(formatCPF(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Celular com DDD</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="(00) 00000-0000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(formatPhone(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Endereço Residencial Completo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Rua, Número, Bairro, Cidade - UF"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Cartão de Crédito</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="0000 0000 0000 0000"
                  value={regCard}
                  onChange={(e) => setRegCard(formatCard(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Senha (mín. 6 dígitos)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
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
              <CheckCircle2 size={15} />
              <span>Conformidade PCI-DSS: Apenas os 4 últimos dígitos do cartão serão armazenados. Bônus de R$ 1.000 creditado no banco.</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>
          </form>
        )}

        {/* MODE: RECOVERY */}
        {authModalMode === 'recovery' && (
          <form onSubmit={handleRecoverySubmit}>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Validação cruzada de segurança: informe o CPF e Telefone celular cadastrados. Se corretos, um SMS simulado será disparado.
            </p>

            <div className="form-group">
              <label className="form-label">CPF Cadastrado</label>
              <input
                type="text"
                className="form-input"
                placeholder="000.000.000-00"
                value={recCpf}
                onChange={(e) => setRecCpf(formatCPF(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone Celular</label>
              <input
                type="text"
                className="form-input"
                placeholder="(00) 00000-0000"
                value={recPhone}
                onChange={(e) => setRecPhone(formatPhone(e.target.value))}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Validando dados...' : 'Validar e Disparar SMS'}
            </button>
          </form>
        )}

        {/* MODE: RESET PASSWORD */}
        {authModalMode === 'reset' && (
          <form onSubmit={handleResetSubmit}>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Identidade confirmada via SMS. Digite a sua nova senha de acesso.
            </p>

            <div className="form-group">
              <label className="form-label">Nova Senha</label>
              <input
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Nova Senha</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Salvando Senha...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
