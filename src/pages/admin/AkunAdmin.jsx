import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Icon from '../../components/ui/Icon';

function AkunAdmin() {
  const { user, updateUser } = useAuth();
  const { addToast } = useUI();

  const [formData, setFormData] = useState({
    username: user?.username || 'admin',
    nama: user?.name || 'Pengelola Plaza (Admin Utama)',
    email: user?.email || 'info.plazabunsay@gmail.com',
    telepon: user?.telepon || '0811-5901-119',
    kataSandiLama: '',
    kataSandiBaru: '',
    konfirmasiKataSandi: ''
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSimpanProfil = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.nama || !formData.email) {
      addToast('Username, Nama Pengelola, dan Email wajib diisi.', 'error');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      addToast('Format email tidak valid (contoh: nama@domain.com).', 'error');
      return;
    }

    setIsLoadingProfile(true);
    setTimeout(() => {
      updateUser({
        username: formData.username.trim(),
        name: formData.nama.trim(),
        email: formData.email.trim(),
        telepon: formData.telepon.trim()
      });
      setIsLoadingProfile(false);
      addToast('Profil Pengelola Plaza berhasil diperbarui.', 'success');
    }, 400);
  };

  const handleUbahSandi = (e) => {
    e.preventDefault();
    if (!formData.kataSandiBaru || formData.kataSandiBaru.length < 6) {
      addToast('Kata sandi baru minimal 6 karakter.', 'error');
      return;
    }

    if (formData.kataSandiBaru !== formData.konfirmasiKataSandi) {
      addToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }

    setIsLoadingPassword(true);
    setTimeout(() => {
      setIsLoadingPassword(false);
      setFormData(prev => ({
        ...prev,
        kataSandiLama: '',
        kataSandiBaru: '',
        konfirmasiKataSandi: ''
      }));
      addToast('Kata sandi pengelola berhasil diperbarui!', 'success');
    }, 400);
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Pengaturan Akun Pengelola
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Kelola profil, email, dan kata sandi akun pengelola kantor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Form Profil Pengelola */}
        <Card variant="elevated" className="p-6 sm:p-7 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Icon icon="heroicons:user-circle-20-solid" width="24" height="24" className="text-red" />
            <h3 className="text-lg font-extrabold text-text tracking-tight text-balance">Data Profil Pengelola</h3>
          </div>

          <form onSubmit={handleSimpanProfil} className="flex flex-col gap-4">
            <FormField label="Username Login Utama" id="admin-profile-username" required>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold text-text focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Nama Pengelola / Instansi" id="admin-profile-nama" required>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold text-text focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Email Resmi Administrasi" id="admin-profile-email" required>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-semibold text-text focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Nomor Telepon Kantor / Loket" id="admin-profile-telepon">
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleInputChange}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold font-tabular-nums text-text focus:bg-white transition-colors"
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoadingProfile}
              className="mt-2 h-12 text-base font-extrabold shadow-md"
            >
              {isLoadingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </Button>
          </form>
        </Card>

        {/* Form Ubah Kata Sandi */}
        <Card variant="elevated" className="p-6 sm:p-7 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Icon icon="heroicons:lock-closed-20-solid" width="24" height="24" className="text-red" />
            <h3 className="text-lg font-extrabold text-text tracking-tight text-balance">Ubah Kata Sandi Akun</h3>
          </div>

          <form onSubmit={handleUbahSandi} className="flex flex-col gap-4">
            <FormField label="Kata Sandi Saat Ini" id="admin-password-old">
              <input
                type="password"
                name="kataSandiLama"
                placeholder="Masukkan kata sandi lama"
                value={formData.kataSandiLama}
                onChange={handleInputChange}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Kata Sandi Baru" id="admin-password-new" required>
              <input
                type="password"
                name="kataSandiBaru"
                placeholder="Minimal 6 karakter"
                value={formData.kataSandiBaru}
                onChange={handleInputChange}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Konfirmasi Kata Sandi Baru" id="admin-password-confirm" required>
              <input
                type="password"
                name="konfirmasiKataSandi"
                placeholder="Ulangi kata sandi baru"
                value={formData.konfirmasiKataSandi}
                onChange={handleInputChange}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoadingPassword}
              className="mt-2 h-12 text-base font-extrabold shadow-md"
            >
              {isLoadingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default AkunAdmin;
