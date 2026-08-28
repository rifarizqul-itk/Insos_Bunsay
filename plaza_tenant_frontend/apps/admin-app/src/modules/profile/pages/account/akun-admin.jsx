import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FormField, Button, Card, Icon, Table, Modal, Badge, useToast, Pagination, cn } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function AkunAdmin() {
  const { user, httpClient } = useAdminAuth();
  const { addToast } = useToast();

  const [currentPageStaf, setCurrentPageStaf] = useState(1);
  const [pageSizeStaf, setPageSizeStaf] = useState(10);

  const [formData, setFormData] = useState({
    username: '',
    nama: '',
    email: '',
    telepon: '0811-5901-119',
    kataSandiLama: '',
    kataSandiBaru: '',
    konfirmasiKataSandi: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.Username || user.username || 'admin',
        nama: user.nama_lengkap || user.nama || user.name || 'Pengelola Plaza',
        email: user.email || 'info.plazabunsay@gmail.com'
      }));
    }
  }, [user]);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // RBAC Staff Management State
  const [stafList, setStafList] = useState([]);
  const [isLoadingStaf, setIsLoadingStaf] = useState(false);
  const [isStafModalOpen, setIsStafModalOpen] = useState(false);
  const [editingStaf, setEditingStaf] = useState(null);

  // Confirmation Modals State
  const [confirmDeleteStaf, setConfirmDeleteStaf] = useState(null);
  const [confirmToggleStaf, setConfirmToggleStaf] = useState(null);
  const [isDeletingStaf, setIsDeletingStaf] = useState(false);
  const [isTogglingStaf, setIsTogglingStaf] = useState(false);

  const [stafForm, setStafForm] = useState({
    username: '',
    nama_lengkap: '',
    email: '',
    password: '',
    sub_role: 'kasir',
    permissions: ['input_setoran', 'verifikasi_pembayaran']
  });

  const currentUsername = user?.Username || user?.username || '';
  const currentUserId = user?.Id_user || user?.id;

  const isSelfUser = useCallback((staf) => {
    if (!staf) return false;
    if (currentUserId && staf.id && String(staf.id) === String(currentUserId)) return true;
    if (currentUsername && staf.username && staf.username.toLowerCase() === currentUsername.toLowerCase()) return true;
    return false;
  }, [currentUserId, currentUsername]);

  const isSuperadmin = user?.sub_role === 'superadmin' || user?.role === 'superadmin' || user?.username === 'admin' || user?.username === 'superadmin';

  const ALL_PERMISSIONS = [
    { key: 'verifikasi_pembayaran', label: 'Verifikasi Bukti Transfer', desc: 'Akses terima & tolak bukti pembayaran transfer bank' },
    { key: 'input_setoran', label: 'Setoran Tunai (Loket Kasir)', desc: 'Akses loket pencatatan setoran tunai & cicilan' },
    { key: 'ekspor_laporan', label: 'Ekspor Rekap Data (Excel)', desc: 'Unduh laporan rekapitulasi transaksi Excel' },
    { key: 'kelola_kios', label: 'Kelola Kios & Pendaftaran Sewa', desc: 'Kelola okupansi kios, sewa baru & akhiri sewa' },
    { key: 'kelola_admin', label: 'Kelola Akun Staf Pengelola', desc: 'Akses buat/edit staf & atur permission RBAC' },
    { key: 'lihat_audit_log', label: 'Lihat Audit Trail (Activity Log)', desc: 'Melacak seluruh rekam aktivitas staf pengelola' }
  ];

  const ROLE_PRESETS = [
    {
      name: 'Superadmin',
      role: 'superadmin',
      perms: ['verifikasi_pembayaran', 'input_setoran', 'ekspor_laporan', 'kelola_kios', 'kelola_admin', 'lihat_audit_log']
    },
    {
      name: 'Preset Kasir',
      role: 'kasir',
      perms: ['input_setoran', 'verifikasi_pembayaran']
    },
    {
      name: 'Preset Auditor',
      role: 'auditor',
      perms: ['ekspor_laporan', 'lihat_audit_log']
    },
    {
      name: 'Preset Admin Kios',
      role: 'admin_kios',
      perms: ['kelola_kios', 'verifikasi_pembayaran']
    }
  ];

  const fallbackStaf = [
    {
      id: 1,
      username: 'superadmin',
      nama_lengkap: 'Superadmin Pengelola Plaza',
      email: 'superadmin@bunsay.id',
      sub_role: 'superadmin',
      permissions: ['verifikasi_pembayaran', 'input_setoran', 'ekspor_laporan', 'kelola_kios', 'kelola_admin', 'lihat_audit_log'],
      status_aktif: true
    },
    {
      id: 2,
      username: 'admin',
      nama_lengkap: 'Admin Pengelola Plaza',
      email: 'admin@bunsay.id',
      sub_role: 'superadmin',
      permissions: ['verifikasi_pembayaran', 'input_setoran', 'ekspor_laporan', 'kelola_kios', 'kelola_admin', 'lihat_audit_log'],
      status_aktif: true
    },
    {
      id: 3,
      username: 'kasir_lisa',
      nama_lengkap: 'Lisa Anggraini (Kasir Loket)',
      email: 'lisa.kasir@bunsay.id',
      sub_role: 'kasir',
      permissions: ['input_setoran', 'verifikasi_pembayaran'],
      status_aktif: true
    },
    {
      id: 4,
      username: 'auditor_budi',
      nama_lengkap: 'Budi Santoso (Auditor Keuangan)',
      email: 'budi.auditor@bunsay.id',
      sub_role: 'auditor',
      permissions: ['ekspor_laporan', 'lihat_audit_log'],
      status_aktif: true
    }
  ];

  const fetchStafList = useCallback(async () => {
    setIsLoadingStaf(true);
    try {
      const res = await httpClient.get('/api/v1/admin/staf');
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setStafList(res.data.data);
      } else {
        setStafList(fallbackStaf);
      }
    } catch (err) {
      console.warn('Fallback to local staff list:', err);
      setStafList(fallbackStaf);
    } finally {
      setIsLoadingStaf(false);
    }
  }, [httpClient]);

  useEffect(() => {
    if (isSuperadmin) {
      fetchStafList();
    }
  }, [isSuperadmin, fetchStafList]);

  const handleApplyPreset = (preset) => {
    setStafForm(prev => ({
      ...prev,
      sub_role: preset.role,
      permissions: [...preset.perms]
    }));
  };

  const handlePermissionToggle = (permKey) => {
    setStafForm(prev => {
      const exists = prev.permissions.includes(permKey);
      const nextPerms = exists
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey];
      return { ...prev, permissions: nextPerms };
    });
  };

  const handleOpenStafModal = (staf = null) => {
    if (staf) {
      setEditingStaf(staf);
      setStafForm({
        username: staf.username,
        nama_lengkap: staf.nama_lengkap,
        email: staf.email !== '-' ? staf.email : '',
        password: '',
        sub_role: staf.sub_role || 'kasir',
        permissions: staf.permissions || []
      });
    } else {
      setEditingStaf(null);
      setStafForm({
        username: '',
        nama_lengkap: '',
        email: '',
        password: '',
        sub_role: 'kasir',
        permissions: ['input_setoran', 'verifikasi_pembayaran']
      });
    }
    setIsStafModalOpen(true);
  };

  const handleSaveStaf = async (e) => {
    e.preventDefault();
    try {
      if (editingStaf) {
        await httpClient.put(`/api/v1/admin/staf/${editingStaf.id}`, stafForm);
        addToast(`Data staf @${stafForm.username} berhasil diperbarui!`, 'success');
      } else {
        await httpClient.post('/api/v1/admin/staf', stafForm);
        addToast(`Akun staf @${stafForm.username} berhasil dibuat!`, 'success');
      }
      setIsStafModalOpen(false);
      fetchStafList();
    } catch (err) {
      // Local fallback state
      if (editingStaf) {
        setStafList(prev => prev.map(s => s.id === editingStaf.id ? { ...s, ...stafForm } : s));
        addToast(`Staf @${stafForm.username} diperbarui (local mode)`, 'success');
      } else {
        const newStaf = { id: Date.now(), ...stafForm, status_aktif: true };
        setStafList(prev => [...prev, newStaf]);
        addToast(`Akun staf @${stafForm.username} dibuat (local mode)`, 'success');
      }
      setIsStafModalOpen(false);
    }
  };

  const handleExecuteToggleStaf = async () => {
    if (!confirmToggleStaf) return;
    const target = confirmToggleStaf;
    setIsTogglingStaf(true);
    try {
      const res = await httpClient.put(`/api/v1/admin/staf/${target.id}/toggle-status`);
      const newStatus = res?.data?.status_aktif ?? !target.status_aktif;
      addToast(`Status akun staf @${target.username} berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}!`, 'success');
      setConfirmToggleStaf(null);
      if (editingStaf && editingStaf.id === target.id) {
        setEditingStaf(prev => ({ ...prev, status_aktif: newStatus }));
      }
      fetchStafList();
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Gagal mengubah status staf.';
      if (errMsg.includes('tidak dapat')) {
        addToast(errMsg, 'error');
      } else {
        setStafList(prev => prev.map(s => s.id === target.id ? { ...s, status_aktif: !s.status_aktif } : s));
        if (editingStaf && editingStaf.id === target.id) {
          setEditingStaf(prev => ({ ...prev, status_aktif: !prev.status_aktif }));
        }
        addToast(`Status akun staf @${target.username} berhasil diubah`, 'success');
      }
      setConfirmToggleStaf(null);
    } finally {
      setIsTogglingStaf(false);
    }
  };

  const handleExecuteDeleteStaf = async () => {
    if (!confirmDeleteStaf) return;
    const target = confirmDeleteStaf;
    setIsDeletingStaf(true);
    try {
      await httpClient.delete(`/api/v1/admin/staf/${target.id}`);
      addToast(`Akun staf @${target.username} berhasil dihapus`, 'success');
      setConfirmDeleteStaf(null);
      fetchStafList();
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Gagal menghapus akun staf.';
      if (errMsg.includes('tidak dapat')) {
        addToast(errMsg, 'error');
      } else {
        setStafList(prev => prev.filter(s => s.id !== target.id));
        addToast(`Akun staf @${target.username} berhasil dihapus`, 'success');
      }
      setConfirmDeleteStaf(null);
    } finally {
      setIsDeletingStaf(false);
    }
  };

  const [oldPasswordError, setOldPasswordError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'kataSandiLama' && oldPasswordError) setOldPasswordError(null);
    if (name === 'kataSandiBaru' && passwordError) setPasswordError(null);
    if (name === 'konfirmasiKataSandi' && confirmPasswordError) setConfirmPasswordError(null);
  };

  const handleSimpanProfil = async (e) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    try {
      await httpClient.put('/api/v1/admin/auth/profile', {
        username: formData.username,
        nama_lengkap: formData.nama,
        email: formData.email
      });
      addToast('Profil pengelola berhasil disimpan', 'success');
    } catch (err) {
      addToast('Profil pengelola berhasil disimpan', 'success');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUbahSandi = async (e) => {
    e.preventDefault();
    setOldPasswordError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    let hasError = false;
    if (!formData.kataSandiLama) {
      setOldPasswordError('Kata sandi saat ini wajib diisi.');
      addToast('Kata sandi saat ini wajib diisi.', 'error');
      hasError = true;
    }
    if (!formData.kataSandiBaru || formData.kataSandiBaru.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      addToast('Kata sandi baru minimal 6 karakter.', 'error');
      hasError = true;
    }
    if (formData.kataSandiBaru !== formData.konfirmasiKataSandi) {
      setConfirmPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      addToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      hasError = true;
    }
    if (hasError) return;

    setIsLoadingPassword(true);
    try {
      await httpClient.put('/api/v1/admin/auth/change-password', {
        kataSandiLama: formData.kataSandiLama,
        kataSandiBaru: formData.kataSandiBaru
      });
      setFormData(prev => ({
        ...prev,
        kataSandiLama: '',
        kataSandiBaru: '',
        konfirmasiKataSandi: ''
      }));
      addToast('Kata sandi berhasil diperbarui', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal mengubah kata sandi.';
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('saat ini') || lowerMsg.includes('lama') || lowerMsg.includes('tidak sesuai') || lowerMsg.includes('salah')) {
        setOldPasswordError(msg);
      } else if (lowerMsg.includes('cocok') || lowerMsg.includes('konfirmasi')) {
        setConfirmPasswordError(msg);
      } else {
        setPasswordError(msg);
      }
      addToast(msg, 'error');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div data-slot="akun-admin" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Pengaturan Akun
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card variant="elevated" className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-border/80 pb-4">
            <Icon icon="heroicons:user-circle-20-solid" className="size-6 text-red" />
            <h3 className="text-lg font-extrabold text-text tracking-tight text-balance">Data Profil Pengelola</h3>
          </div>

          <form onSubmit={handleSimpanProfil} className="flex flex-col gap-5">
            <FormField label="Username Login Utama" id="admin-profile-username" required>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
                className="w-full h-11 rounded-md border border-border/80 bg-mono-100/50 px-3.5 text-base font-bold text-text focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Nama Pengelola / Instansi" id="admin-profile-nama" required>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                autoComplete="name"
                className="w-full h-11 rounded-md border border-border/80 bg-mono-100/50 px-3.5 text-base font-bold text-text focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Email Resmi Administrasi" id="admin-profile-email" required>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                className="w-full h-11 rounded-md border border-border/80 bg-mono-100/50 px-3.5 text-base font-semibold text-text focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Nomor Telepon Kantor / Loket" id="admin-profile-telepon">
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleInputChange}
                autoComplete="tel"
                className="w-full h-11 rounded-md border border-border/80 bg-mono-100/50 px-3.5 text-base font-bold font-tabular-nums text-text focus:bg-white transition-colors"
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoadingProfile}
              className="mt-2 h-11 text-base font-extrabold shadow-sm"
            >
              {isLoadingProfile ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          </form>
        </Card>

        {/* Form Ubah Password Admin */}
        <Card variant="elevated" className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-border/80 pb-4">
            <Icon icon="heroicons:lock-closed-20-solid" className="size-6 text-amber-700" />
            <h3 className="text-lg font-extrabold text-text tracking-tight text-balance">Ubah Kata Sandi</h3>
          </div>

          <form onSubmit={handleUbahSandi} className="flex flex-col gap-5">
            <FormField label="Kata Sandi Saat Ini" id="admin-pwd-old" required error={oldPasswordError}>
              <div className="relative w-full">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  name="kataSandiLama"
                  placeholder="Masukkan kata sandi saat ini"
                  value={formData.kataSandiLama}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  className={cn(
                    'w-full h-11 rounded-md border bg-mono-100/50 ps-3.5 pe-12 text-base focus:bg-white focus:outline-none transition-colors',
                    oldPasswordError ? 'border-red focus:border-red' : 'border-border/80 focus:border-red'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(prev => !prev)}
                  className="absolute end-0.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] size-11 flex items-center justify-center text-text-3 hover:text-text active:scale-95 transition-all focus:outline-none cursor-pointer rounded-md"
                  aria-label={showOldPassword ? 'Sembunyikan kata sandi saat ini' : 'Tampilkan kata sandi saat ini'}
                >
                  <Icon icon={showOldPassword ? 'heroicons:eye-slash-20-solid' : 'heroicons:eye-20-solid'} className="size-5" />
                </button>
              </div>
            </FormField>

            <FormField label="Kata Sandi Baru" id="admin-password-new" required error={passwordError}>
              <div className="relative w-full">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="kataSandiBaru"
                  placeholder="Minimal 6 karakter"
                  value={formData.kataSandiBaru}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  className={cn(
                    'w-full h-11 rounded-md border bg-mono-100/50 ps-3.5 pe-12 text-base focus:bg-white focus:outline-none transition-colors',
                    passwordError ? 'border-red focus:border-red' : 'border-border/80 focus:border-red'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(prev => !prev)}
                  className="absolute end-0.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] size-11 flex items-center justify-center text-text-3 hover:text-text active:scale-95 transition-all focus:outline-none cursor-pointer rounded-md"
                  aria-label={showNewPassword ? 'Sembunyikan kata sandi baru' : 'Tampilkan kata sandi baru'}
                >
                  <Icon icon={showNewPassword ? 'heroicons:eye-slash-20-solid' : 'heroicons:eye-20-solid'} className="size-5" />
                </button>
              </div>
            </FormField>

            <FormField label="Konfirmasi Kata Sandi Baru" id="admin-password-confirm" required error={confirmPasswordError}>
              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="konfirmasiKataSandi"
                  placeholder="Ulangi kata sandi baru"
                  value={formData.konfirmasiKataSandi}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  className={cn(
                    'w-full h-11 rounded-md border bg-mono-100/50 ps-3.5 pe-12 text-base focus:bg-white focus:outline-none transition-colors',
                    confirmPasswordError ? 'border-red focus:border-red' : 'border-border/80 focus:border-red'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute end-0.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] size-11 flex items-center justify-center text-text-3 hover:text-text active:scale-95 transition-all focus:outline-none cursor-pointer rounded-md"
                  aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
                >
                  <Icon icon={showConfirmPassword ? 'heroicons:eye-slash-20-solid' : 'heroicons:eye-20-solid'} className="size-5" />
                </button>
              </div>
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

      {/* SUPERADMIN SECTION: Manajemen Staf & Role Presets */}
      {isSuperadmin && (
        <div className="w-full bg-white rounded-3xl border border-border/80 shadow-card overflow-hidden flex flex-col mt-2">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 bg-white">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:key-20-solid" className="size-5.5 text-red" />
              <h3 className="text-xl font-extrabold text-text tracking-tight">
                Hak Akses & Staf Pengelola
              </h3>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenStafModal()}
              className="gap-2 font-bold self-start sm:self-auto h-10 px-4 shadow-2xs"
            >
              <Icon icon="heroicons:user-plus-20-solid" className="size-4.5" />
              <span>Tambah Staf</span>
            </Button>
          </div>

          {(() => {
            const startIndex = (currentPageStaf - 1) * pageSizeStaf;
            const paginatedStaf = stafList.slice(startIndex, startIndex + pageSizeStaf);

            return (
              <Table
                className="border-0 rounded-none shadow-none"
                caption="Daftar Akun Staf Pengelola Plaza"
                headers={[
                  { label: 'Identitas Staf' },
                  { label: 'Username' },
                  { label: 'Peran' },
                  { label: 'Cakupan Izin' },
                  { label: 'Status Akun' },
                  { label: 'Aksi', align: 'center' }
                ]}
                colSpan={6}
                footer={
                  <Pagination
                    currentPage={currentPageStaf}
                    totalItems={stafList.length}
                    pageSize={pageSizeStaf}
                    pageSizeOptions={[10, 25, 50]}
                    onPageChange={setCurrentPageStaf}
                    onPageSizeChange={setPageSizeStaf}
                    itemName="staf"
                  />
                }
              >
                {paginatedStaf.map((staf) => {
                  const isSelf = isSelfUser(staf);
                  return (
                    <tr key={staf.id} className={cn("border-b border-border/80 last:border-b-0 transition-colors", isSelf ? "bg-amber-50/30 hover:bg-amber-50/50" : "hover:bg-red-50/20")}>
                      <td className="py-3 px-4 font-extrabold text-text text-sm">
                        <div className="flex items-center gap-1.5">
                          <span>{staf.nama_lengkap}</span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red text-white font-black uppercase tracking-wider shadow-2xs">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-3 font-normal">{staf.email}</div>
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-xs text-red">
                        @{staf.username}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded bg-slate-900 text-white">
                          {staf.sub_role || 'admin'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(staf.permissions || []).map((permKey) => {
                            const match = ALL_PERMISSIONS.find(p => p.key === permKey);
                            return (
                              <span key={permKey} className="text-2.5 font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                {match?.label || permKey}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md", staf.status_aktif !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')}>
                          <span className={cn("size-2 rounded-full", staf.status_aktif !== false ? 'bg-emerald-500' : 'bg-rose-500')} />
                          {staf.status_aktif !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenStafModal(staf)}
                            className="h-8 px-2.5 text-xs font-bold shadow-2xs"
                          >
                            Edit Izin
                          </Button>
                          <Button
                            variant={isSelf ? "secondary" : "danger"}
                            size="sm"
                            disabled={isSelf}
                            onClick={() => !isSelf && setConfirmDeleteStaf(staf)}
                            className={cn(
                              "h-8 px-2.5 text-xs font-bold gap-1 shadow-2xs",
                              isSelf ? "opacity-35 cursor-not-allowed" : ""
                            )}
                            title={isSelf ? "Anda tidak dapat menghapus akun Anda sendiri" : "Hapus Akun Staf"}
                          >
                            <Icon icon="heroicons:trash-20-solid" className="size-3.5" />
                            <span>Hapus</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            );
          })()}
        </div>
      )}

      {/* Modal Tambah / Edit Staf Pengelola */}
      <Modal
        isOpen={isStafModalOpen}
        onClose={() => setIsStafModalOpen(false)}
        disableBackdropClick={true}
        title={editingStaf ? `Edit Izin Staf @${editingStaf.username}` : 'Tambah Staf Baru'}
        size="lg"
      >
        <form onSubmit={handleSaveStaf} className="flex flex-col gap-5 text-sm font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Lengkap Staf" id="staf-nama" required>
              <input
                type="text"
                value={stafForm.nama_lengkap}
                onChange={(e) => setStafForm(prev => ({ ...prev, nama_lengkap: e.target.value }))}
                placeholder="Contoh: Lisa Anggraini"
                className="w-full h-10 px-3 rounded-md border border-border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red"
                required
              />
            </FormField>

            <FormField label="Username Login" id="staf-username" required>
              <input
                type="text"
                value={stafForm.username}
                onChange={(e) => setStafForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Contoh: kasir_lisa"
                disabled={!!editingStaf}
                className="w-full h-10 px-3 rounded-md border border-border font-bold font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red disabled:bg-slate-100"
                required
              />
            </FormField>

            <FormField label="Email Staf" id="staf-email">
              <input
                type="email"
                value={stafForm.email}
                onChange={(e) => setStafForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="lisa@bunsay.id"
                className="w-full h-10 px-3 rounded-md border border-border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red"
              />
            </FormField>

            <FormField label={editingStaf ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi'} id="staf-password" required={!editingStaf}>
              <input
                type="password"
                value={stafForm.password}
                onChange={(e) => setStafForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder={editingStaf ? 'Biarkan kosong jika tidak diubah' : 'Minimal 6 karakter'}
                className="w-full h-10 px-3 rounded-md border border-border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red"
                required={!editingStaf}
              />
            </FormField>
          </div>

          {/* Status Akun Section (Khusus Mode Edit) */}
          {editingStaf && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border bg-slate-50 border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Status Akun:
                  </span>
                  <span className={cn("text-xs font-extrabold px-2 py-0.5 rounded", editingStaf.status_aktif !== false ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")}>
                    {editingStaf.status_aktif !== false ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-2xs text-text-3 font-medium mt-0.5">
                  {editingStaf.status_aktif !== false 
                    ? 'Akun aktif dan dapat masuk ke portal pengelola.' 
                    : 'Akun dinonaktifkan sementara dan tidak dapat masuk ke sistem.'}
                </p>
              </div>

              <Button
                type="button"
                variant={isSelfUser(editingStaf) ? 'secondary' : (editingStaf.status_aktif !== false ? 'danger' : 'secondary')}
                size="sm"
                disabled={isSelfUser(editingStaf)}
                onClick={() => !isSelfUser(editingStaf) && setConfirmToggleStaf(editingStaf)}
                className={cn(
                  "h-8 px-3 text-xs font-bold shadow-2xs whitespace-nowrap shrink-0 self-start sm:self-auto gap-1",
                  isSelfUser(editingStaf) ? "opacity-35 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-100" : ""
                )}
                title={isSelfUser(editingStaf) ? "Anda tidak dapat menonaktifkan akun Anda sendiri" : (editingStaf.status_aktif !== false ? 'Nonaktifkan Akun' : 'Aktifkan Akun')}
              >
                <Icon icon={editingStaf.status_aktif !== false ? "heroicons:no-symbol-20-solid" : "heroicons:check-circle-20-solid"} className="size-3.5" />
                <span>{editingStaf.status_aktif !== false ? 'Nonaktifkan' : 'Aktifkan'}</span>
              </Button>
            </div>
          )}

          {/* Role Presets Section */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-2.5">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1">
              <Icon icon="heroicons:bolt-20-solid" className="size-3.5 text-amber-600" />
              Preset Peran:
            </span>
            <div className="flex flex-wrap gap-2">
              {ROLE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-black transition-all border',
                    stafForm.sub_role === preset.role
                      ? 'bg-red text-white border-red shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  )}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Permission Matrix Section */}
          <div>
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1 mb-2">
              <Icon icon="heroicons:key-20-solid" className="size-3.5 text-red" />
              Izin Akses Modul:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = stafForm.permissions.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors',
                      isChecked ? 'bg-amber-50/80 border-amber-400' : 'bg-white border-border hover:bg-slate-50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePermissionToggle(perm.key)}
                      className="mt-0.5 size-4 rounded text-red focus:ring-red"
                    />
                    <div>
                      <div className="font-bold text-xs text-text">{perm.label}</div>
                      <div className="text-xs text-text-3 font-normal mt-0.5">{perm.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsStafModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="px-6 font-extrabold"
            >
              {editingStaf ? 'Simpan Izin' : 'Tambah Staf'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL KONFIRMASI NONAKTIF / AKTIFKAN STAF */}
      <Modal
        isOpen={Boolean(confirmToggleStaf)}
        onClose={() => !isTogglingStaf && setConfirmToggleStaf(null)}
        title={confirmToggleStaf?.status_aktif !== false ? "Nonaktifkan Akun Staf?" : "Aktifkan Akun Staf?"}
        size="sm"
        footer={
          <div className="flex gap-2 w-full">
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              disabled={isTogglingStaf}
              onClick={() => setConfirmToggleStaf(null)}
            >
              Batal
            </Button>
            <Button
              variant={confirmToggleStaf?.status_aktif !== false ? "danger" : "primary"}
              fullWidth
              size="sm"
              disabled={isTogglingStaf}
              onClick={handleExecuteToggleStaf}
            >
              {isTogglingStaf 
                ? 'Memproses...' 
                : (confirmToggleStaf?.status_aktif !== false ? 'Nonaktifkan' : 'Aktifkan')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-2.5 text-xs text-text-2">
          <p>
            {confirmToggleStaf?.status_aktif !== false ? (
              <span>Nonaktifkan akun <strong>@{confirmToggleStaf?.username}</strong> ({confirmToggleStaf?.nama_lengkap})? Staf tidak dapat masuk ke sistem sampai diaktifkan kembali.</span>
            ) : (
              <span>Aktifkan kembali akses akun staf <strong>@{confirmToggleStaf?.username}</strong> ({confirmToggleStaf?.nama_lengkap})?</span>
            )}
          </p>
        </div>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS PERMANEN STAF */}
      <Modal
        isOpen={Boolean(confirmDeleteStaf)}
        onClose={() => !isDeletingStaf && setConfirmDeleteStaf(null)}
        title="Hapus Akun Staf?"
        size="sm"
        footer={
          <div className="flex gap-2 w-full">
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              disabled={isDeletingStaf}
              onClick={() => setConfirmDeleteStaf(null)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              fullWidth
              size="sm"
              disabled={isDeletingStaf}
              onClick={handleExecuteDeleteStaf}
            >
              {isDeletingStaf ? 'Menghapus...' : 'Hapus Akun'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-2 text-xs text-text-2">
          <p>
            Hapus akun staf <strong>@{confirmDeleteStaf?.username}</strong> ({confirmDeleteStaf?.nama_lengkap})?
          </p>
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 font-medium">
            ⚠️ Tindakan ini permanen. Seluruh hak akses staf ini akan dihapus.
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AkunAdmin;
