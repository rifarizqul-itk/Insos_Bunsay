import React, { useState } from 'react';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    nomorKios: '',
    nomorTelepon: '',
    kataSandi: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Memproses masuk log dengan:', formData.email, formData.kataSandi);
    } else {
      console.log('Memproses pendaftaran akun tenant baru:', formData);
    }
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
        /* boxShadow: 'var(--shadow-sm)', */
        padding: '40px 32px'
      }}>
        {/* Header Identitas Aplikasi */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--red)', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Bunsay
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '6px' }}>
            Sistem Pembayaran Sewa Kios Plaza Kebun Sayur
          </p>
        </div>

        {/* Form Navigasi Tab */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--warm-gray)', marginBottom: '24px' }}>
          <button 
            onClick={() => setIsLogin(true)}
            style={{ 
              flex: 1, 
              backgroundColor: 'transparent', 
              color: isLogin ? 'var(--red)' : 'var(--text-3)', 
              borderRadius: '0', 
              borderBottom: isLogin ? '2px solid var(--red)' : '2px solid transparent',
              marginBottom: '-2px',
              fontWeight: '700'
            }}
          >
            Masuk
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            style={{ 
              flex: 1, 
              backgroundColor: 'transparent', 
              color: !isLogin ? 'var(--red)' : 'var(--text-3)', 
              borderRadius: '0', 
              borderBottom: !isLogin ? '2px solid var(--red)' : '2px solid transparent',
              marginBottom: '-2px',
              fontWeight: '700'
            }}
          >
            Daftar Tenant
          </button>
        </div>

        {/* Komponen Form Utama */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nama Lengkap</label>
              <input 
                type="text" 
                name="namaLengkap"
                placeholder="Contoh: Hj. Yuliana" 
                value={formData.namaLengkap}
                onChange={handleInputChange}
                required 
              />
            </div>
          )}

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

          {!isLogin && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nomor Kios</label>
                <input 
                  type="text" 
                  name="nomorKios"
                  placeholder="Contoh: B-1001" 
                  value={formData.nomorKios}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nomor Telepon</label>
                <input 
                  type="tel" 
                  name="nomorTelepon"
                  placeholder="Contoh: 0812-5564-593" 
                  value={formData.nomorTelepon}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </>
          )}

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

          {isLogin && (
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
                  minHeight: 'auto'
                }}
              >
                Lupa Kata Sandi?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            style={{ 
              backgroundColor: 'var(--red)', 
              color: '#ffffff', 
              padding: '12px', 
              fontSize: '15px', 
              fontWeight: '700', 
              marginTop: '8px' 
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--red-dark)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--red)'}
          >
            {isLogin ? 'Masuk ke Aplikasi' : 'Daftarkan Akun Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;