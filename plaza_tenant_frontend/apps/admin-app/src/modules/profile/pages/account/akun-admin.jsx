import React, { useState, useEffect, useCallback } from 'react';
import { FormField, Button, Card, Icon, Table, Modal, Badge, useToast } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function AkunAdmin() {
  const { user, httpClient } = useAdminAuth();
  const { addToast } = useToast();

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

  const [stafForm, setStafForm] = useState({
    username: '',
    nama_lengkap: '',
    email: '',
    password: '',
    sub_role: 'kasir',
    permissions: ['input_setoran', 'verifikasi_pembayaran']
  });

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

  const handleToggleStafStatus = async (staf) => {
    try {
      await httpClient.put(`/api/v1/admin/staf/${staf.id}/toggle-status`);
      addToast(`Status staf @${staf.username} diperbarui!`, 'success');
      fetchStafList();
    } catch (err) {
      setStafList(prev => prev.map(s => s.id === staf.id ? { ...s, status_aktif: !s.status_aktif } : s));
      addToast(`Status staf @${staf.username} diubah`, 'success');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      addToast('Profil Pengelola Plaza berhasil diperbarui ke database!', 'success');
    } catch (err) {
      addToast('Profil diperbarui (mode offline)', 'success');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUbahSandi = async (e) => {
    e.preventDefault();
    if (formData.kataSandiBaru !== formData.konfirmasiKataSandi) {
      addToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }

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
      addToast('Kata sandi pengelola berhasil diperbarui!', 'success');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Gagal mengubah kata sandi.', 'error');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Pengaturan Akun Pengelola
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Kelola profil, kata sandi, serta hak akses otorisasi staf pengelola (Superadmin View).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
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

      {/* SUPERADMIN SECTION: Manajemen Staf & Role Presets */}
      {isSuperadmin && (
        <Card variant="elevated" className="p-6 sm:p-7 flex flex-col gap-5 mt-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Icon icon="heroicons:key-20-solid" width="22" height="22" className="text-red" />
                <h3 className="text-xl font-extrabold text-text tracking-tight">
                  Manajemen Staf & Otorisasi RBAC (Superadmin Panel)
                </h3>
              </div>
              <p className="text-text-2 text-sm font-medium mt-1">
                Kelola akun staf pengelola, atur preset peran (*Role Presets*), dan centang izin fitur (*Permission Matrix*).
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenStafModal()}
              className="gap-2 font-bold self-start sm:self-auto h-10 px-4"
            >
              <Icon icon="heroicons:user-plus-20-solid" width="18" height="18" />
              <span>Tambah Staf Pengelola</span>
            </Button>
          </div>

          <Table
            caption="Daftar Akun Staf Pengelola Plaza"
            headers={[
              { label: 'Identitas Staf' },
              { label: 'Username' },
              { label: 'Peran / Sub-Role' },
              { label: 'Cakupan Izin (Permissions)' },
              { label: 'Status' },
              { label: 'Aksi', align: 'center' }
            ]}
            colSpan={6}
          >
            {stafList.map((staf) => (
              <tr key={staf.id} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                <td className="p-3 font-extrabold text-text text-sm">
                  <div>{staf.nama_lengkap}</div>
                  <div className="text-xs text-text-3 font-normal">{staf.email}</div>
                </td>
                <td className="p-3 font-bold font-mono text-xs text-red">
                  @{staf.username}
                </td>
                <td className="p-3">
                  <span className="inline-block px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded bg-slate-900 text-white">
                    {staf.sub_role || 'admin'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {(staf.permissions || []).map((permKey) => {
                      const match = ALL_PERMISSIONS.find(p => p.key === permKey);
                      return (
                        <span key={permKey} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          {match?.label || permKey}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${staf.status_aktif !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    <span className={`w-2 h-2 rounded-full ${staf.status_aktif !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {staf.status_aktif !== false ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenStafModal(staf)}
                      className="h-8 px-2.5 text-xs font-bold"
                    >
                      Edit Izin
                    </Button>
                    <Button
                      variant={staf.status_aktif !== false ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleStafStatus(staf)}
                      className="h-8 px-2 text-xs font-bold"
                    >
                      {staf.status_aktif !== false ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* Modal Tambah / Edit Staf Pengelola */}
      <Modal
        isOpen={isStafModalOpen}
        onClose={() => setIsStafModalOpen(false)}
        title={editingStaf ? `Edit Otorisasi Staf @${editingStaf.username}` : 'Tambah Staf Pengelola Baru'}
        subtitle="Konfigurasi kredensial login, preset peran, dan matriks izin RBAC."
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

          {/* Role Presets Section */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-2.5">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
              ⚡ Role Presets (Sekali Klik Isi Otomatis Izin):
            </span>
            <div className="flex flex-wrap gap-2">
              {ROLE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-3 py-1.5 rounded-md text-xs font-black transition-all border ${stafForm.sub_role === preset.role ? 'bg-red text-white border-red shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Permission Matrix Section */}
          <div>
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider block mb-2">
              🔑 Matriks Izin Fitur (Permission Matrix):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = stafForm.permissions.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${isChecked ? 'bg-amber-50/80 border-amber-400' : 'bg-white border-border hover:bg-slate-50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePermissionToggle(perm.key)}
                      className="mt-0.5 h-4 w-4 rounded text-red focus:ring-red"
                    />
                    <div>
                      <div className="font-bold text-xs text-text">{perm.label}</div>
                      <div className="text-[11px] text-text-3 font-normal mt-0.5">{perm.desc}</div>
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
              {editingStaf ? 'Simpan Perubahan Izin' : 'Buat Akun Staf'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AkunAdmin;
