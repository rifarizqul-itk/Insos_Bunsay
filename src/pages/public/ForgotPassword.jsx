import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { Icon } from '@iconify/react';

function ForgotPassword() {
  const navigate = useNavigate();
  const { addToast } = useUI();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Masukkan alamat email Anda.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulasi pengiriman link reset
    setTimeout(() => {
      addToast(`Link reset kata sandi telah dikirim ke ${email}.`, 'success');
      setIsSubmitting(false);
      navigate('/auth');
    }, 1200);
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
              loading="lazy"
              decoding="async"
              style={{ height: '100px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <h1 style={{ color: 'var(--red)', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
            Lupa Kata Sandi
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '6px', marginBottom: 0, maxWidth: '65ch', lineHeight: '1.6' }}>
            Masukkan email Anda untuk menerima tautan reset.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="forgot-email-input" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Alamat Email</label>
            <input
              id="forgot-email-input"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={{ height: '44px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '0 14px', fontSize: '16px', backgroundColor: 'var(--warm-gray)' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? 'var(--disabled-bg)' : 'var(--red)',
              color: '#ffffff',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '700',
              height: '48px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <>
                <Icon icon="ph:spinner-gap-bold" className="animate-spin" width="20" height="20" />
                <span>Mengirim...</span>
              </>
            ) : (
              'Kirim Tautan Reset'
            )}
          </button>

          <Link
            to="/auth"
            style={{
              textAlign: 'center',
              backgroundColor: 'transparent',
              color: 'var(--text-2)',
              fontSize: '14px',
              fontWeight: '600',
              padding: '12px 0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            <Icon icon="ph:arrow-left-bold" width="16" height="16" />
            <span>Kembali ke Halaman Login</span>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
