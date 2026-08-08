import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Drawer, Modal, Card, Badge, Button, Icon, FormField } from '@bunsay/shared-ui';

function DetailAdministrasiKios() {
  const location = useLocation();
  const navigate = useNavigate();

  const kiosId = location.state?.kiosId;
  const ownerData = location.state?.ownerData;
  const backPath = location.state?.from || '/admin/kios';
  const backLabel = location.state?.fromLabel || 'Kembali ke Tabel Kios';

  const isExTenant = ownerData && ownerData.statusPemilik === 'Nonaktif';

  const defaultData = {
    tenant: ownerData?.nama || 'Hj. Yuliana',
    username: ownerData?.username || 'yuliana_b1001',
    nomorKios: ownerData?.kios || 'B-1001',
    lantai: ownerData?.lantai || '1',
    ukuran: ownerData?.ukuran || '3 x 4 Meter (12 m²)',
    usaha: ownerData?.usaha || 'Sembako & Kelontong',
    kontak: ownerData?.telepon || '0812-3456-7890',
    ktp: ownerData?.ktp || '6471012903740008',
    statusKios: isExTenant ? 'Kosong' : 'Terisi',
    statusPemilik: isExTenant ? 'Nonaktif' : 'Aktif',
    sp: ownerData?.sp || 'SP-102/PLZ-BUNSAY/2024 (15 Jan 2024)',
    ppjb: ownerData?.ppjb || 'PPJB-0881 (15 Jan 2024)',
    sertifikat: ownerData?.sertifikat || 'SRT-HGB/2024/001 (Resmi Pemkot)',
    alamat: ownerData?.alamat || 'Plaza Kebun Sayur Lt. 1 Blok B No. 1001, Balikpapan',
    catatan: ownerData?.rincianTunggakan || ownerData?.catatan || 'Masa sewa aktif berjalan hingga Mei 2026.'
  };

  const [displayData, setDisplayData] = useState(defaultData);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editData, setEditData] = useState(defaultData);
  const [resetResult, setResetResult] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (ownerData) {
      const merged = {
        ...defaultData,
        ...ownerData,
        tenant: ownerData.nama || ownerData.tenant || defaultData.tenant,
        nomorKios: ownerData.kios || ownerData.nomorKios || defaultData.nomorKios
      };
      setDisplayData(merged);
      setEditData(merged);
    }
  }, [ownerData]);

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

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setDisplayData(editData);
    setShowEditDrawer(false);
    setToastMessage('Data administrasi kios berhasil diperbarui.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-green-bg border border-green/30 text-green font-bold text-sm text-center">
          {toastMessage}
        </div>
      )}

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
              Detail Administrasi Kios <span className="font-tabular-nums text-red">{displayData.nomorKios}</span>
            </h1>
            <p className="text-text-2 text-sm sm:text-base font-medium mt-1">
              Legalitas dokumen, sertifikat sewa, dan status kepemilikan tenant.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowEditDrawer(true)}
            className="gap-2 shadow-md self-start sm:self-auto font-extrabold"
          >
            <Icon icon="heroicons:pencil-square-20-solid" width="18" height="18" />
            <span>Edit Administrasi</span>
          </Button>
        </div>
      </div>

      {/* Grid Layout 2 Card persis versi Backup */}
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
              <strong className="text-text font-bold">{displayData.tenant}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Username Akun:</span>
              <strong className="font-mono font-extrabold text-red bg-warm-gray px-2 py-0.5 rounded text-xs border border-border">
                {displayData.username}
              </strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Nomor Kios:</span>
              <strong className="text-text font-extrabold font-tabular-nums text-red">{displayData.nomorKios}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Lantai:</span>
              <strong className="text-text font-bold">Lantai {displayData.lantai}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Ukuran Unit:</span>
              <strong className="text-text font-bold font-tabular-nums">{displayData.ukuran}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Jenis Usaha:</span>
              <strong className="text-text font-bold">{displayData.usaha}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Kontak HP:</span>
              <strong className="text-text font-bold font-tabular-nums">{displayData.kontak}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Nomor KTP:</span>
              <strong className="text-text font-bold font-tabular-nums">{displayData.ktp}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-2 font-semibold">Status Pemilik:</span>
              <Badge status={displayData.statusPemilik === 'Nonaktif' ? 'Kosong' : 'Terisi'} />
            </div>
          </div>
        </Card>

        {/* Legalitas Dokumen Kios */}
        <Card variant="elevated" className="lg:col-span-6 flex flex-col gap-5 p-6 sm:p-7">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="text-lg font-extrabold text-text tracking-tight">Legalitas Dokumen Kios</h3>
            <Icon icon="heroicons:document-text-20-solid" width="22" height="22" className="text-red" />
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">No. SP / Tanggal:</span>
              <strong className="text-text font-bold font-tabular-nums">{displayData.sp}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">No. PPJB / Tanggal:</span>
              <strong className="text-text font-bold font-tabular-nums">{displayData.ppjb}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">No. Sertifikat:</span>
              <strong className="text-text font-bold font-tabular-nums">{displayData.sertifikat}</strong>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-2 font-semibold">Alamat Lengkap:</span>
              <span className="text-text font-medium text-right max-w-[220px]">{displayData.alamat}</span>
            </div>
            <div>
              <span className="text-text-2 font-semibold block mb-1">Catatan Administrasi:</span>
              <Card variant="inset" className="p-3 text-xs text-text leading-relaxed font-medium">
                {displayData.catatan}
              </Card>
            </div>
          </div>
        </Card>
      </div>

      {/* Drawer Slide-Over Form Edit Administrasi LENGKAP */}
      <Drawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        title="Edit Administrasi Kios"
        subtitle={`Nomor Kios ${displayData.nomorKios} — ${displayData.tenant}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditDrawer(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveEdit} className="font-bold">
              Simpan Perubahan
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Pemilik" id="edit-kios-tenant">
              <input
                id="edit-kios-tenant"
                type="text"
                name="tenant"
                value={editData.tenant || ''}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm focus:bg-white"
              />
            </FormField>
            <FormField label="Nomor KTP" id="edit-kios-ktp">
              <input
                id="edit-kios-ktp"
                type="text"
                name="ktp"
                value={editData.ktp || ''}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white"
              />
            </FormField>
          </div>

          <FormField label="Alamat Lengkap" id="edit-kios-alamat">
            <input
              id="edit-kios-alamat"
              type="text"
              name="alamat"
              value={editData.alamat || ''}
              onChange={handleEditChange}
              className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm focus:bg-white"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Kontak HP" id="edit-kios-kontak">
              <input
                id="edit-kios-kontak"
                type="tel"
                name="kontak"
                value={editData.kontak || ''}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white"
              />
            </FormField>
            <FormField label="Jenis Usaha" id="edit-kios-usaha">
              <input
                id="edit-kios-usaha"
                type="text"
                name="usaha"
                value={editData.usaha || ''}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm focus:bg-white"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="No. SP / Tanggal" id="edit-kios-sp">
              <input
                id="edit-kios-sp"
                type="text"
                name="sp"
                value={editData.sp || ''}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white"
              />
            </FormField>
            <FormField label="No. PPJB / Tanggal" id="edit-kios-ppjb">
              <input
                id="edit-kios-ppjb"
                type="text"
                name="ppjb"
                value={editData.ppjb || ''}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Ukuran Unit" id="edit-kios-ukuran">
              <input
                id="edit-kios-ukuran"
                type="text"
                name="ukuran"
                value={editData.ukuran || ''}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white"
              />
            </FormField>
            <FormField label="Sertifikat" id="edit-kios-sertifikat">
              <input
                id="edit-kios-sertifikat"
                type="text"
                name="sertifikat"
                value={editData.sertifikat || ''}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-warm-gray/50 px-3 text-sm font-tabular-nums focus:bg-white"
              />
            </FormField>
          </div>

          <FormField label="Catatan Administrasi" id="edit-kios-catatan">
            <textarea
              id="edit-kios-catatan"
              name="catatan"
              value={editData.catatan || ''}
              onChange={handleEditChange}
              rows={2}
              className="w-full p-2.5 rounded-md border border-border bg-warm-gray/50 text-sm focus:bg-white resize-none"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Status Kios" id="edit-kios-status">
              <select
                id="edit-kios-status"
                name="statusKios"
                value={editData.statusKios || 'Terisi'}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold"
              >
                <option value="Terisi">Terisi</option>
                <option value="Kosong">Kosong</option>
              </select>
            </FormField>
            <FormField label="Status Pemilik" id="edit-pemilik-status" hint={editData.statusPemilik === 'Nonaktif' ? 'Catatan: Status kios otomatis disesuaikan menjadi Kosong.' : undefined}>
              <select
                id="edit-pemilik-status"
                name="statusPemilik"
                value={editData.statusPemilik || 'Aktif'}
                onChange={handleEditChange}
                className="w-full h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold"
              >
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
                const tenantName = editData.tenant || 'Pemilik Kios';
                const kiosNo = editData.nomorKios || '';
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
            className="font-bold"
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
                    className="h-9 px-3 text-xs font-bold"
                    onClick={() => {
                      navigator.clipboard.writeText(resetResult.tempPassword);
                      setToastMessage('Kata sandi sementara berhasil disalin!');
                      setTimeout(() => setToastMessage(null), 3000);
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
                  setToastMessage('Pesan WA notifikasi resmi berhasil disalin!');
                  setTimeout(() => setToastMessage(null), 3000);
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
