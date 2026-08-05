import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useAdminKiosDetail, useKiosUpdate } from '../../hooks/useAdmin';
import Drawer from '../../components/ui/Drawer';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import FormField from '../../components/ui/FormField';
import { SkeletonCard, SkeletonText } from '../../components/ui/Skeleton';

function DetailAdministrasiKios() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useUI();

  const kiosId = location.state?.kiosId;
  const ownerData = location.state?.ownerData;
  const backPath = location.state?.from || '/admin/kios';
  const backLabel = location.state?.fromLabel || 'Kembali ke Tabel Kios';

  const { data: kios, loading, error, refetch } = useAdminKiosDetail(kiosId);
  const { updateKiosData } = useKiosUpdate();

  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  const isExTenant = ownerData && ownerData.statusPemilik === 'Nonaktif';

  useEffect(() => {
    const targetData = isExTenant
      ? {
          ...kios,
          ...ownerData,
          tenant: ownerData.nama,
          statusKios: 'Kosong',
          detailAdministrasi: {
            ...(kios?.detailAdministrasi || {}),
            statusPemilik: 'Nonaktif',
            sp: 'SP/2021/045 (Arsip)',
            ppjb: 'PPJB/2021/045 (Arsip)',
            sertifikat: 'SRT/2021/045 (Arsip)',
            ktp: ownerData.ktp || '6471012903740008',
            kontak: ownerData.noTelepon || '0813-4700-1122',
            catatan: ownerData.rincianTunggakan || ownerData.catatan || 'Pemilik lama sudah tidak aktif berjualan (Nonaktif).'
          }
        }
      : kios;

    if (targetData) {
      const spDoc = targetData.detailAdministrasi?.dokumenList?.find(d => d.jenisDokumen === 'SP');
      const ppjbDoc = targetData.detailAdministrasi?.dokumenList?.find(d => d.jenisDokumen === 'PPJB');
      const sertifikatDoc = targetData.detailAdministrasi?.dokumenList?.find(d => d.jenisDokumen === 'Sertifikat');

      setEditData({
        tenant: targetData.tenant || targetData.nama,
        statusKios: targetData.statusKios || (isExTenant ? 'Kosong' : 'Terisi'),
        statusPemilik: targetData.detailAdministrasi?.statusPemilik || targetData.statusPemilik || (isExTenant ? 'Nonaktif' : 'Aktif'),
        usaha: targetData.usaha,
        catatan: targetData.catatan || targetData.detailAdministrasi?.catatan || '',
        sp: spDoc?.nomorDokumen || targetData.detailAdministrasi?.sp || '',
        ppjb: ppjbDoc?.nomorDokumen || targetData.detailAdministrasi?.ppjb || '',
        sertifikat: sertifikatDoc?.nomorDokumen || targetData.detailAdministrasi?.sertifikat || '',
        ...(targetData.detailAdministrasi || {})
      });
    }
  }, [kios, ownerData, isExTenant]);

  useEffect(() => {
    if (!kiosId && !ownerData) {
      navigate('/admin/kios');
    }
  }, [kiosId, ownerData, navigate]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'statusPemilik' && value === 'Nonaktif') {
        next.statusKios = 'Kosong';
      }
      return next;
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const currentDocs = kios?.detailAdministrasi?.dokumenList || [];
      const updatedDokumenList = currentDocs.map(doc => {
        if (doc.jenisDokumen === 'KTP') return { ...doc, nomorDokumen: editData.ktp || doc.nomorDokumen };
        if (doc.jenisDokumen === 'SP') return { ...doc, nomorDokumen: editData.sp || doc.nomorDokumen };
        if (doc.jenisDokumen === 'PPJB') return { ...doc, nomorDokumen: editData.ppjb || doc.nomorDokumen };
        if (doc.jenisDokumen === 'Sertifikat') return { ...doc, nomorDokumen: editData.sertifikat || doc.nomorDokumen };
        return doc;
      });

      const payload = {
        ...editData,
        dokumenList: updatedDokumenList
      };

      const result = await updateKiosData(kiosId, payload);
      if (result && result.success) {
        addToast(result.message || `Data administrasi kios ${kios?.nomorKios} berhasil diperbarui.`, 'success');
        setShowEditDrawer(false);
        refetch();
      } else {
        addToast(result?.message || 'Gagal memperbarui data.', 'error');
      }
    } catch (_) {
      addToast('Gagal memperbarui data. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !ownerData) {
    return (
      <div className="page-fade-in flex flex-col gap-8 font-sans">
        <div className="space-y-2">
          <SkeletonText className="h-9 w-64" />
          <SkeletonText className="h-5 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  if (error && !ownerData) {
    return (
      <Card variant="inset" className="p-10 text-center my-8 font-sans">
        <p className="text-red font-bold text-base mb-4">Gagal memuat detail kios.</p>
        <Button variant="primary" onClick={refetch}>
          Muat Ulang
        </Button>
      </Card>
    );
  }

  const displayData = isExTenant
    ? {
        ...kios,
        ...ownerData,
        tenant: ownerData.nama,
        statusKios: 'Kosong',
        detailAdministrasi: {
          ...(kios?.detailAdministrasi || {}),
          statusPemilik: 'Nonaktif',
          sp: 'SP/2021/045 (Arsip)',
          ppjb: 'PPJB/2021/045 (Arsip)',
          sertifikat: 'SRT/2021/045 (Arsip)',
          ktp: ownerData.ktp || '6471012903740008',
          kontak: ownerData.noTelepon || '0813-4700-1122',
          catatan: ownerData.rincianTunggakan || ownerData.catatan || 'Pemilik lama sudah tidak aktif berjualan (Nonaktif).'
        }
      }
    : (kios || ownerData || {});

  const adminData = displayData.detailAdministrasi || displayData;
  const displayKiosNo = displayData.nomorKios || displayData.kios || 'Kios';
  const displayTenantName = displayData.tenant || displayData.nama || '-';

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(backPath)}
          className="mb-4 gap-2 font-bold"
        >
          <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
          <span>{backLabel}</span>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
              Detail Administrasi Kios <span className="font-tabular-nums text-red">{displayKiosNo}</span>
            </h1>
            <p className="text-text-2 text-sm sm:text-base font-medium mt-1">
              Legalitas dokumen, sertifikat sewa, dan status kepemilikan tenant.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowEditDrawer(true)}
            className="gap-2 shadow-md self-start sm:self-auto"
          >
            <Icon icon="heroicons:pencil-square-20-solid" width="18" height="18" />
            <span>Edit Administrasi</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Identitas Pemilik & Unit */}
        <Card variant="elevated" className="lg:col-span-6 flex flex-col gap-5 p-6 sm:p-7">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="text-lg font-extrabold text-text tracking-tight">Identitas Pemilik & Unit</h3>
            <Badge status={displayData.statusKios || 'Terisi'} />
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Nama Pemilik:</span>
              <strong className="text-text font-bold">{displayTenantName}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Username Akun:</span>
              <strong className="font-mono font-extrabold text-red bg-warm-gray px-2 py-0.5 rounded text-xs border border-border">
                {adminData.username || `tenant_${(displayKiosNo || 'kios').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`}
              </strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Nomor Kios:</span>
              <strong className="text-text font-extrabold font-tabular-nums text-red">{displayKiosNo}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Lantai:</span>
              <strong className="text-text font-bold">{displayData.lantai || adminData.lantai || '-'}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Ukuran Unit:</span>
              <strong className="text-text font-bold font-tabular-nums">{adminData.ukuran || '-'}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Jenis Usaha:</span>
              <strong className="text-text font-bold">{displayData.usaha || adminData.usaha || '-'}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Kontak HP:</span>
              <strong className="text-text font-bold font-tabular-nums">{adminData.kontak || '-'}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Nomor KTP:</span>
              <strong className="text-text font-bold font-tabular-nums">{adminData.ktp || '-'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-2 font-semibold">Status Pemilik:</span>
              <Badge status={adminData.statusPemilik === 'Nonaktif' ? 'Kosong' : 'Terisi'} />
            </div>
          </div>
        </Card>

        {/* Legalitas & Dokumen Kios */}
        <Card variant="elevated" className="lg:col-span-6 flex flex-col gap-5 p-6 sm:p-7">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="text-lg font-extrabold text-text tracking-tight">Legalitas Dokumen Kios</h3>
            <Icon icon="heroicons:document-text-20-solid" width="22" height="22" className="text-red" />
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">No. SP / Tanggal:</span>
              <strong className="text-text font-bold font-tabular-nums">{adminData.sp || '-'}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">No. PPJB / Tanggal:</span>
              <strong className="text-text font-bold font-tabular-nums">{adminData.ppjb || '-'}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">No. Sertifikat:</span>
              <strong className="text-text font-bold font-tabular-nums">{adminData.sertifikat || '-'}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Alamat Lengkap:</span>
              <span className="text-text font-medium text-right max-w-[220px]">{adminData.alamat || '-'}</span>
            </div>
            <div>
              <span className="text-text-2 font-semibold block mb-1">Catatan Administrasi:</span>
              <Card variant="inset" className="p-3 text-xs text-text leading-relaxed">
                {displayData.catatan || adminData.catatan || 'Tidak ada catatan khusus.'}
              </Card>
            </div>
          </div>
        </Card>
      </div>

      {/* Drawer Slide-Over Form Edit Administrasi */}
      <Drawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        title="Edit Administrasi Kios"
        subtitle={`Nomor Kios ${displayKiosNo} — ${displayTenantName}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditDrawer(false)}>
              Batal
            </Button>
            <Button variant="primary" disabled={isSubmitting} onClick={handleSaveEdit}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Pemilik" id="edit-kios-tenant">
              <input id="edit-kios-tenant" type="text" name="tenant" value={editData.tenant || ''} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm focus:bg-white" />
            </FormField>
            <FormField label="Nomor KTP" id="edit-kios-ktp">
              <input id="edit-kios-ktp" type="text" name="ktp" value={editData.ktp || ''} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white" />
            </FormField>
          </div>

          <FormField label="Alamat" id="edit-kios-alamat">
            <input id="edit-kios-alamat" type="text" name="alamat" value={editData.alamat || ''} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm focus:bg-white" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Kontak HP" id="edit-kios-kontak">
              <input id="edit-kios-kontak" type="text" name="kontak" value={editData.kontak || ''} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white" />
            </FormField>
            <FormField label="Jenis Usaha" id="edit-kios-usaha">
              <input id="edit-kios-usaha" type="text" name="usaha" value={editData.usaha || ''} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm focus:bg-white" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="No. SP / Tanggal" id="edit-kios-sp">
              <input id="edit-kios-sp" type="text" name="sp" value={editData.sp || ''} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white" />
            </FormField>
            <FormField label="No. PPJB / Tanggal" id="edit-kios-ppjb">
              <input id="edit-kios-ppjb" type="text" name="ppjb" value={editData.ppjb || ''} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Ukuran Unit" id="edit-kios-ukuran">
              <input id="edit-kios-ukuran" type="text" name="ukuran" value={editData.ukuran || ''} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white" />
            </FormField>
            <FormField label="Sertifikat" id="edit-kios-sertifikat">
              <input id="edit-kios-sertifikat" type="text" name="sertifikat" value={editData.sertifikat || ''} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white" />
            </FormField>
          </div>

          <FormField label="Catatan Administrasi" id="edit-kios-keterangan">
            <textarea id="edit-kios-keterangan" name="keterangan" value={editData.keterangan || ''} onChange={handleEditChange} rows={2} className="w-full p-2.5 rounded-md border border-border bg-warm-gray/50 text-sm focus:bg-white resize-none" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Status Kios" id="edit-kios-status">
              <select id="edit-kios-status" name="statusKios" value={editData.statusKios || 'Terisi'} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold">
                <option value="Terisi">Terisi</option>
                <option value="Kosong">Kosong</option>
              </select>
            </FormField>
            <FormField label="Status Pemilik" id="edit-pemilik-status" hint={editData.statusPemilik === 'Nonaktif' ? 'Catatan: Status kios otomatis disesuaikan menjadi Kosong.' : undefined}>
              <select id="edit-pemilik-status" name="statusPemilik" value={editData.statusPemilik || 'Aktif'} onChange={handleEditChange} className="w-full h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold">
                <option value="Aktif">Aktif (Berjualan)</option>
                <option value="Nonaktif">Nonaktif (Berhenti)</option>
              </select>
              {editData.statusPemilik === 'Nonaktif' && (
                <p role="status" aria-live="polite" className="text-xs text-orange font-bold mt-1">
                  Status kios otomatis menjadi Kosong karena pemilik Nonaktif.
                </p>
              )}
            </FormField>
          </div>

          {/* Reset Kata Sandi Tenant Action */}
          <div className="border-t border-border pt-4 mt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              className="h-10 text-xs font-bold gap-2 text-red hover:bg-red-50"
              onClick={() => {
                const tempPassword = 'bunsay' + Math.floor(1000 + Math.random() * 9000);
                const tenantName = editData.tenant || displayTenantName || 'Pemilik Kios';
                const kiosNo = editData.nomorKios || displayKiosNo || '';
                const waMessage = `Halo Bpk/Ibu ${tenantName}, kata sandi akun Bunsay Anda untuk kios ${kiosNo} telah di-reset oleh Admin Kantor Pengelola.\n\nKata Sandi Sementara: ${tempPassword}\n\nSilakan login menggunakan username Anda dan ubah kata sandi di menu Pengaturan Akun. Terima kasih.`;
                
                setResetResult({
                  tempPassword,
                  tenantName,
                  kiosNo,
                  waMessage
                });
                setShowEditDrawer(false);
              }}
            >
              <Icon icon="heroicons:key-20-solid" width="16" height="16" />
              <span>Reset Kata Sandi Tenant</span>
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Modal Tampilan Hasil Reset Kata Sandi Tenant */}
      <Modal
        isOpen={Boolean(resetResult)}
        onClose={() => setResetResult(null)}
        title="Reset Kata Sandi Tenant Berhasil"
        size="md"
        footer={
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={() => setResetResult(null)}
          >
            Selesai & Tutup
          </Button>
        }
      >
        {resetResult && (
          <div className="flex flex-col gap-4 text-sm font-sans">
            <Card variant="inset" className="p-4 flex flex-col gap-2">
              <div className="text-xs text-text-2">Pemilik Kios: <strong className="text-text font-bold">{resetResult.tenantName}</strong> ({resetResult.kiosNo})</div>
              <div className="mt-2">
                <span className="label-micro text-text-3">Kata Sandi Sementara Baru:</span>
                <div className="flex items-center gap-3 mt-1">
                  <code className="text-xl font-extrabold text-red tracking-wider bg-white px-3 py-1.5 rounded-lg border border-border font-tabular-nums">
                    {resetResult.tempPassword}
                  </code>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9 px-3 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(resetResult.tempPassword);
                      addToast('Kata sandi sementara berhasil disalin!', 'success');
                    }}
                  >
                    Salin Password
                  </Button>
                </div>
              </div>
            </Card>

            <div>
              <label className="block text-xs font-bold text-text-2 mb-1.5">Format Pesan Notifikasi WhatsApp Tenant:</label>
              <textarea
                readOnly
                rows={5}
                value={resetResult.waMessage}
                className="w-full p-3 text-xs rounded-lg border border-border bg-warm-gray/40 text-text leading-relaxed font-mono resize-none"
              />
            </div>

            <div className="flex gap-2.5 w-full">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 shrink-0 h-10 text-xs font-bold gap-1.5 whitespace-nowrap"
                onClick={() => {
                  navigator.clipboard.writeText(resetResult.waMessage);
                  addToast('Pesan WA notifikasi resmi berhasil disalin ke clipboard!', 'success');
                }}
              >
                <Icon icon="heroicons:document-duplicate-20-solid" width="16" height="16" />
                <span>Salin Pesan WA</span>
              </Button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(resetResult.waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 shrink-0 bg-[#25D366] text-white hover:bg-[#20bd5a] h-10 rounded-md text-xs font-bold text-decoration-none flex items-center justify-center gap-1.5 transition-all shadow-sm whitespace-nowrap"
              >
                <Icon icon="ic:baseline-whatsapp" width="18" height="18" />
                <span>Kirim via WA</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DetailAdministrasiKios;
