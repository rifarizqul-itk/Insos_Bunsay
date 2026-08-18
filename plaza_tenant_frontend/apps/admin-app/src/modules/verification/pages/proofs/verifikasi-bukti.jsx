import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Icon, Table, Card, Button, Badge, Modal, Sheet, EmptyState, SkeletonTable, Pagination, cn } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function VerifikasiBuktiTransfer({ selectedTenant = null }) {
  const location = useLocation();
  const { httpClient } = useAdminAuth();
  const [previewItem, setPreviewItem] = useState(null);
  const [antrean, setAntrean] = useState([]);
  const [riwayatProses, setRiwayatProses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Active tab state: 'antrean' or 'riwayat'
  const [activeTab, setActiveTab] = useState('antrean');

  // Pagination state
  const [currentPageAntrean, setCurrentPageAntrean] = useState(1);
  const [pageSizeAntrean, setPageSizeAntrean] = useState(10);
  const [currentPageRiwayat, setCurrentPageRiwayat] = useState(1);
  const [pageSizeRiwayat, setPageSizeRiwayat] = useState(10);

  // Sorting state
  const [sortConfigAntrean, setSortConfigAntrean] = useState({ key: 'id', direction: 'desc' });
  const [sortConfigRiwayat, setSortConfigRiwayat] = useState({ key: 'id', direction: 'desc' });

  // Modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, type: 'konfirmasi', item: null });
  const [catatanRejection, setCatatanRejection] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  const fetchVerifikasiQueue = async () => {
    setIsLoading(true);
    try {
      const response = await httpClient.get('/api/v1/admin/pembayaran');
      if (response?.data && Array.isArray(response.data)) {
        const raw = response.data;
        const waiting = raw
          .filter(item => item.Verifikasi_Pembayaran === 'Menunggu' || !item.Verifikasi_Pembayaran)
          .map(item => ({
            id: item.Id_Pembayaran,
            trxCode: `TRX-${item.Id_Pembayaran}`,
            nama: item.tagihan?.sewa?.pemilik?.Nama || item.tagihan?.sewa?.pemilik?.Nama_Pemilik || 'Tenant',
            kios: item.tagihan?.sewa?.kios?.No_Kios || item.tagihan?.sewa?.kios?.Kode_Kios || 'Kios',
            tagihan: `Sewa Kios ${item.tagihan?.Periode || 'Periode Aktif'}`,
            nominalRaw: Number(item.Total_Bayar || 0),
            nominal: `Rp ${Number(item.Total_Bayar || 0).toLocaleString('id-ID')}`,
            labelMetode: item.Metode_Bayar || 'Transfer Bank Manual',
            waktu: item.Tanggal_Bayar || '-',
            status: 'Menunggu',
            catatan: item.catatan_admin || '',
            teksSanggahan: item.teks_sanggahan || '',
            buktiSanggahan: item.bukti_sanggahan || '',
            buktiUrl: item.Bukti_Pembayaran || ''
          }));

        const processed = raw
          .filter(item => item.Verifikasi_Pembayaran === 'Diterima' || item.Verifikasi_Pembayaran === 'Ditolak')
          .map(item => ({
            id: item.Id_Pembayaran,
            trxCode: `TRX-${item.Id_Pembayaran}`,
            nama: item.tagihan?.sewa?.pemilik?.Nama || item.tagihan?.sewa?.pemilik?.Nama_Pemilik || 'Tenant',
            kios: item.tagihan?.sewa?.kios?.No_Kios || item.tagihan?.sewa?.kios?.Kode_Kios || 'Kios',
            tagihan: `Sewa Kios ${item.tagihan?.Periode || 'Periode Aktif'}`,
            nominalRaw: Number(item.Total_Bayar || 0),
            nominal: `Rp ${Number(item.Total_Bayar || 0).toLocaleString('id-ID')}`,
            labelMetode: item.Metode_Bayar || 'Transfer Bank Manual',
            waktu: item.Tanggal_Bayar || '-',
            status: item.Verifikasi_Pembayaran,
            catatan: item.catatan_admin || '',
            teksSanggahan: item.teks_sanggahan || '',
            buktiSanggahan: item.bukti_sanggahan || '',
            buktiUrl: item.Bukti_Pembayaran || ''
          }));

        setAntrean(waiting);
        setRiwayatProses(processed);
      }
    } catch (err) {
      console.warn('Backend fetch queue error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifikasiQueue();
  }, [httpClient]);

  // Auto-open modal pop-up when navigated from cashier setoran tunai
  useEffect(() => {
    if (location.state?.autoOpen && antrean.length > 0) {
      const match = antrean.find(item => 
        (location.state.tenantNama && item.nama.toLowerCase().includes(location.state.tenantNama.toLowerCase())) ||
        (location.state.idTagihan && item.id === location.state.idTagihan)
      ) || antrean[0];

      if (match) {
        setPreviewItem(match);
      }
    }
  }, [antrean, location.state]);

  const handleSortAntrean = (key) => {
    setSortConfigAntrean(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSortRiwayat = (key) => {
    setSortConfigRiwayat(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedAntrean = useMemo(() => {
    let list = selectedTenant ? antrean.filter(item => item.nama === selectedTenant) : [...antrean];
    const { key, direction } = sortConfigAntrean;
    return list.sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (key === 'nominal') {
        valA = a.nominalRaw;
        valB = b.nominalRaw;
      }
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [antrean, selectedTenant, sortConfigAntrean]);

  const sortedRiwayat = useMemo(() => {
    let list = selectedTenant ? riwayatProses.filter(item => item.nama === selectedTenant) : [...riwayatProses];
    const { key, direction } = sortConfigRiwayat;
    return list.sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (key === 'nominal') {
        valA = a.nominalRaw;
        valB = b.nominalRaw;
      }
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [riwayatProses, selectedTenant, sortConfigRiwayat]);

  const paginatedAntrean = useMemo(() => {
    const startIndex = (currentPageAntrean - 1) * pageSizeAntrean;
    return sortedAntrean.slice(startIndex, startIndex + pageSizeAntrean);
  }, [sortedAntrean, currentPageAntrean, pageSizeAntrean]);

  const paginatedRiwayat = useMemo(() => {
    const startIndex = (currentPageRiwayat - 1) * pageSizeRiwayat;
    return sortedRiwayat.slice(startIndex, startIndex + pageSizeRiwayat);
  }, [sortedRiwayat, currentPageRiwayat, pageSizeRiwayat]);

  const antreanHeaders = [
    { label: 'Tenant & Kios', sortKey: 'nama' },
    { label: 'Waktu/Tanggal', sortKey: 'waktu' },
    { label: 'Jenis Tagihan', sortKey: 'tagihan' },
    { label: 'Nominal Bayar', sortKey: 'nominal' },
    { label: 'Status Sanggahan', sortKey: 'teksSanggahan' },
    { label: 'Aksi', align: 'center', sortable: false }
  ];

  const riwayatHeaders = [
    { label: 'Tenant & Kios', sortKey: 'nama' },
    { label: 'Tagihan', sortKey: 'tagihan' },
    { label: 'Nominal', sortKey: 'nominal' },
    { label: 'Keputusan Verifikasi', sortKey: 'status' },
    { label: 'Catatan Admin', sortKey: 'catatan' },
    { label: 'Aksi', align: 'center', sortable: false }
  ];

  const triggerActionModal = (item, actionType) => {
    setCatatanRejection(item?.catatan || '');
    setRejectionError('');
    setConfirmModal({ open: true, type: actionType, item });
  };

  const handleExecuteAksi = async () => {
    const { item, type } = confirmModal;
    if (!item) return;

    if (type === 'tolak' && !catatanRejection.trim()) {
      setRejectionError('Alasan penolakan wajib diisi agar tenant mengetahui penyebab penolakan.');
      return;
    }

    const statusApi = type === 'konfirmasi' ? 'Diterima' : 'Ditolak';
    try {
      await httpClient.put(`/api/v1/admin/pembayaran/${item.id}/konfirmasi`, {
        status: statusApi,
        catatan_admin: type === 'tolak' ? catatanRejection.trim() : null
      });

      setConfirmModal({ open: false, type: 'konfirmasi', item: null });
      setPreviewItem(null);
      await fetchVerifikasiQueue();

      setToastMessage(
        `Bukti pembayaran ${item.trxCode} berhasil di-${type === 'konfirmasi' ? 'setujui (Lunas)' : 'tolak dengan alasan'}.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert('Gagal memproses verifikasi. Coba lagi.');
    }
  };

  return (
    <div data-slot="verifikasi-bukti-transfer" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {toastMessage && (
        <div className="bg-emerald-600 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:check-circle-20-solid" className="size-5" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Tutup notifikasi"
            className="text-white hover:opacity-80 p-1 cursor-pointer"
          >
            <Icon icon="heroicons:x-mark-20-solid" className="size-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Verifikasi Bukti Transfer Bank
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
            {selectedTenant
              ? `Menampilkan data bukti transfer manual untuk: ${selectedTenant}`
              : 'Khusus memproses dan mengonfirmasi bukti transfer bank manual yang diunggah oleh tenant.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-warm-gray/60 p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('antrean')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'antrean'
                ? 'bg-red text-white shadow-sm'
                : 'text-text-2 hover:text-text hover:bg-white/50'
            }`}
          >
            Antrean Menunggu ({antrean.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'riwayat'
                ? 'bg-red text-white shadow-sm'
                : 'text-text-2 hover:text-text hover:bg-white/50'
            }`}
          >
            Riwayat Terproses ({riwayatProses.length})
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card variant="elevated" className="w-full p-4 sm:p-6 flex flex-col gap-5">
        {activeTab === 'antrean' ? (
          isLoading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : sortedAntrean.length === 0 ? (
            <EmptyState
              icon="heroicons:document-check-20-solid"
              title="Antrean Verifikasi Kosong"
              description={selectedTenant ? `Tidak ada antrean bukti transfer untuk ${selectedTenant}.` : 'Tidak ada antrean transfer manual yang menunggu verifikasi saat ini.'}
            />
          ) : (
            <Table
              caption="Antrean Verifikasi Bukti Transfer Tenant"
              ariaLabel="Tabel Antrean Verifikasi Pembayaran Transfer Manual"
              headers={antreanHeaders}
              colSpan={6}
              sortConfig={sortConfigAntrean}
              onSort={handleSortAntrean}
              footer={
                <Pagination
                  currentPage={currentPageAntrean}
                  totalItems={sortedAntrean.length}
                  pageSize={pageSizeAntrean}
                  onPageChange={setCurrentPageAntrean}
                  onPageSizeChange={setPageSizeAntrean}
                  itemName="antrean"
                />
              }
            >
              {paginatedAntrean.map((item, index) => (
                <tr key={item.id || index} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-warm-gray/20 transition-colors">
                  <th scope="row" data-label="Tenant & Kios" className="p-3 text-start">
                    <div className="font-bold text-text text-sm">{item.nama}</div>
                    <div className="font-tabular-nums font-bold text-xs text-text-3">Kios {item.kios}</div>
                  </th>
                  <td data-label="Waktu/Tanggal" className="p-3 text-text-2 font-medium text-xs font-tabular-nums">
                    {item.waktu}
                  </td>
                  <td data-label="Jenis Tagihan" className="p-3 text-text-2 font-medium">
                    {item.tagihan}
                  </td>
                  <td data-label="Nominal Bayar" className="font-tabular-nums font-extrabold p-3 text-text">
                    {item.nominal}
                  </td>
                  <td data-label="Status Sanggahan" className="p-3">
                    {item.teksSanggahan ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                        <Icon icon="heroicons:chat-bubble-left-right-20-solid" className="size-3.5" />
                        Ada Sanggahan
                      </span>
                    ) : (
                      <span className="text-xs text-text-3 font-medium">Verifikasi Baru</span>
                    )}
                  </td>
                  <td data-label="Aksi" className="p-3 text-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setPreviewItem(item)}
                      aria-label={`Periksa bukti transfer ${item.nama} (${item.kios})`}
                      className="min-h-11 sm:min-h-8 sm:h-8 px-3 text-xs font-bold"
                    >
                      Periksa Bukti
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )
        ) : (
          isLoading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : sortedRiwayat.length === 0 ? (
            <EmptyState
              icon="heroicons:clock-20-solid"
              title="Belum Ada Riwayat Terproses"
              description="Belum ada verifikasi pembayaran yang disetujui atau ditolak."
            />
          ) : (
            <Table
              caption="Riwayat Bukti Transfer Terproses"
              ariaLabel="Tabel Riwayat Pembayaran Terproses"
              headers={riwayatHeaders}
              colSpan={6}
              sortConfig={sortConfigRiwayat}
              onSort={handleSortRiwayat}
              footer={
                <Pagination
                  currentPage={currentPageRiwayat}
                  totalItems={sortedRiwayat.length}
                  pageSize={pageSizeRiwayat}
                  onPageChange={setCurrentPageRiwayat}
                  onPageSizeChange={setPageSizeRiwayat}
                  itemName="riwayat"
                />
              }
            >
              {paginatedRiwayat.map((item, index) => (
                <tr key={item.id || index} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-warm-gray/20 transition-colors">
                  <th scope="row" data-label="Tenant & Kios" className="p-3 text-start">
                    <div className="font-bold text-text text-sm">{item.nama}</div>
                    <div className="font-tabular-nums font-bold text-xs text-text-3">Kios {item.kios}</div>
                  </th>
                  <td data-label="Tagihan" className="p-3 text-text-2 font-medium">
                    {item.tagihan}
                  </td>
                  <td data-label="Nominal" className="font-tabular-nums font-extrabold p-3 text-text">
                    {item.nominal}
                  </td>
                  <td data-label="Keputusan Verifikasi" className="p-3">
                    <Badge status={item.status} />
                  </td>
                  <td data-label="Catatan Admin" className="p-3 text-xs text-text-2">
                    {item.catatan ? (
                      <span className="italic text-red font-medium">"{item.catatan}"</span>
                    ) : (
                      <span className="text-text-3">-</span>
                    )}
                  </td>
                  <td data-label="Aksi" className="p-3 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewItem(item)}
                      aria-label={`Lihat rincian riwayat ${item.nama} (${item.kios})`}
                      className="min-h-11 sm:min-h-8 sm:h-8 px-3 text-xs font-bold"
                    >
                      Lihat
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )
        )}
      </Card>

      {/* SLIDE-OVER SHEET: Detail Verification Sheet */}
      {previewItem && (
        <Sheet
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title="Verifikasi Bukti Transfer"
          subtitle={`ID: ${previewItem.trxCode || previewItem.id}`}
          badge={<Badge status={previewItem.status} />}
          width="lg"
          footer={
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="primary"
                fullWidth
                size="md"
                className="bg-green hover:bg-green/90 min-h-11 py-2.5 px-4 text-xs sm:text-sm font-extrabold gap-2 shadow-sm whitespace-nowrap"
                onClick={() => triggerActionModal(previewItem, 'konfirmasi')}
              >
                <Icon icon="heroicons:check-circle-20-solid" className="size-4.5 shrink-0" />
                <span>Terima & Konfirmasi Lunas</span>
              </Button>
              <Button
                variant="danger"
                fullWidth
                size="md"
                className="min-h-11 py-2.5 px-4 text-xs sm:text-sm font-bold gap-2 whitespace-nowrap"
                onClick={() => triggerActionModal(previewItem, 'tolak')}
              >
                <Icon icon="heroicons:x-circle-20-solid" className="size-4.5 shrink-0" />
                <span>Tolak Bukti</span>
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 font-sans">
            <div className="bg-mono-100/60 border border-border/80 rounded-xl p-4 flex flex-col gap-1.5">
              <span className="label-micro text-text-3">Total Pembayaran</span>
              <span className="text-2xl font-extrabold text-red font-tabular-nums tracking-tight">
                {previewItem.nominal}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="label-micro text-text-3">Informasi Transaksi</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 bg-white p-4 rounded-lg text-xs border border-border/80">
                <div>
                  <span className="text-text-3 font-medium block mb-0.5">Nama Tenant</span>
                  <strong className="text-text font-bold text-sm block">{previewItem.nama} (<span className="font-tabular-nums">{previewItem.kios}</span>)</strong>
                </div>
                <div>
                  <span className="text-text-3 font-medium block mb-0.5">Jenis Tagihan</span>
                  <strong className="text-text font-bold text-sm block">{previewItem.tagihan}</strong>
                </div>
                <div>
                  <span className="text-text-3 font-medium block mb-0.5">Metode Pembayaran</span>
                  <strong className="text-text font-bold text-xs block">{previewItem.labelMetode || 'Transfer Bank Manual'}</strong>
                </div>
                <div>
                  <span className="text-text-3 font-medium block mb-0.5">Waktu Kirim</span>
                  <strong className="text-text font-bold font-tabular-nums text-xs block">{previewItem.waktu}</strong>
                </div>
              </div>
            </div>

            {previewItem.teksSanggahan && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-300/80 rounded-lg flex flex-col gap-1 text-xs">
                <div className="font-bold text-amber-800 flex items-center gap-1.5">
                  <Icon icon="heroicons:chat-bubble-bottom-center-text-20-solid" className="size-4" />
                  <span>Catatan Sanggahan dari Tenant:</span>
                </div>
                <p className="text-amber-950 italic font-semibold ps-5">"{previewItem.teksSanggahan}"</p>
              </div>
            )}

            {/* Receipt Image Preview */}
            <div className="flex flex-col gap-2">
              <label className="label-micro text-text-3">Lampiran Bukti Transfer</label>
              {previewItem.buktiUrl ? (
                <div className="w-full max-h-64 bg-mono-100/30 rounded-lg border border-border overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={(previewItem.buktiUrl.startsWith('http') || previewItem.buktiUrl.startsWith('data:')) ? previewItem.buktiUrl : (previewItem.buktiUrl.startsWith('/') ? previewItem.buktiUrl : `/${previewItem.buktiUrl}`)}
                    alt={`Bukti Transfer ${previewItem.trxCode}`}
                    loading="lazy"
                    className="max-h-60 max-w-full object-contain rounded-md shadow-xs"
                  />
                </div>
              ) : (
                <div className="w-full bg-mono-100/50 border border-border/70 rounded-lg flex items-center gap-3 p-3.5">
                  <div className="size-9 rounded-md bg-mono-200/80 flex items-center justify-center text-mono-500 shrink-0">
                    <Icon icon="heroicons:document-text-20-solid" className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs text-text font-bold block">Dokumen Bukti Transfer</span>
                    <span className="text-xs text-text-3 font-mono font-medium">[Resi Transfer_{previewItem.trxCode || previewItem.id}.jpg]</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Sheet>
      )}

      {/* Confirmation & Rejection Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: 'konfirmasi', item: null })}
        size="md"
        className="font-sans"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModal({ open: false, type: 'konfirmasi', item: null })}
            >
              Batal
            </Button>
            <Button
              variant={confirmModal.type === 'konfirmasi' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleExecuteAksi}
              className={confirmModal.type === 'konfirmasi' ? 'bg-green hover:bg-green/90' : ''}
            >
              {confirmModal.type === 'konfirmasi' ? 'Ya, Konfirmasi Lunas' : 'Ya, Tolak Bukti Ini'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={cn('size-10 rounded-full flex items-center justify-center shrink-0', confirmModal.type === 'konfirmasi' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red')}>
              <Icon icon={confirmModal.type === 'konfirmasi' ? 'heroicons:check-circle-20-solid' : 'heroicons:exclamation-triangle-20-solid'} className="size-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-text">
                Konfirmasi {confirmModal.type === 'konfirmasi' ? 'Penerimaan' : 'Penolakan'}
              </h3>
              <p className="text-xs text-text-3 font-medium">
                {confirmModal.item?.nama} ({confirmModal.item?.kios})
              </p>
            </div>
          </div>

          <p className="text-sm text-text-2">
            {confirmModal.type === 'konfirmasi'
              ? `Apakah Anda yakin ingin menyetujui bukti transfer ini? Status tagihan ${confirmModal.item?.tagihan || ''} akan otomatis diubah menjadi LUNAS.`
              : 'Harap berikan catatan alasan penolakan agar tenant dapat memperbaiki bukti atau metode pembayarannya.'}
          </p>

          {confirmModal.type === 'tolak' && (
            <div className="flex flex-col gap-2 pt-1">
              <label className="text-xs font-bold text-text flex items-center justify-between">
                <span>Catatan Alasan Penolakan <span className="text-red">*</span></span>
                <span className="text-text-3 font-normal">Wajib diisi</span>
              </label>
              <textarea
                rows={3}
                value={catatanRejection}
                onChange={(e) => {
                  setCatatanRejection(e.target.value);
                  setRejectionError('');
                }}
                placeholder="Contoh: Nominal transfer kurang Rp 50.000, atau resi buram tidak terbaca."
                className="w-full text-sm p-3 border border-border rounded-xl focus:border-red focus:outline-none bg-warm-gray/10"
              />
              {rejectionError && (
                <p className="text-xs font-bold text-red">{rejectionError}</p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default VerifikasiBuktiTransfer;
