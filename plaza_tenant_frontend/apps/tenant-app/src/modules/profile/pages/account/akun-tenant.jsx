import React, { useState } from 'react';
import { FormField, Button, Card, Icon } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../../public/TenantAuthProvider';

function AkunTenant() {
  const { user, logout } = useTenantAuth();

  const [profileData, setProfileData] = useState({
    nama: user?.name || user?.Username || 'Hj. Yuliana',
    kios: 'B-1001, B-1002',
    email: user?.email || 'yuliana@bunsay.id',
    telepon: '0812-5544-3322',
    alamat: 'Jl. Letjen Suprapto No. 12, Balikpapan Barat',
    jenisUsaha: 'Sembako & Kelontong'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profileData });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    kataSandiLama: '',
    kataSandiBaru: '',
    konfirmasiKataSandi: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setProfileData(formData);
      setIsEditing(false);
      setIsSubmitting(false);
    }, 400);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordData.kataSandiBaru !== passwordData.konfirmasiKataSandi) {
      alert('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordData({
        kataSandiLama: '',
        kataSandiBaru: '',
        konfirmasiKataSandi: ''
      });
      alert('Kata sandi akun tenant berhasil diperbarui!');
    }, 400);
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Pengaturan Akun Tenant
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Kelola profil pemilik kios, kontak, dan kata sandi Anda.
        </p>
      </div>

      <div className="akun-layout-grid mobile-stack grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <Card variant="elevated" className="lg:col-span-8 p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="text-lg font-extrabold text-text tracking-tight border-b border-border pb-3 text-balance">
            Detail Profil Pemilik Kios
          </h3>
          
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Nama Lengkap" id="profile-nama" required>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  aria-readonly={!isEditing}
                  className={`w-full h-11 rounded-md border px-3.5 text-base font-semibold transition-colors ${
                    isEditing ? 'bg-white border-border focus:ring-2 focus:ring-red' : 'bg-warm-gray/50 border-border/80 text-text'
                  }`}
                />
              </FormField>

              <FormField label="Nomor Kios" id="profile-kios">
                <input 
                  id="profile-kios" 
                  type="text" 
                  name="kios" 
                  value={formData.kios} 
                  readOnly 
                  aria-readonly="true" 
                  className="w-full h-11 rounded-md border border-border/80 bg-warm-gray/50 px-3.5 text-base font-extrabold font-tabular-nums text-text-2" 
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Email" id="profile-email" required>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  aria-readonly={!isEditing}
                  className={`w-full h-11 rounded-md border px-3.5 text-base font-medium transition-colors ${
                    isEditing ? 'bg-white border-border focus:ring-2 focus:ring-red' : 'bg-warm-gray/50 border-border/80 text-text'
                  }`}
                />
              </FormField>

              <FormField label="Telepon" id="profile-telepon" required>
                <input
                  type="tel"
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  aria-readonly={!isEditing}
                  className={`w-full h-11 rounded-md border px-3.5 text-base font-semibold font-tabular-nums transition-colors ${
                    isEditing ? 'bg-white border-border focus:ring-2 focus:ring-red' : 'bg-warm-gray/50 border-border/80 text-text'
                  }`}
                />
              </FormField>
            </div>

            <FormField label="Jenis Usaha" id="profile-jenis-usaha">
              <input 
                type="text" 
                name="jenisUsaha" 
                value={formData.jenisUsaha} 
                readOnly 
                aria-readonly="true" 
                className="w-full h-11 rounded-md border border-border/80 bg-warm-gray/50 px-3.5 text-base font-semibold text-text-2" 
              />
            </FormField>

            <FormField label="Alamat Lengkap" id="profile-alamat" required>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                readOnly={!isEditing}
                aria-readonly={!isEditing}
                rows={3}
                className={`w-full rounded-md border p-3 text-base font-medium leading-relaxed resize-none transition-colors ${
                  isEditing ? 'bg-white border-border focus:ring-2 focus:ring-red' : 'bg-warm-gray/50 border-border/80 text-text'
                }`}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-2">
              {isEditing ? (
                <>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => { setFormData({ ...profileData }); setIsEditing(false); }}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </>
              ) : (
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Icon icon="heroicons:pencil-square-20-solid" width="18" height="18" />
                  <span>Ubah Data Profil</span>
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <form onSubmit={handleSavePassword}>
            <Card variant="elevated" className="flex flex-col gap-4 p-6">
              <h3 className="text-base font-extrabold text-text tracking-tight border-b border-border pb-3 text-balance">
                Ubah Kata Sandi
              </h3>
              
              <FormField label="Kata Sandi Saat Ini" id="tenant-pwd-old">
                <input
                  type="password"
                  name="kataSandiLama"
                  placeholder="Masukkan kata sandi lama"
                  value={passwordData.kataSandiLama}
                  onChange={handlePasswordChange}
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
                />
              </FormField>

              <FormField label="Kata Sandi Baru" id="tenant-pwd-new" required>
                <input
                  type="password"
                  name="kataSandiBaru"
                  placeholder="Minimal 6 karakter"
                  value={passwordData.kataSandiBaru}
                  onChange={handlePasswordChange}
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
                />
              </FormField>

              <FormField label="Konfirmasi Kata Sandi Baru" id="tenant-pwd-confirm" required>
                <input
                  type="password"
                  name="konfirmasiKataSandi"
                  placeholder="Ulangi kata sandi baru"
                  value={passwordData.konfirmasiKataSandi}
                  onChange={handlePasswordChange}
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isChangingPassword}
                className="mt-1 h-11 text-sm font-extrabold shadow-sm"
              >
                {isChangingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
              </Button>
            </Card>
          </form>

          <Card variant="elevated" className="flex flex-col gap-4 p-6">
            <h3 className="text-base font-extrabold text-text tracking-tight border-b border-border pb-3 text-balance">
              Keluar Akun
            </h3>
            <p className="text-sm text-text-2 font-medium leading-relaxed text-pretty">
              Keluar dari akun tenant untuk mengakhiri sesi aktif Anda pada perangkat ini.
            </p>
            <Button
              type="button"
              variant="danger"
              fullWidth
              className="h-11 text-sm font-bold gap-2"
              onClick={() => logout()}
            >
              <Icon icon="heroicons:arrow-right-on-rectangle-20-solid" width="18" height="18" />
              <span>Keluar dari Akun</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AkunTenant;
