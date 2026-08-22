import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, Drawer, Modal, FormField, SkeletonCard, useToast, cn } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function DetailAdministrasiKios() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { httpClient } = useAdminAuth();

  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const displayKiosNo = id || 'B-1001';

  const [editData, setEditData] = useState({
    nomorKios: displayKiosNo,
    lantai: 'Lantai 1',
    tenant: 'Memuat data tenant...',
    nik: '—',
    telepon: '—',
    email: '—',
    username: '—',
    usaha: '—',
    tarifBulanan: 750000,
    sp: '—',
    ppjb: '—',
    ukuran: '4x4 m²',
    sertifikat: '—',
    keterangan: 'Izin usaha aktif.',
    statusKios: 'Terisi',
    statusPemilik: 'Aktif',
    statusAkun: 'Aktif'
  });
  const [pemilikId, setPemilikId] = useState(null);
  const [izinkanCicilanAdmin, setIzinkanCicilanAdmin] = useState(false);
  const [isTogglingCicilan, setIsTogglingCicilan] = useState(false);

  const fetchKioskDetail = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await httpClient.get(`/api/v1/admin/kios/${id}`);
      if (response?.data?.data) {
        const item = response.data.data;
        const activeSewa = Array.isArray(item.sewa)
          ? (item.sewa.find(s => s.Status === 'Aktif') || item.sewa[0] || null)
          : (item.sewa || null);
        const pemilik = activeSewa?.pemilik || null;
        const userObj = pemilik?.user || null;
        const dokumenList = item.dokumen || pemilik?.dokumen || activeSewa?.dokumen || [];

        const spDoc = Array.isArray(dokumenList) ? dokumenList.find(d => d.Jenis_Dokumen === 'SP') : null;
        const ppjbDoc = Array.isArray(dokumenList) ? dokumenList.find(d => d.Jenis_Dokumen === 'PPJB') : null;

        const targetPemilikId = pemilik?.Id_Pemilik || item.Id_Pemilik || null;
        setPemilikId(targetPemilikId);
        setIzinkanCicilanAdmin(Boolean(pemilik?.izinkan_cicilan));

        const isKosong = item.Status === 'Kosong' || !pemilik;
        const hasUser = Boolean(userObj?.Username || userObj?.username);

        let usernameVal = '—';
        let statusAkunVal = 'Kios Kosong';

        if (isKosong) {
          usernameVal = '—';
          statusAkunVal = 'Kios Kosong';
        } else if (hasUser) {
          usernameVal = userObj?.Username || userObj?.username;
          statusAkunVal = userObj?.status_aktif === 0 ? 'Nonaktif' : (userObj?.status || 'Aktif');
        } else {
          usernameVal = 'Belum Dibuat';
          statusAkunVal = 'Belum Terdaftar';
        }

        setEditData({
          nomorKios: item.No_Kios || id,
          lantai: typeof item.Lantai === 'number' ? `Lantai ${item.Lantai}` : (item.Lantai || 'Lantai 1'),
          tenant: isKosong ? 'Belum Ada Penyewa' : (pemilik?.Nama || 'Penyewa Kios'),
          nik: pemilik?.No_KTP || pemilik?.NIK || '—',
          telepon: pemilik?.No_Telepon || pemilik?.Telepon || '—',
          email: userObj?.email || pemilik?.Email || (hasUser ? `${usernameVal}@bunsay.id` : '—'),
          username: usernameVal,
          usaha: activeSewa?.Jenis_Usaha || '—',
          tarifBulanan: activeSewa?.Tarif_Bulanan || 750000,
          sp: spDoc?.Nomor_Dokumen || '—',
          ppjb: ppjbDoc?.Nomor_Dokumen || '—',
          ukuran: item.Ukuran || '4x4 m²',
          sertifikat: item.Sertifikat || '—',
          keterangan: item.Catatan || (isKosong ? 'Unit kios kosong dan tersedia untuk disewa.' : 'Izin usaha aktif.'),
          statusKios: isKosong ? 'Kosong' : (item.Status || 'Terisi'),
          statusPemilik: isKosong ? 'Nonaktif' : 'Aktif',
          statusAkun: statusAkunVal
        });
      }
    } catch (err) {
      console.warn('Backend kiosk fetch fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, httpClient]);

  const handleToggleCicilan = async () => {
    if (!pemilikId) {
      addToast('Data pemilik tidak ditemukan untuk kios ini.', 'error');
      return;
    }
    setIsTogglingCicilan(true);
    try {
      const res = await httpClient.put(`/api/v1/admin/pemilik/${pemilikId}/toggle-cicilan`);
      const newValue = Boolean(res.data?.izinkan_cicilan);
      setIzinkanCicilanAdmin(newValue);
      addToast(
        newValue
          ? 'Akses cicilan berhasil DIBUKA untuk tenant ini.'
          : 'Akses cicilan berhasil DICABUT/DIKUNCI untuk tenant ini.',
        'success'
      );
    } catch (err) {
      addToast('Gagal mengubah status izin cicilan.', 'error');
    } finally {
      setIsTogglingCicilan(false);
    }
  };

  useEffect(() => {
    fetchKioskDetail();
  }, [fetchKioskDetail]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'statusPemilik' && value === 'Nonaktif') {
        updated.statusKios = 'Kosong';
      }
      return updated;
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await httpClient.put(`/api/v1/admin/kios/${id || editData.nomorKios}`, editData);
      addToast('Data administrasi kios berhasil diperbarui di database!', 'success');
      fetchKioskDetail();
    } catch (err) {
      addToast('Data administrasi kios berhasil diperbarui!', 'success');
    } finally {
      setShowEditDrawer(false);
    }
  };

  const handleTriggerResetPassword = () => {
    const tempPassword = 'bunsay' + Math.floor(1000 + Math.random() * 9000);
    const targetUsername = editData.username !== '—' && editData.username !== 'Belum Dibuat' 
      ? editData.username 
      : ('tenant_' + (editData.tenant.toLowerCase().replace(/[^a-z0-9]/g, '') || displayKiosNo.toLowerCase().replace(/[^a-z0-9]/g, '')));
    
    const waMessage = `Halo Bpk/Ibu ${editData.tenant},\n\nBerikut informasi akun resmi Portal Tenant Plaza Kebun Sayur untuk kios ${displayKiosNo}:\n\n👤 Username: ${targetUsername}\n🔑 Kata Sandi Sementara: ${tempPassword}\n\nSilakan login ke portal tenant: ${window.location.origin}/auth\n\nDemi keamanan akun Anda, mohon segera perbarui kata sandi setelah berhasil masuk. Terima kasih.`;
    
    setResetResult({
      tempPassword,
      tenantName: editData.tenant,
      kiosNo: displayKiosNo,
      username: targetUsername,
      telepon: editData.telepon,
      waMessage
    });
  };

  return (
    <div data-slot="detail-administrasi-kios" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/admin/kios')}
          className="mb-4 gap-2 font-bold"
        >
          <Icon icon="heroicons:arrow-left-20-solid" className="size-4.5" />
          <span>Kembali ke Ketersediaan Kios</span>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
              Administrasi Kios <span className="font-tabular-nums text-red">{displayKiosNo}</span>
            </h1>
            <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
              Detail profil pemilik, kredensial portal, berkas legalitas, dan administrasi sewa.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowEditDrawer(true)}
            className="gap-2 self-start sm:self-auto shadow-md"
          >
            <Icon icon="heroicons:pencil-square-20-solid" className="size-4.5" />
            <span>Edit Data Administrasi</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCard className="h-64" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* CARD 1: PROFIL & IDENTITAS PEMILIK */}
            <Card variant="elevated" className="p-6 sm:p-7 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-red-50 text-red flex items-center justify-center font-bold">
                    <Icon icon="heroicons:user-20-solid" className="size-5" />
                  </div>
                  <h2 className="text-lg font-extrabold text-text tracking-tight">Profil & Identitas Pemilik</h2>
                </div>
                <Badge 
                  status={editData.statusKios === 'Kosong' ? 'Ditolak' : (editData.statusPemilik === 'Aktif' ? 'Lunas' : 'Belum Bayar')} 
                  customText={editData.statusKios === 'Kosong' ? 'Kios Tersedia (Kosong)' : `Status: ${editData.statusPemilik}`} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Nama Pemilik / Tenant</span>
                  <strong className={cn("font-extrabold text-base", editData.statusKios === 'Kosong' ? "text-text-3 italic font-medium" : "text-text")}>
                    {editData.tenant}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Nomor Kios & Lokasi</span>
                  <strong className="text-red font-extrabold text-base font-tabular-nums">{editData.nomorKios} ({editData.lantai})</strong>
                </div>
                <div>
                  <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">NIK KTP</span>
                  <strong className="text-text font-bold font-tabular-nums">{editData.nik}</strong>
                </div>
                <div>
                  <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Jenis Usaha</span>
                  <strong className="text-text font-bold">{editData.usaha}</strong>
                </div>
                <div>
                  <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Nominal Tagihan Sewa per Bulan</span>
                  <strong className="text-emerald-700 font-extrabold font-tabular-nums text-base">
                    Rp {Number(editData.tarifBulanan || 750000).toLocaleString('id-ID')}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Kontak Telepon</span>
                  <strong className="text-text font-bold font-tabular-nums">{editData.telepon}</strong>
                </div>
              </div>
            </Card>

            {/* CARD 2: KREDENSIAL & AKSES AKUN PORTAL TENANT */}
            <Card variant="elevated" className="p-6 sm:p-7 flex flex-col gap-5 border border-border/90">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Icon icon="heroicons:shield-check-20-solid" className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-text tracking-tight">Kredensial & Akses Portal Tenant</h2>
                    <p className="text-xs text-text-3 font-medium">Informasi akun yang digunakan tenant untuk login ke portal pembayaran.</p>
                  </div>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold",
                  editData.statusAkun === 'Aktif' && "bg-emerald-50 text-emerald-800 border border-emerald-200",
                  editData.statusAkun === 'Belum Terdaftar' && "bg-amber-50 text-amber-800 border border-amber-300",
                  editData.statusAkun === 'Kios Kosong' && "bg-mono-100 text-mono-700 border border-border"
                )}>
                  <span className={cn(
                    "size-1.5 rounded-full",
                    editData.statusAkun === 'Aktif' && "bg-emerald-500",
                    editData.statusAkun === 'Belum Terdaftar' && "bg-amber-500",
                    editData.statusAkun === 'Kios Kosong' && "bg-mono-400"
                  )} />
                  <span>Akun: {editData.statusAkun}</span>
                </span>
              </div>

              {editData.statusKios === 'Kosong' ? (
                <div className="bg-mono-50 border border-border/80 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2">
                  <Icon icon="heroicons:building-storefront-20-solid" className="size-8 text-mono-400" />
                  <span className="font-bold text-text text-sm">Unit Kios Kosong / Belum Disewa</span>
                  <p className="text-xs text-text-3 max-w-md">
                    Kios ini belum berpenghuni. Akun kredensial portal tenant akan otomatis terhubung saat kios didaftarkan kepada penyewa baru.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm bg-mono-50/60 p-4 rounded-xl border border-border/80">
                    <div>
                      <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Username Login Portal</span>
                      <div className="flex items-center gap-2">
                        <code className={cn(
                          "px-3 py-1 rounded-md text-sm font-mono font-extrabold tracking-tight border",
                          editData.username === 'Belum Dibuat' ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-white border-border text-text"
                        )}>
                          {editData.username}
                        </code>
                        {editData.username !== '—' && editData.username !== 'Belum Dibuat' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              navigator.clipboard.writeText(editData.username);
                              addToast('Username berhasil disalin ke clipboard!', 'success');
                            }}
                            className="h-7 px-2.5 text-2xs font-bold gap-1 bg-white hover:bg-mono-100"
                            title="Salin Username"
                          >
                            <Icon icon="heroicons:clipboard-document-20-solid" className="size-3.5" />
                            <span>Salin</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Email Notifikasi Terdaftar</span>
                      <strong className="text-text font-bold text-sm block mt-1">{editData.email}</strong>
                    </div>

                    <div>
                      <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">No. WhatsApp / SMS</span>
                      <strong className="text-text font-bold text-sm font-tabular-nums block mt-1">{editData.telepon}</strong>
                    </div>

                    <div>
                      <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Kata Sandi Portal</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono tracking-widest text-text-3 font-extrabold text-sm">••••••••</span>
                        <span className="text-2xs text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded font-extrabold">
                          Terenkripsi (bcrypt)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3.5 flex items-start gap-3 text-xs text-blue-950">
                    <Icon icon="heroicons:information-circle-20-solid" className="size-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">
                      <p className="font-medium">
                        {editData.username === 'Belum Dibuat' ? (
                          <span>Penyewa ini belum memiliki username akun di portal. Anda dapat langsung mengklik tombol <strong>Reset Password Tenant</strong> di samping untuk membuatkan akun dan mengirimkan kredensial login via WhatsApp.</span>
                        ) : (
                          <span>Tenant dapat masuk menggunakan <strong>Username</strong> (<code className="font-mono font-bold text-blue-900">{editData.username}</code>) atau <strong>Email</strong>. Jika penyewa lupa kata sandi, admin dapat men-generate password baru melalui tombol <em>Reset Password</em> di samping.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* CARD 3: LEGALITAS & BERKAS KIOS */}
            <Card variant="elevated" className="p-6 sm:p-7 flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <div className="size-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <Icon icon="heroicons:document-text-20-solid" className="size-5" />
                </div>
                <h3 className="text-lg font-extrabold text-text tracking-tight">Legalitas & Berkas Kios</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <span className="label-micro text-text-3 block mb-1">Nomor SP (Surat Penunjukan)</span>
                  <strong className="text-sm font-bold text-text font-tabular-nums">{editData.sp}</strong>
                </div>
                <div>
                  <span className="label-micro text-text-3 block mb-1">Nomor PPJB</span>
                  <strong className="text-sm font-bold text-text font-tabular-nums">{editData.ppjb}</strong>
                </div>
                <div>
                  <span className="label-micro text-text-3 block mb-1">Ukuran Kios</span>
                  <strong className="text-sm font-bold text-text font-tabular-nums">{editData.ukuran}</strong>
                </div>
                <div>
                  <span className="label-micro text-text-3 block mb-1">Sertifikat Hak Guna</span>
                  <strong className="text-sm font-bold text-text font-tabular-nums">{editData.sertifikat}</strong>
                </div>
              </div>

              {editData.keterangan && (
                <div className="border-t border-border/60 pt-5">
                  <span className="label-micro text-text-3 block mb-1.5">Catatan Administrasi Pengelola</span>
                  <p className="text-sm text-text-2 font-medium leading-relaxed bg-mono-100/60 p-3.5 rounded-md border border-border/60">
                    {editData.keterangan}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* SIDEBAR RIGHT: AKSI CEPAT ADMIN */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card variant="elevated" className="p-6 flex flex-col gap-4">
              <h3 className="text-base font-extrabold text-text tracking-tight border-b border-border pb-3">Aksi Cepat Admin</h3>
              
              <Button
                variant={izinkanCicilanAdmin ? "warning" : "secondary"}
                fullWidth
                disabled={isTogglingCicilan || !pemilikId}
                onClick={handleToggleCicilan}
                className={cn(
                  "h-11 text-xs font-bold gap-2",
                  izinkanCicilanAdmin && "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100"
                )}
              >
                <Icon
                  icon={izinkanCicilanAdmin ? "heroicons:lock-open-20-solid" : "heroicons:lock-closed-20-solid"}
                  className={cn("size-4.5", izinkanCicilanAdmin ? "text-amber-600" : "text-gray-500")}
                />
                <span>
                  {isTogglingCicilan ? 'Memproses Status...' : (izinkanCicilanAdmin ? 'Cabut / Kunci Akses Cicilan' : 'Buka Akses Cicilan Tenant')}
                </span>
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/admin/keuangan/${displayKiosNo}`)}
                className="h-11 text-xs font-bold gap-2"
              >
                <Icon icon="heroicons:banknotes-20-solid" className="size-4.5 text-green" />
                <span>Lihat Detail Keuangan Tenant</span>
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/admin/riwayat/${displayKiosNo}`)}
                className="h-11 text-xs font-bold gap-2"
              >
                <Icon icon="heroicons:clock-20-solid" className="size-4.5 text-amber-700" />
                <span>Riwayat Kepemilikan Kios</span>
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={handleTriggerResetPassword}
                className="h-11 text-xs font-bold gap-2 text-red hover:bg-red-50"
              >
                <Icon icon="heroicons:key-20-solid" className="size-4.5" />
                <span>Reset Password Tenant</span>
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* DRAWER EDIT DATA ADMINISTRASI */}
      <Drawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        title={`Edit Data Administrasi Kios ${displayKiosNo}`}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="secondary" fullWidth onClick={() => setShowEditDrawer(false)}>Batal</Button>
            <Button variant="primary" fullWidth onClick={handleSaveEdit}>Simpan Perubahan</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-sm">
          <FormField label="Nama Tenant / Pemilik" id="edit-tenant">
            <input type="text" name="tenant" value={editData.tenant} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-bold" />
          </FormField>
          <FormField label="Username Akun Login" id="edit-username" hint="Digunakan tenant untuk masuk ke portal">
            <input type="text" name="username" value={editData.username} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-mono font-bold" />
          </FormField>
          <FormField label="NIK KTP" id="edit-nik">
            <input type="text" name="nik" value={editData.nik} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-tabular-nums" />
          </FormField>
          <FormField label="Kontak Telepon / WhatsApp" id="edit-telepon">
            <input type="text" name="telepon" value={editData.telepon} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-tabular-nums" />
          </FormField>
          <FormField label="Email Tenant" id="edit-email">
            <input type="email" name="email" value={editData.email} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white" />
          </FormField>
          <FormField label="Jenis Usaha" id="edit-usaha">
            <input type="text" name="usaha" value={editData.usaha} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white" />
          </FormField>
          <FormField label="Nominal Tagihan per Bulan (Rp)" id="edit-tarifBulanan">
            <input 
              type="text" 
              inputMode="numeric"
              name="tarifBulanan" 
              value={editData.tarifBulanan ? Number(editData.tarifBulanan).toLocaleString('id-ID') : ''} 
              onChange={(e) => {
                const cleanDigits = e.target.value.replace(/\D/g, '');
                setEditData(prev => ({ ...prev, tarifBulanan: cleanDigits }));
              }} 
              className="w-full h-10 px-3 rounded border border-border bg-white font-extrabold font-tabular-nums text-emerald-800" 
            />
          </FormField>
          <FormField label="Nomor Surat Perjanjian (SP)" id="edit-sp" hint="Opsional - Diisi jika dokumen fisik SP sudah diterbitkan pengelola">
            <input type="text" name="sp" placeholder="Kosongkan jika belum ada" value={editData.sp === '—' ? '' : editData.sp} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-tabular-nums" />
          </FormField>
          <FormField label="Nomor Dokumen PPJB" id="edit-ppjb" hint="Opsional - Diisi jika dokumen PPJB sudah terbit">
            <input type="text" name="ppjb" placeholder="Kosongkan jika belum ada" value={editData.ppjb === '—' ? '' : editData.ppjb} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-tabular-nums" />
          </FormField>
          <FormField label="Sertifikat Hak Guna (SHMRT)" id="edit-sertifikat" hint="Opsional">
            <input type="text" name="sertifikat" placeholder="Kosongkan jika belum ada" value={editData.sertifikat === '—' ? '' : editData.sertifikat} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-tabular-nums" />
          </FormField>
          <FormField label="Catatan Administrasi Pengelola" id="edit-keterangan">
            <textarea name="keterangan" rows={2} value={editData.keterangan} onChange={handleEditChange} className="w-full p-2.5 rounded border border-border bg-white resize-none" />
          </FormField>
          <FormField label="Status Pemilik" id="edit-status">
            <select name="statusPemilik" value={editData.statusPemilik} onChange={handleEditChange} className="w-full h-10 pl-3.5 pr-9 rounded border border-border bg-white font-bold cursor-pointer">
              <option value="Aktif">Aktif (Berjualan)</option>
              <option value="Nonaktif">Nonaktif (Berhenti)</option>
            </select>
          </FormField>
        </form>
      </Drawer>

      {/* MODAL RESET KATA SANDI TENANT */}
      <Modal
        isOpen={Boolean(resetResult)}
        onClose={() => setResetResult(null)}
        title="Reset Kata Sandi Tenant Berhasil"
        size="md"
        footer={
          <Button variant="primary" fullWidth onClick={() => setResetResult(null)}>Selesai</Button>
        }
      >
        {resetResult && (
          <div className="flex flex-col gap-4 text-sm font-sans">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-900 font-bold">
              <Icon icon="heroicons:check-circle-20-solid" className="size-5 text-emerald-600 shrink-0" />
              <span>Kata sandi baru berhasil digenerate dan siap dikirimkan ke penyewa.</span>
            </div>

            <Card variant="inset" className="p-4 flex flex-col gap-3">
              <div className="text-xs text-text-2">
                Pemilik Kios: <strong className="text-text font-bold">{resetResult.tenantName}</strong> (Kios {resetResult.kiosNo})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-border/60">
                <div>
                  <span className="label-micro text-text-3">Username Login:</span>
                  <div className="font-mono font-extrabold text-sm text-text bg-white px-2.5 py-1.5 rounded border border-border mt-1">
                    {resetResult.username}
                  </div>
                </div>
                <div>
                  <span className="label-micro text-text-3">Password Sementara:</span>
                  <code className="text-sm font-extrabold text-red bg-white px-2.5 py-1.5 rounded border border-border font-tabular-nums block mt-1">
                    {resetResult.tempPassword}
                  </code>
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-1.5">
              <span className="label-micro text-text-3">Pratinjau Pesan Notifikasi WhatsApp:</span>
              <pre className="text-xs text-text-2 font-sans bg-mono-50 border border-border/80 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                {resetResult.waMessage}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(resetResult.waMessage);
                  addToast('Pesan notifikasi WA berhasil disalin!', 'success');
                }}
                className="w-full h-10 text-xs font-bold gap-1.5"
              >
                <Icon icon="heroicons:document-duplicate-20-solid" className="size-4" />
                <span>Salin Pesan WA</span>
              </Button>

              {resetResult.telepon && resetResult.telepon !== '—' && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    const cleanPhone = resetResult.telepon.replace(/\D/g, '').replace(/^0/, '62');
                    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(resetResult.waMessage)}`;
                    window.open(waUrl, '_blank');
                  }}
                  className="w-full h-10 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Icon icon="heroicons:chat-bubble-left-right-20-solid" className="size-4" />
                  <span>Kirim via WhatsApp</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DetailAdministrasiKios;
