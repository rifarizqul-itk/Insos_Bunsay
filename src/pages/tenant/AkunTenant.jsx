import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

function AkunTenant() {
  const { user, logout } = useAuth();
  const { addToast } = useUI();

  const [profileData, setProfileData] = useState({
    nama: user?.name || 'Hj. Yuliana',
    kios: user?.kios || 'B-1001',
    email: user?.email || 'yuliana.bunsay@email.com',
    telepon: '0812-5564-593',
    alamat: 'Jl. Adil Makmur No. 42, Kec. Balikpapan Barat, Kota Balikpapan, Kaltim 76123',
    jenisUsaha: 'Kerajinan'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profileData });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfileData({ ...formData });
    setIsEditing(false);
    addToast('Profil berhasil diperbarui.', 'success');
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px' }}>Pengaturan Akun Tenant</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Kelola informasi data diri dan akses penutupan sesi login.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '32px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', color: 'var(--text)' }}>Detail Profil Pemilik Kios</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nama Lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} disabled={!isEditing} style={{ backgroundColor: isEditing ? '#ffffff' : 'var(--warm-gray)', color: 'var(--text)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '15px', height: '44px' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nomor Kios</label>
                <input type="text" name="kios" value={formData.kios} disabled style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text-2)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '15px', height: '44px', fontWeight: '700' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} style={{ backgroundColor: isEditing ? '#ffffff' : 'var(--warm-gray)', color: 'var(--text)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '15px', height: '44px' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Telepon</label>
                <input type="tel" name="telepon" value={formData.telepon} onChange={handleInputChange} disabled={!isEditing} style={{ backgroundColor: isEditing ? '#ffffff' : 'var(--warm-gray)', color: 'var(--text)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '15px', height: '44px' }} required />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Jenis Usaha</label>
              <input type="text" name="jenisUsaha" value={formData.jenisUsaha} disabled style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text-2)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '15px', height: '44px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Alamat Lengkap</label>
              <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} disabled={!isEditing} rows="3" style={{ backgroundColor: isEditing ? '#ffffff' : 'var(--warm-gray)', color: 'var(--text)', border: '1px solid var(--border)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: '15px', lineHeight: '1.6', resize: 'none' }} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              {isEditing ? (
                <>
                  <button type="button" onClick={() => { setFormData({ ...profileData }); setIsEditing(false); }} style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '0 24px', fontSize: '14px', fontWeight: '600', height: '44px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>Batal</button>
                  <button type="submit" style={{ backgroundColor: 'var(--red)', color: '#ffffff', padding: '0 24px', fontSize: '14px', fontWeight: '700', height: '44px', border: 'none', borderRadius: 'var(--radius-md)' }}>Simpan</button>
                </>
              ) : (
                <button type="button" onClick={() => setIsEditing(true)} style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '0 24px', fontSize: '14px', fontWeight: '600', height: '44px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>Ubah Data Profil</button>
              )}
            </div>
          </form>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Akses Keamanan</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: '1.6' }}>
            Logout untuk mengakhiri sesi aktif Anda.
          </p>
          <button
            type="button"
            onClick={() => { logout(); addToast('Anda telah logout.', 'info'); }}
            style={{
              backgroundColor: 'var(--red-100)',
              color: 'var(--red)',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '700',
              width: '100%',
              border: '1px solid var(--border)',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  );
}

export default AkunTenant;
