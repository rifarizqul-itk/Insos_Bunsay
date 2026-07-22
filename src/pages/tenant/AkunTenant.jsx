import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useTenantProfile } from '../../hooks/useTenant';

import FormField from '../../components/ui/FormField';

function AkunTenant() {
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useUI();
  const { data: profileFromApi, loading, updateProfile } = useTenantProfile();

  const [profileData, setProfileData] = useState({
    nama: user?.name || user?.nama || 'Hj. Yuliana',
    kios: user?.kios || 'B-1001',
    email: user?.email || 'yuliana.bunsay@email.com',
    telepon: '0812-5564-593',
    alamat: 'Jl. Adil Makmur No. 42, Kec. Balikpapan Barat, Kota Balikpapan, Kaltim 76123',
    jenisUsaha: 'Kerajinan'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profileData });
  const [fieldError, setFieldError] = useState(null); // { field: string, message: string }
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profileFromApi) {
      const merged = {
        ...profileData,
        ...profileFromApi
      };
      setProfileData(merged);
      setFormData(merged);
    }
  }, [profileFromApi]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldError && fieldError.field === name) {
      setFieldError(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFieldError(null);
    setIsSubmitting(true);

    try {
      const result = await updateProfile(formData);
      if (result && result.success) {
        const updated = result.data || formData;
        setProfileData(updated);
        updateUser({ name: updated.nama, nama: updated.nama, email: updated.email, telepon: updated.telepon, alamat: updated.alamat });
        setIsEditing(false);
        addToast(result.message || 'Profil berhasil diperbarui.', 'success');
      } else if (result && !result.success) {
        addToast(result.message || 'Gagal memperbarui profil.', 'error');
        if (result.field) {
          setFieldError({ field: result.field, message: result.message });
        }
      }
    } catch (_) {
      addToast('Terjadi kesalahan saat menyimpan profil.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px' }}>Pengaturan Akun Tenant</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Kelola informasi data diri dan akses penutupan sesi login.
        </p>
      </div>

      <div className="akun-layout-grid mobile-stack" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', items: 'flex-start' }}>
        <div 
          className="p-5 sm:p-6 md:p-8"
          style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)', 
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)' 
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', color: 'var(--text)' }}>Detail Profil Pemilik Kios</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Nama Lengkap" id="profile-nama" required error={fieldError?.field === 'nama' ? fieldError.message : undefined}>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  aria-readonly={!isEditing}
                  style={{
                    backgroundColor: isEditing ? '#ffffff' : 'var(--warm-gray)',
                    color: 'var(--text)',
                    border: fieldError?.field === 'nama' ? '2px solid var(--red)' : '1px solid var(--border)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '16px',
                    height: '44px'
                  }}
                />
              </FormField>

              <FormField label="Nomor Kios" id="profile-kios">
                <input id="profile-kios" type="text" name="kios" value={formData.kios} readOnly aria-readonly="true" style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text-2)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '16px', height: '44px', fontWeight: '700' }} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Email" id="profile-email" required error={fieldError?.field === 'email' ? fieldError.message : undefined}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  aria-readonly={!isEditing}
                  style={{
                    backgroundColor: isEditing ? '#ffffff' : 'var(--warm-gray)',
                    color: 'var(--text)',
                    border: fieldError?.field === 'email' ? '2px solid var(--red)' : '1px solid var(--border)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '16px',
                    height: '44px'
                  }}
                />
              </FormField>

              <FormField label="Telepon" id="profile-telepon" required error={fieldError?.field === 'telepon' ? fieldError.message : undefined}>
                <input
                  type="tel"
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  aria-readonly={!isEditing}
                  style={{
                    backgroundColor: isEditing ? '#ffffff' : 'var(--warm-gray)',
                    color: 'var(--text)',
                    border: fieldError?.field === 'telepon' ? '2px solid var(--red)' : '1px solid var(--border)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '16px',
                    height: '44px'
                  }}
                />
              </FormField>
            </div>

            <FormField label="Jenis Usaha" id="profile-jenis-usaha">
              <input type="text" name="jenisUsaha" value={formData.jenisUsaha} readOnly aria-readonly="true" style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text-2)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '16px', height: '44px' }} />
            </FormField>

            <FormField label="Alamat Lengkap" id="profile-alamat" required error={fieldError?.field === 'alamat' ? fieldError.message : undefined}>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                readOnly={!isEditing}
                aria-readonly={!isEditing}
                rows="3"
                style={{
                  backgroundColor: isEditing ? '#ffffff' : 'var(--warm-gray)',
                  color: 'var(--text)',
                  border: fieldError?.field === 'alamat' ? '2px solid var(--red)' : '1px solid var(--border)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  resize: 'none'
                }}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              {isEditing ? (
                <>
                  <button type="button" onClick={() => { setFormData({ ...profileData }); setFieldError(null); setIsEditing(false); }} style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '0 24px', fontSize: '14px', fontWeight: '600', height: '44px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Batal</button>
                  <button type="submit" disabled={isSubmitting} style={{ backgroundColor: isSubmitting ? 'var(--disabled-bg)' : 'var(--red)', color: '#ffffff', padding: '0 24px', fontSize: '14px', fontWeight: '700', height: '44px', border: 'none', borderRadius: 'var(--radius-md)', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
                </>
              ) : (
                <button type="button" onClick={() => setIsEditing(true)} style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '0 24px', fontSize: '14px', fontWeight: '600', height: '44px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Ubah Data Profil</button>
              )}
            </div>

          </form>
        </div>

        <div 
          className="p-4 sm:p-5 md:p-6"
          style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)' 
          }}
        >
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
