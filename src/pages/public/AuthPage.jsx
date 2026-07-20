import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useUI();

  const [formData, setFormData] = useState({ email: '', kataSandi: '' });
  const [selectedRole, setSelectedRole] = useState('tenant');
  const [rememberMe, setRememberMe] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = {
      name: selectedRole === 'admin' ? 'Administrator' : 'Hj. Yuliana',
      kios: selectedRole === 'admin' ? null : 'B-1001',
      email: formData.email,
    };

    login(selectedRole, userData, rememberMe);
    addToast(`Selamat datang, ${userData.name}!`, 'success');
    navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/tenant/dashboard');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--cream)',
      padding: '20px',
    }} className="page-fade-in">
      <div 
        className="px-5 py-8 sm:p-10"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 12px rgba(139,26,26,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <img
              src="/assets/main_logo_transparent_for_light_bg.png"
              alt="Logo Resmi Plaza Kebun Sayur"
              style={{ height: '128px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <h1 style={{ color: 'var(--red)', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
            Login
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '6px', marginBottom: 0 }}>
            Sistem Pembayaran Sewa Kios Plaza Kebun Sayur
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Alamat Email</label>
            <input
              type="email"
              name="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="username"
              style={{ height: '44px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '0 14px', fontSize: '16px', backgroundColor: 'var(--warm-gray)' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Kata Sandi</label>
            <input
              type="password"
              name="kataSandi"
              placeholder="Masukkan kata sandi Anda"
              value={formData.kataSandi}
              onChange={handleInputChange}
              autoComplete="current-password"
              style={{ height: '44px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '0 14px', fontSize: '16px', backgroundColor: 'var(--warm-gray)' }}
              required
            />
          </div>

          {/* Role selector untuk simulasi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Login Sebagai (Simulasi)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedRole('tenant')}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: selectedRole === 'tenant' ? 'var(--red)' : 'var(--warm-gray)',
                  color: selectedRole === 'tenant' ? '#ffffff' : 'var(--text)',
                  border: selectedRole === 'tenant' ? '2px solid var(--red-dark)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  height: '44px',
                }}
              >
                Tenant
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: selectedRole === 'admin' ? 'var(--red)' : 'var(--warm-gray)',
                  color: selectedRole === 'admin' ? '#ffffff' : 'var(--text)',
                  border: selectedRole === 'admin' ? '2px solid var(--red-dark)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  height: '44px',
                }}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--red)', cursor: 'pointer', transform: 'scale(1.15)', marginRight: '2px' }}
              />
              Ingat Saya
            </label>
            <Link
              to="/auth/lupa-sandi"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--red)',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 6px',
                display: 'inline-block',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Lupa Kata Sandi?
            </Link>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: 'var(--red)',
              color: '#ffffff',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '700',
              marginTop: '8px',
              height: '48px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            Masuk ke Aplikasi
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
