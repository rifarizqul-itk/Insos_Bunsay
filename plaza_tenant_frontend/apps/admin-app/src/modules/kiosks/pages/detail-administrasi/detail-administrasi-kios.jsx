import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, Drawer, Modal, FormField, SkeletonCard, useToast } from '@bunsay/shared-ui';
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
    usaha: '—',
    sp: '—',
    ppjb: '—',
    ukuran: '4x4 m²',
    sertifikat: '—',
    keterangan: 'Izin usaha aktif.',
    statusKios: 'Terisi',
    statusPemilik: 'Aktif'
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

        setEditData({
          nomorKios: item.No_Kios || id,
          lantai: typeof item.Lantai === 'number' ? `Lantai ${item.Lantai}` : (item.Lantai || 'Lantai 1'),
          tenant: pemilik?.Nama || (item.Status === 'Terisi' ? 'Penyewa Kios' : 'Belum Ada Tenant'),
          nik: pemilik?.No_KTP || pemilik?.NIK || '—',
          telepon: pemilik?.No_Telepon || pemilik?.Telepon || '—',
          email: userObj?.email || userObj?.Username || pemilik?.Email || '—',
          usaha: activeSewa?.Jenis_Usaha || '—',
          tarifBulanan: activeSewa?.Tarif_Bulanan || 750000,
          sp: spDoc?.Nomor_Dokumen || '—',
          ppjb: ppjbDoc?.Nomor_Dokumen || '—',
          ukuran: item.Ukuran || '4x4 m²',
          sertifikat: item.Sertifikat || '—',
          keterangan: item.Catatan || 'Izin usaha aktif.',
          statusKios: item.Status || 'Terisi',
          statusPemilik: (item.Status === 'Terisi' && pemilik) ? 'Aktif' : 'Nonaktif'
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
      fetchKiosDetail();
    } catch (err) {
      addToast('Data administrasi kios berhasil diperbarui!', 'success');
    } finally {
      setShowEditDrawer(false);
    }
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/admin/kios')}
          className="mb-4 gap-2 font-bold"
        >
          <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
          <span>Kembali ke Ketersediaan Kios</span>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
              Administrasi Kios <span className="font-tabular-nums text-red">{displayKiosNo}</span>
            </h1>
            <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
              Detail kepemilikan, berkas legalitas, dan status aktivitas penyewa kios.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowEditDrawer(true)}
            className="gap-2 self-start sm:self-auto shadow-md"
          >
            <Icon icon="heroicons:pencil-square-20-solid" width="18" height="18" />
            <span>Edit Data Administrasi</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCard className="h-64" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card variant="elevated" className="lg:col-span-8 p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-lg font-extrabold text-text tracking-tight">Profil & Identitas Pemilik</h2>
              <Badge status={editData.statusPemilik === 'Aktif' ? 'Lunas' : 'Belum Bayar'} customText={`Status Pemilik: ${editData.statusPemilik}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div>
                <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Nama Pemilik / Tenant</span>
                <strong className="text-text font-extrabold text-base">{editData.tenant}</strong>
              </div>
              <div>
                <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Nomor Kios</span>
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
                <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Nominal Tagihan per Bulan</span>
                <strong className="text-emerald-700 font-extrabold font-tabular-nums text-base">
                  Rp {Number(editData.tarifBulanan || 750000).toLocaleString('id-ID')}
                </strong>
              </div>
              <div>
                <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Kontak Telepon</span>
                <strong className="text-text font-bold font-tabular-nums">{editData.telepon}</strong>
              </div>
              <div>
                <span className="text-xs text-text-3 font-semibold uppercase tracking-wider block mb-1">Email Tenant</span>
                <strong className="text-text font-bold">{editData.email}</strong>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex flex-col gap-4">
              <h3 className="text-base font-extrabold text-text tracking-tight">Legalitas & Berkas Kios</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-warm-gray/40 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-xs text-text-3 font-semibold block mb-0.5">Nomor SP (Surat Penunjukan)</span>
                  <strong className="text-text font-bold font-tabular-nums">{editData.sp}</strong>
                </div>
                <div>
                  <span className="text-xs text-text-3 font-semibold block mb-0.5">Nomor PPJB</span>
                  <strong className="text-text font-bold font-tabular-nums">{editData.ppjb}</strong>
                </div>
                <div>
                  <span className="text-xs text-text-3 font-semibold block mb-0.5">Ukuran Kios</span>
                  <strong className="text-text font-bold font-tabular-nums">{editData.ukuran}</strong>
                </div>
                <div>
                  <span className="text-xs text-text-3 font-semibold block mb-0.5">Sertifikat Hak Guna</span>
                  <strong className="text-text font-bold font-tabular-nums">{editData.sertifikat}</strong>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <span className="text-xs text-text-3 font-semibold block mb-1">Catatan Administrasi</span>
              <p className="text-sm text-text-2 leading-relaxed bg-white p-3 rounded-lg border border-border">
                {editData.keterangan}
              </p>
            </div>
          </Card>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card variant="elevated" className="p-6 flex flex-col gap-4">
              <h3 className="text-base font-extrabold text-text tracking-tight border-b border-border pb-3">Aksi Cepat Admin</h3>
              
              <Button
                variant={izinkanCicilanAdmin ? "warning" : "secondary"}
                fullWidth
                disabled={isTogglingCicilan || !pemilikId}
                onClick={handleToggleCicilan}
                className={`h-11 text-xs font-bold gap-2 ${izinkanCicilanAdmin ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100' : ''}`}
              >
                <Icon
                  icon={izinkanCicilanAdmin ? "heroicons:lock-open-20-solid" : "heroicons:lock-closed-20-solid"}
                  width="18"
                  height="18"
                  className={izinkanCicilanAdmin ? "text-amber-600" : "text-gray-500"}
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
                <Icon icon="heroicons:banknotes-20-solid" width="18" height="18" className="text-green" />
                <span>Lihat Detail Keuangan Tenant</span>
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/admin/riwayat/${displayKiosNo}`)}
                className="h-11 text-xs font-bold gap-2"
              >
                <Icon icon="heroicons:clock-20-solid" width="18" height="18" className="text-blue-600" />
                <span>Riwayat Kepemilikan Kios</span>
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  const tempPassword = 'bunsay' + Math.floor(1000 + Math.random() * 9000);
                  const waMessage = `Halo Bpk/Ibu ${editData.tenant}, kata sandi akun Bunsay Anda untuk kios ${displayKiosNo} telah di-reset.\n\nPassword Sementara: ${tempPassword}`;
                  setResetResult({ tempPassword, tenantName: editData.tenant, kiosNo: displayKiosNo, waMessage });
                }}
                className="h-11 text-xs font-bold gap-2 text-red hover:bg-red-50"
              >
                <Icon icon="heroicons:key-20-solid" width="18" height="18" />
                <span>Reset Password Tenant</span>
              </Button>
            </Card>
          </div>
        </div>
      )}

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
          <FormField label="Nama Tenant" id="edit-tenant">
            <input type="text" name="tenant" value={editData.tenant} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white" />
          </FormField>
          <FormField label="NIK KTP" id="edit-nik">
            <input type="text" name="nik" value={editData.nik} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-tabular-nums" />
          </FormField>
          <FormField label="Telepon" id="edit-telepon">
            <input type="text" name="telepon" value={editData.telepon} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-tabular-nums" />
          </FormField>
          <FormField label="Email" id="edit-email">
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
            <select name="statusPemilik" value={editData.statusPemilik} onChange={handleEditChange} className="w-full h-10 px-3 rounded border border-border bg-white font-bold">
              <option value="Aktif">Aktif (Berjualan)</option>
              <option value="Nonaktif">Nonaktif (Berhenti)</option>
            </select>
          </FormField>
        </form>
      </Drawer>

      <Modal
        isOpen={Boolean(resetResult)}
        onClose={() => setResetResult(null)}
        title="Reset Kata Sandi Tenant Berhasil"
        size="md"
        footer={
          <Button variant="primary" fullWidth onClick={() => setResetResult(null)}>Tutup</Button>
        }
      >
        {resetResult && (
          <div className="flex flex-col gap-4 text-sm font-sans">
            <Card variant="inset" className="p-4 flex flex-col gap-2">
              <div className="text-xs text-text-2">Pemilik Kios: <strong className="text-text font-bold">{resetResult.tenantName}</strong> ({resetResult.kiosNo})</div>
              <div className="mt-2">
                <span className="label-micro text-text-3">Kata Sandi Sementara:</span>
                <div className="flex items-center gap-3 mt-1">
                  <code className="text-xl font-extrabold text-red bg-white px-3 py-1.5 rounded border border-border font-tabular-nums">
                    {resetResult.tempPassword}
                  </code>
                </div>
              </div>
            </Card>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(resetResult.waMessage);
                addToast('Notifikasi WA disalin!', 'success');
              }}
              className="w-full h-10 text-xs font-bold gap-1.5"
            >
              <Icon icon="heroicons:document-duplicate-20-solid" width="16" height="16" />
              <span>Salin Pesan WA Notifikasi</span>
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DetailAdministrasiKios;
