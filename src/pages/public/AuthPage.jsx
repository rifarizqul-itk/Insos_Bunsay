import React, { useState } from 'react';

function AuthPage() {
  const [formData, setFormData] = useState({
    email: '',
    kataSandi: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Memproses masuk log dengan:', formData.email, formData.kataSandi);
  };

  const handleLupaPassword = () => {
    alert('Fungsi pemulihan kata sandi saat ini sedang dalam proses pengembangan pengelola.');
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: 'var(--cream)',
      padding: '20px'
    }} className="page-fade-in">
      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        backgroundColor: '#ffffff', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)', 
        padding: '40px 32px'
      }}>
        {/* Header Identitas Aplikasi dengan Penambahan Logo Baru */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img 
            src="/assets/main_logo_transparent_for_light_bg.png" 
            alt="Logo Resmi Plaza Kebun Sayur" 
            style={{ 
              height: '128px', // Ukuran proporsional di dalam kartu login
              width: 'auto', 
              objectFit: 'contain', 
            }} 
          />
          <h1 style={{ color: 'var(--red)', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
            Login
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '6px', marginBottom: 0 }}>
            Sistem Pembayaran Sewa Kios Plaza Kebun Sayur
          </p>
        </div>

        {/* Komponen Form Utama Masuk Log Tunggal */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Alamat Email</label>
            <input 
              type="email" 
              name="email"
              placeholder="nama@email.com" 
              value={formData.email}
              onChange={handleInputChange}
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
              required 
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <button 
              type="button" 
              onClick={handleLupaPassword}
              style={{ 
                backgroundColor: 'transparent', 
                color: 'var(--red)', 
                fontSize: '14px', 
                fontWeight: '500',
                padding: '0',
                minHeight: 'auto',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Lupa Kata Sandi?
            </button>
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
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--red-dark)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--red)'}
          >
            Masuk ke Aplikasi
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;