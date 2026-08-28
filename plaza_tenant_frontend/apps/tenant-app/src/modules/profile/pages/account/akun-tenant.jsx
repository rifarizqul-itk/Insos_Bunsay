import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FormField, Button, Card, Icon, Badge, useToast, cn } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../../public/useTenantAuth';

const VALID_TLDS = ['com', 'id', 'co.id', 'net', 'org', 'ac.id', 'go.id', 'sch.id', 'or.id', 'biz.id', 'my.id', 'web.id', 'gov.id', 'edu'];

function validateOfficialEmail(email) {
  if (!email || !email.trim()) return null;
  const trimmed = email.trim().toLowerCase();
  const baseRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.([a-zA-Z]{2,}))$/;
  const match = trimmed.match(baseRegex);
  if (!match) {
    return 'Format alamat email tidak valid (contoh: nama@gmail.com).';
  }
  const fullDomain = match[1];
  const isValid = VALID_TLDS.some(tld => fullDomain === tld || fullDomain.endsWith('.' + tld));
  if (!isValid || fullDomain.endsWith('.cm') || fullDomain.endsWith('.cmo') || fullDomain.endsWith('.con') || fullDomain.endsWith('.coom')) {
    return 'Ekstensi domain email tidak resmi. Gunakan domain resmi (.com, .co.id, .id, .net, .org, .ac.id, dll).';
  }
  return null;
}

function AkunTenant() {
  const { user, httpClient, logout } = useTenantAuth();
  const { addToast } = useToast();
  const firstInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const [adminDetail, setAdminDetail] = useState({
    nama: user?.name || user?.Username || 'Tenant Aktif',
    nik: '—',
    kios: '—',
    email: '—',
    telepon: '—',
    alamat: '—',
    jenisUsaha: '—',
    tarifBulanan: 750000,
    lantai: 'Lantai 1',
    ukuran: '4x4 m²',
    sp: '—',
    ppjb: '—',
    sertifikat: '—',
    catatan: 'Izin usaha aktif.',
    izinkanCicilan: false,
    tanggalMulai: '—',
    tanggalSelesai: '—'
  });

  const [fieldError, setFieldError] = useState(null);
  const [oldPasswordError, setOldPasswordError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...adminDetail });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    kataSandiLama: '',
    kataSandiBaru: '',
    konfirmasiKataSandi: ''
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchTenantProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await httpClient.get('/api/v1/tenant/dashboard');
      if (res?.data) {
        const d = res.data;
        const cleanEmail = (d.email && d.email !== d.Username && !d.email.startsWith('tenant_')) 
          ? d.email 
          : (user?.email && !user?.email.startsWith('tenant_') ? user.email : '');

        const mapped = {
          nama: d.nama || user?.name || user?.Username || 'Tenant Aktif',
          nik: d.nik || '—',
          kios: d.kios || '—',
          email: cleanEmail,
          telepon: d.telepon || '—',
          alamat: d.alamat || 'Plaza Kebun Sayur',
          jenisUsaha: d.siklusSewa?.jenisUsaha || 'Perdagangan Umum',
          tarifBulanan: d.siklusSewa?.tarifBulanan || 750000,
          lantai: d.detailAdministrasi?.lantai || 'Lantai 1',
          ukuran: d.detailAdministrasi?.ukuran || '4x4 m²',
          sp: d.detailAdministrasi?.sp || '—',
          ppjb: d.detailAdministrasi?.ppjb || '—',
          sertifikat: d.detailAdministrasi?.sertifikat || '—',
          catatan: d.detailAdministrasi?.catatan || 'Izin usaha aktif.',
          izinkanCicilan: Boolean(d.izinkanCicilan),
          tanggalMulai: d.siklusSewa?.tanggalMulai || '—',
          tanggalSelesai: d.siklusSewa?.tanggalSelesai || '—'
        };
        setAdminDetail(mapped);
        setFormData(mapped);
      }
    } catch (err) {
      console.warn('Fallback to local auth user info:', err);
    } finally {
      setIsLoading(false);
    }
  }, [httpClient, user]);

  useEffect(() => {
    fetchTenantProfileData();
  }, [fetchTenantProfileData]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (name === 'kataSandiLama' && oldPasswordError) setOldPasswordError(null);
    if (name === 'kataSandiBaru' && passwordError) setPasswordError(null);
    if (name === 'konfirmasiKataSandi' && confirmPasswordError) setConfirmPasswordError(null);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setOldPasswordError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    let hasError = false;
    if (!passwordData.kataSandiLama) {
      setOldPasswordError('Kata sandi saat ini wajib diisi.');
      addToast('Kata sandi saat ini wajib diisi.', 'error');
      hasError = true;
    }
    if (!passwordData.kataSandiBaru || passwordData.kataSandiBaru.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      addToast('Kata sandi baru minimal 6 karakter.', 'error');
      hasError = true;
    }
    if (passwordData.kataSandiBaru !== passwordData.konfirmasiKataSandi) {
      setConfirmPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      addToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      hasError = true;
    }
    if (hasError) return;

    setIsChangingPassword(true);
    try {
      await httpClient.put('/api/v1/tenant/auth/change-password', {
        kataSandiLama: passwordData.kataSandiLama,
        kataSandiBaru: passwordData.kataSandiBaru,
      });
      setPasswordData({
        kataSandiLama: '',
        kataSandiBaru: '',
        konfirmasiKataSandi: ''
      });
      addToast('Kata sandi akun tenant berhasil diperbarui!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal mengubah kata sandi.';
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
      setIsChangingPassword(false);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldError && fieldError.field === name) {
      setFieldError(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.nama.trim()) {
      setFieldError({ field: 'nama', message: 'Nama lengkap wajib diisi.' });
      addToast('Nama lengkap wajib diisi.', 'error');
      return;
    }

    if (formData.email && formData.email.trim().length > 0) {
      const emailErrorMsg = validateOfficialEmail(formData.email);
      if (emailErrorMsg) {
        setFieldError({ field: 'email', message: emailErrorMsg });
        addToast(emailErrorMsg, 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await httpClient.put('/api/v1/tenant/auth/profile', {
        Nama: formData.nama.trim(),
        No_Telepon: formData.telepon?.trim(),
        Email: formData.email?.trim(),
        Alamat: formData.alamat?.trim()
      });
      setAdminDetail(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      setFieldError(null);
      addToast('Data profil berhasil diperbarui!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal memperbarui data profil.';
      addToast(msg, 'error');
      if (msg.toLowerCase().includes('email')) {
        setFieldError({ field: 'email', message: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!adminDetail) return null;

  return (
    <div data-slot="akun-tenant" className="page-fade-in flex flex-col gap-6 sm:gap-7 font-sans max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-text tracking-tight text-balance">
          Pengaturan Akun &amp; Kios
        </h1>
      </div>

      <div className="akun-layout-grid mobile-stack grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card variant="elevated" className="p-6 sm:p-7 flex flex-col gap-6 rounded-3xl bg-white border border-border/80 shadow-card">
            <div className="flex items-center gap-2.5 border-b border-border/70 pb-3.5">
              <div className="size-9 rounded-xl bg-red-50 text-red border border-red/20 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                <Icon icon="heroicons:user-circle-20-solid" className="size-5" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-text tracking-tight text-balance">
                Detail Profil Pemilik Kios
              </h3>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <FormField label="Nama Lengkap" id="profile-nama" required error={fieldError?.field === 'nama' ? fieldError.message : undefined}>
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    aria-readonly={!isEditing}
                    autoComplete="name"
                    className={cn(
                      'w-full h-11 rounded-md border px-3.5 text-base font-semibold transition-colors',
                      isEditing ? 'bg-white border-border focus:ring-2 focus:ring-red' : 'bg-warm-gray/50 border-border/80 text-text',
                      fieldError?.field === 'nama' && 'border-red ring-1 ring-red'
                    )}
                  />
                </FormField>

                <FormField label="NIK (KTP Tenant)" id="profile-nik">
                  <input 
                    type="text" 
                    name="nik" 
                    value={formData.nik} 
                    readOnly 
                    aria-readonly="true" 
                    className="w-full h-11 rounded-md border border-border/80 bg-warm-gray/50 px-3.5 text-base font-extrabold font-tabular-nums text-text-2" 
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Email" id="profile-email" error={fieldError?.field === 'email' ? fieldError.message : undefined}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    aria-readonly={!isEditing}
                    autoComplete="email"
                    placeholder="contoh: nama@domain.com"
                    className={cn(
                      'w-full h-11 rounded-md border px-3.5 text-base font-medium transition-colors',
                      isEditing ? 'bg-white border-border focus:ring-2 focus:ring-red' : 'bg-warm-gray/50 border-border/80 text-text',
                      fieldError?.field === 'email' && 'border-red ring-1 ring-red'
                    )}
                  />
                </FormField>

                <FormField label="Telepon (WA)" id="profile-telepon" error={fieldError?.field === 'telepon' ? fieldError.message : undefined}>
                  <input
                    type="tel"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    aria-readonly={!isEditing}
                    autoComplete="tel"
                    className={cn(
                      'w-full h-10 rounded-lg border px-3 text-sm font-semibold font-tabular-nums transition-colors',
                      isEditing ? 'bg-white border-border focus:ring-2 focus:ring-red' : 'bg-warm-gray/50 border-border/80 text-text',
                      fieldError?.field === 'telepon' && 'border-red ring-1 ring-red'
                    )}
                  />
                </FormField>
              </div>

              <FormField label="Alamat Terdaftar" id="profile-alamat">
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  aria-readonly={!isEditing}
                  autoComplete="street-address"
                  rows={2}
                  className={`w-full rounded-lg border p-2.5 text-sm font-normal leading-relaxed resize-none transition-colors ${
                    isEditing ? 'bg-white border-border focus:ring-2 focus:ring-red' : 'bg-warm-gray/50 border-border/80 text-text'
                  }`}
                />
              </FormField>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-1">
                {isEditing ? (
                  <>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => { setFormData({ ...adminDetail }); setFieldError(null); setIsEditing(false); }}
                      className="w-full sm:w-auto min-h-9 text-xs"
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={isSubmitting}
                      className="w-full sm:w-auto min-h-9 text-xs"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleStartEdit}
                    className="gap-1.5 w-full sm:w-auto min-h-9 text-xs shadow-xs"
                  >
                    <Icon icon="heroicons:pencil-square-20-solid" className="size-4" />
                    <span>Ubah Data Kontak</span>
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* CARD DETAIL ADMINISTRASI & LEGALITAS KIOS UNTUK TENANT */}
          <Card variant="elevated" className="p-4 sm:p-5 flex flex-col gap-4 rounded-2xl bg-white border border-border/80 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/70 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center font-bold shrink-0">
                  <Icon icon="heroicons:building-storefront-20-solid" className="size-4.5" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-text text-balance">
                  Administrasi &amp; Legalitas Kios
                </h2>
              </div>
              {adminDetail.izinkanCicilan && (
                <Badge variant="warning">
                  Cicilan Diizinkan
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3.5">
              <div>
                <span className="text-[11px] font-semibold text-text-3 uppercase block mb-0.5">Nomor Kios</span>
                <strong className="text-base font-bold text-red font-tabular-nums">{adminDetail.kios}</strong>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-text-3 uppercase block mb-0.5">Lokasi &amp; Ukuran</span>
                <strong className="text-xs sm:text-sm font-semibold text-text">{adminDetail.lantai} ({adminDetail.ukuran})</strong>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-text-3 uppercase block mb-0.5">Tarif Retribusi Bulanan</span>
                <strong className="text-sm font-bold text-emerald-700 font-tabular-nums whitespace-nowrap">
                  Rp {Number(adminDetail.tarifBulanan || 750000).toLocaleString('id-ID')}
                </strong>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-text-3 uppercase block mb-0.5">Jenis Usaha Terdaftar</span>
                <strong className="text-xs sm:text-sm font-semibold text-text">{adminDetail.jenisUsaha}</strong>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-text-3 uppercase block mb-0.5">Surat Perjanjian (SP)</span>
                <strong className="text-xs sm:text-sm font-semibold text-text font-tabular-nums">{adminDetail.sp}</strong>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-text-3 uppercase block mb-0.5">Dokumen PPJB</span>
                <strong className="text-xs sm:text-sm font-semibold text-text font-tabular-nums">{adminDetail.ppjb}</strong>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-text-3 uppercase block mb-0.5">Sertifikat Hak Guna</span>
                <strong className="text-xs sm:text-sm font-semibold text-text font-tabular-nums">{adminDetail.sertifikat}</strong>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[11px] font-semibold text-text-3 uppercase block mb-0.5">Masa Berlaku Sewa Kios</span>
                <strong className="text-xs sm:text-sm font-bold text-text font-tabular-nums">
                  {adminDetail.tanggalMulai} s/d {adminDetail.tanggalSelesai}
                </strong>
              </div>
            </div>

            {adminDetail.catatan && (
              <div className="border-t border-border/60 pt-3">
                <span className="text-[11px] font-semibold text-text-3 uppercase block mb-1">Catatan Resmi Administrasi Pengelola</span>
                <p className="text-xs text-text-2 font-normal leading-relaxed bg-mono-100/60 p-2.5 rounded-lg border border-border/60">
                  {adminDetail.catatan}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <form onSubmit={handleSavePassword}>
            <Card variant="elevated" className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-border/80 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border/70 pb-3">
                <div className="size-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center font-bold shrink-0">
                  <Icon icon="heroicons:key-20-solid" className="size-4.5" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-text text-balance">
                  Ubah Kata Sandi
                </h2>
              </div>
              
              <FormField label="Kata Sandi Saat Ini" id="tenant-pwd-old" required error={oldPasswordError}>
                <div className="relative w-full">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    name="kataSandiLama"
                    placeholder="Masukkan kata sandi lama"
                    value={passwordData.kataSandiLama}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    className={cn(
                      'w-full h-11 rounded-md border bg-warm-gray/50 ps-3.5 pe-12 text-base focus:bg-white focus:outline-none transition-colors',
                      oldPasswordError ? 'border-red focus:border-red' : 'border-border focus:border-red'
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

              <FormField label="Kata Sandi Baru" id="tenant-pwd-new" required error={passwordError}>
                <div className="relative w-full">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="kataSandiBaru"
                    placeholder="Minimal 6 karakter"
                    value={passwordData.kataSandiBaru}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    className={cn(
                      'w-full h-11 rounded-md border bg-warm-gray/50 ps-3.5 pe-12 text-base focus:bg-white focus:outline-none transition-colors',
                      passwordError ? 'border-red focus:border-red' : 'border-border focus:border-red'
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

              <FormField label="Konfirmasi Kata Sandi Baru" id="tenant-pwd-confirm" required error={confirmPasswordError}>
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="konfirmasiKataSandi"
                    placeholder="Ulangi kata sandi baru"
                    value={passwordData.konfirmasiKataSandi}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    className={cn(
                      'w-full h-11 rounded-md border bg-warm-gray/50 ps-3.5 pe-12 text-base focus:bg-white focus:outline-none transition-colors',
                      confirmPasswordError ? 'border-red focus:border-red' : 'border-border focus:border-red'
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
                fullWidth
                disabled={isChangingPassword}
                className="mt-1 h-11 text-sm font-extrabold shadow-sm"
              >
                {isChangingPassword ? 'Menyimpan...' : 'Simpan Kata Sandi'}
              </Button>
            </Card>
          </form>

          <Card variant="elevated" className="flex flex-col gap-4 p-6">
            <h2 className="text-base font-extrabold text-text tracking-tight border-b border-border pb-3 text-balance">
              Keluar Akun
            </h2>
            <p className="text-sm text-text-2 font-medium leading-relaxed text-pretty">
              Akhiri sesi masuk Anda di perangkat ini.
            </p>
            <Button
              type="button"
              variant="danger"
              fullWidth
              className="h-11 text-sm font-bold gap-2"
              onClick={() => { logout(); addToast('Berhasil keluar', 'info'); }}
            >
              <Icon icon="heroicons:arrow-right-on-rectangle-20-solid" width="18" height="18" />
              <span>Keluar</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AkunTenant;
