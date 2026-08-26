import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Icon, Table, Card, Button, Badge, Modal, EmptyState, SkeletonTable, Pagination, useToast, ImageGallerySlider, cn } from '@bunsay/shared-ui';
import { resolveStorageUrl } from '@bunsay/shared-core';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function VerifikasiBuktiTransfer({ selectedTenant = null }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { httpClient } = useAdminAuth();
  const { addToast } = useToast();
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

  // Inline Sheet action state: 'idle' | 'konfirmasi' | 'tolak'
  const [sheetAction, setSheetAction] = useState('idle');
  const [catatanRejection, setCatatanRejection] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

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

  // Auto-open modal pop-up when navigated from notifications (?trx=...) or cashier setoran tunai
  useEffect(() => {
    const targetTrx = searchParams.get('trx') || searchParams.get('id');
    const targetTenant = searchParams.get('tenant') || location.state?.tenantNama;
    const cleanTargetId = targetTrx ? String(targetTrx).replace(/[^0-9]/g, '') : null;

    if (cleanTargetId || targetTenant || location.state?.autoOpen) {
      if (antrean.length > 0) {
        const match = antrean.find(item => 
          (cleanTargetId && String(item.id) === String(cleanTargetId)) ||
          (targetTenant && item.nama.toLowerCase().includes(targetTenant.toLowerCase())) ||
          (location.state?.idTagihan && String(item.id) === String(location.state.idTagihan))
        ) || (location.state?.autoOpen ? antrean[0] : null);

        if (match) {
          setActiveTab('antrean');
          setPreviewItem(match);
          setSheetAction('idle');
          return;
        }
      }

      if (riwayatProses.length > 0 && cleanTargetId) {
        const matchRiwayat = riwayatProses.find(item => String(item.id) === String(cleanTargetId));
        if (matchRiwayat) {
          setActiveTab('riwayat');
          setPreviewItem(matchRiwayat);
          setSheetAction('idle');
        }
      }
    }
  }, [antrean, riwayatProses, location.state, searchParams]);

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
    { label: 'Periode', sortKey: 'tagihan' },
    { label: 'Nominal Bayar', sortKey: 'nominal' },
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

  const handleExecuteInlineAksi = async (type) => {
    if (!previewItem) return;

    if (type === 'tolak' && !catatanRejection.trim()) {
      setRejectionError('Alasan penolakan wajib diisi agar tenant mengetahui penyebab penolakan.');
      return;
    }

    setIsProcessingAction(true);
    const statusApi = type === 'konfirmasi' ? 'Diterima' : 'Ditolak';
    try {
      await httpClient.put(`/api/v1/admin/pembayaran/${previewItem.id}/konfirmasi`, {
        status: statusApi,
        catatan_admin: type === 'tolak' ? catatanRejection.trim() : null
      });

      const processedTrx = previewItem.trxCode;
      setSheetAction('idle');
      setPreviewItem(null);
      await fetchVerifikasiQueue();

      addToast(
        `Bukti pembayaran ${processedTrx} berhasil di-${type === 'konfirmasi' ? 'setujui (Lunas)' : 'tolak dengan catatan'}.`,
        type === 'konfirmasi' ? 'success' : 'info'
      );
    } catch (err) {
      addToast(err?.response?.data?.message || 'Gagal memproses verifikasi. Coba lagi.', 'error');
    } finally {
      setIsProcessingAction(false);
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

        {/* Tab Switcher & Refresh Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVerifikasiQueue}
            disabled={isLoading}
            className="text-xs font-bold gap-1.5 h-9 px-3"
            title="Muat ulang antrean data terbaru"
          >
            <Icon icon="heroicons:arrow-path-20-solid" className={cn("size-4", isLoading && "animate-spin text-red")} />
            <span className="hidden sm:inline">Segarkan</span>
          </Button>

          <div role="tablist" aria-label="Status Antrean Verifikasi" className="flex flex-1 sm:flex-initial bg-warm-gray/60 p-1 rounded-xl border border-border">
            <button
              id="tab-antrean"
              role="tab"
              aria-selected={activeTab === 'antrean'}
              aria-controls="tabpanel-antrean"
              type="button"
              onClick={() => setActiveTab('antrean')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-3 sm:px-4 py-2 min-h-10 sm:min-h-9 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red ${
                activeTab === 'antrean'
                  ? 'bg-red text-white shadow-sm'
                  : 'text-text-2 hover:text-text hover:bg-white/50'
              }`}
            >
              <span>Antrean ({antrean.length})</span>
            </button>
            <button
              id="tab-riwayat"
              role="tab"
              aria-selected={activeTab === 'riwayat'}
              aria-controls="tabpanel-riwayat"
              type="button"
              onClick={() => setActiveTab('riwayat')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-3 sm:px-4 py-2 min-h-10 sm:min-h-9 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red ${
                activeTab === 'riwayat'
                  ? 'bg-red text-white shadow-sm'
                  : 'text-text-2 hover:text-text hover:bg-white/50'
              }`}
            >
              <span>Terproses ({riwayatProses.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container (Seamless Edge-to-Edge Surface) */}
      <div
        id={activeTab === 'antrean' ? 'tabpanel-antrean' : 'tabpanel-riwayat'}
        role="tabpanel"
        aria-labelledby={activeTab === 'antrean' ? 'tab-antrean' : 'tab-riwayat'}
        className="w-full bg-white rounded-3xl border border-border/80 shadow-card overflow-hidden flex flex-col"
      >
        {activeTab === 'antrean' ? (
          isLoading ? (
            <div className="p-6">
              <SkeletonTable rows={5} cols={5} />
            </div>
          ) : sortedAntrean.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="heroicons:document-check-20-solid"
                title="Antrean Verifikasi Kosong"
                description={selectedTenant ? `Tidak ada antrean bukti transfer untuk ${selectedTenant}.` : 'Tidak ada antrean transfer manual yang menunggu verifikasi saat ini.'}
              />
            </div>
          ) : (
            <Table
              className="border-0 rounded-none shadow-none"
              caption="Antrean Verifikasi Bukti Transfer Tenant"
              ariaLabel="Tabel Antrean Verifikasi Pembayaran Transfer Manual"
              headers={antreanHeaders}
              colSpan={5}
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
                <tr key={item.id || index} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-red-50/20 transition-colors">
                  <th scope="row" data-label="Tenant & Kios" className="py-3 px-4 text-start">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-text text-sm sm:text-base">{item.nama}</span>
                      {item.teksSanggahan && (
                        <span className="inline-flex items-center gap-1 text-2xs font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded shadow-2xs">
                          <Icon icon="heroicons:chat-bubble-left-right-20-solid" className="size-3 text-amber-700" />
                          <span>Sanggahan</span>
                        </span>
                      )}
                    </div>
                    <div className="font-tabular-nums font-extrabold text-xs text-red mt-0.5">Kios {item.kios}</div>
                  </th>
                  <td data-label="Waktu/Tanggal" className="py-3 px-4 text-text-2 font-medium text-xs font-tabular-nums">
                    {item.waktu}
                  </td>
                  <td data-label="Periode" className="py-3 px-4 text-text-2 font-medium text-xs sm:text-sm">
                    {item.tagihan}
                  </td>
                  <td data-label="Nominal Bayar" className="font-tabular-nums font-black py-3 px-4 text-text text-xs sm:text-sm">
                    {item.nominal}
                  </td>
                  <td data-label="Aksi" className="py-3 px-4 text-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setPreviewItem(item)}
                      aria-label={`Periksa bukti transfer ${item.nama} (${item.kios})`}
                      className="min-h-11 sm:min-h-8 sm:h-8 px-3.5 text-xs font-extrabold shadow-2xs"
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
            <div className="p-6">
              <SkeletonTable rows={5} cols={6} />
            </div>
          ) : sortedRiwayat.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="heroicons:clock-20-solid"
                title="Belum Ada Riwayat Terproses"
                description="Belum ada verifikasi pembayaran yang disetujui atau ditolak."
              />
            </div>
          ) : (
            <Table
              className="border-0 rounded-none shadow-none"
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
                <tr key={item.id || index} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-red-50/20 transition-colors">
                  <th scope="row" data-label="Tenant & Kios" className="py-3 px-4 text-start">
                    <div className="font-extrabold text-text text-sm sm:text-base">{item.nama}</div>
                    <div className="font-tabular-nums font-extrabold text-xs text-red mt-0.5">Kios {item.kios}</div>
                  </th>
                  <td data-label="Tagihan" className="py-3 px-4 text-text-2 font-medium text-xs sm:text-sm">
                    {item.tagihan}
                  </td>
                  <td data-label="Nominal" className="font-tabular-nums font-black py-3 px-4 text-text text-xs sm:text-sm">
                    {item.nominal}
                  </td>
                  <td data-label="Keputusan Verifikasi" className="py-3 px-4">
                    <Badge status={item.status} />
                  </td>
                  <td data-label="Catatan Admin" className="py-3 px-4 text-xs text-text-2">
                    {item.catatan ? (
                      <span className="italic text-red font-medium">"{item.catatan}"</span>
                    ) : (
                      <span className="text-text-3">-</span>
                    )}
                  </td>
                  <td data-label="Aksi" className="py-3 px-4 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewItem(item)}
                      aria-label={`Lihat rincian riwayat ${item.nama} (${item.kios})`}
                      className="min-h-11 sm:min-h-8 sm:h-8 px-3.5 text-xs font-bold shadow-2xs"
                    >
                      Lihat
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )
        )}
      </div>

      {/* MODAL: Detail Verification Modal */}
      {previewItem && (
        <Modal
          isOpen={Boolean(previewItem)}
          onClose={() => {
            setPreviewItem(null);
            setSheetAction('idle');
            setRejectionError('');
          }}
          title="Verifikasi Bukti Transfer"
          subtitle={`ID: ${previewItem.trxCode || previewItem.id}`}
          badge={<Badge status={previewItem.status} />}
          size="xl"
          footer={
            <div className="flex flex-col gap-3 w-full">
              {sheetAction === 'idle' ? (
                previewItem.status === 'Menunggu' ? (
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                    <Button
                      variant="primary"
                      fullWidth
                      size="md"
                      className="bg-green hover:bg-green/90 min-h-11 py-2.5 px-4 text-xs sm:text-sm font-extrabold gap-2 shadow-sm whitespace-nowrap"
                      onClick={() => setSheetAction('konfirmasi')}
                    >
                      <Icon icon="heroicons:check-circle-20-solid" className="size-4.5 shrink-0" />
                      <span>Terima & Konfirmasi Lunas</span>
                    </Button>
                    <Button
                      variant="danger"
                      fullWidth
                      size="md"
                      className="min-h-11 py-2.5 px-4 text-xs sm:text-sm font-bold gap-2 whitespace-nowrap"
                      onClick={() => {
                        setCatatanRejection(previewItem.catatan || '');
                        setRejectionError('');
                        setSheetAction('tolak');
                      }}
                    >
                      <Icon icon="heroicons:x-circle-20-solid" className="size-4.5 shrink-0" />
                      <span>Tolak Bukti</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-between items-center">
                    <div className="text-xs text-text-3 font-semibold text-start">
                      Status: <strong className="text-text">{previewItem.status === 'Diterima' ? 'Lunas / Diterima' : 'Ditolak'}</strong>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="font-bold text-xs"
                        onClick={() => {
                          setPreviewItem(null);
                          setSheetAction('idle');
                        }}
                      >
                        Tutup
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-bold text-xs gap-1 border-amber-300 text-amber-900 hover:bg-amber-50"
                        onClick={() => setSheetAction(previewItem.status === 'Diterima' ? 'tolak' : 'konfirmasi')}
                      >
                        <Icon icon="heroicons:arrow-path-20-solid" className="size-3.5" />
                        <span>Ubah Keputusan</span>
                      </Button>
                    </div>
                  </div>
                )
              ) : sheetAction === 'konfirmasi' ? (
                <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl flex flex-col gap-3 text-xs sm:text-sm animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <Icon icon="heroicons:check-circle-20-solid" className="size-5 text-emerald-700 shrink-0" />
                    <span>Konfirmasi Penerimaan Bukti Transfer</span>
                  </div>
                  <p className="text-text-2 font-medium leading-relaxed">
                    Tandai pembayaran senilai <strong className="text-text font-bold font-tabular-nums">{previewItem.nominal}</strong> untuk kios <strong className="text-text font-bold font-tabular-nums">{previewItem.kios}</strong> sebagai <strong className="text-emerald-700 font-bold">LUNAS (Diterima)</strong>?
                  </p>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessingAction}
                      onClick={() => setSheetAction('idle')}
                      className="text-xs font-bold min-h-9"
                    >
                      Batal
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isProcessingAction}
                      onClick={() => handleExecuteInlineAksi('konfirmasi')}
                      className="bg-green hover:bg-green/90 text-xs font-extrabold gap-1.5 min-h-9"
                    >
                      {isProcessingAction ? (
                        <Icon icon="heroicons:arrow-path-20-solid" className="size-4 animate-spin" />
                      ) : (
                        <Icon icon="heroicons:check-20-solid" className="size-4" />
                      )}
                      <span>Ya, Setujui Lunas</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-red-50/90 border border-red/20 rounded-xl flex flex-col gap-2.5 text-xs sm:text-sm animate-fade-in">
                  <div className="flex items-center justify-between font-bold text-red">
                    <span className="flex items-center gap-1.5">
                      <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-4.5 text-red shrink-0" />
                      <span>Alasan Penolakan Bukti Transfer</span>
                    </span>
                    <span className="text-2xs font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">Wajib Diisi</span>
                  </div>
                  <textarea
                    rows={2}
                    value={catatanRejection}
                    onChange={(e) => {
                      setCatatanRejection(e.target.value);
                      if (rejectionError) setRejectionError('');
                    }}
                    placeholder="Contoh: Nominal transfer kurang, atau foto resi buram/tidak terbaca."
                    className="w-full text-xs sm:text-sm p-2.5 border border-border rounded-lg focus:border-red focus:outline-none bg-white font-medium text-text"
                  />
                  {rejectionError && (
                    <span className="text-2xs font-bold text-red">{rejectionError}</span>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessingAction}
                      onClick={() => setSheetAction('idle')}
                      className="text-xs font-bold min-h-9"
                    >
                      Batal
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isProcessingAction}
                      onClick={() => handleExecuteInlineAksi('tolak')}
                      className="text-xs font-extrabold gap-1.5 min-h-9"
                    >
                      {isProcessingAction ? (
                        <Icon icon="heroicons:arrow-path-20-solid" className="size-4 animate-spin" />
                      ) : (
                        <Icon icon="heroicons:x-mark-20-solid" className="size-4" />
                      )}
                      <span>Tolak Bukti Ini</span>
                    </Button>
                  </div>
                </div>
              )}
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
                  <span className="text-text-3 font-medium block mb-0.5">Periode</span>
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
              <div className="p-3.5 bg-amber-50/80 border border-amber-300/80 rounded-lg flex flex-col gap-2.5 text-xs">
                <div className="font-bold text-amber-800 flex items-center gap-1.5">
                  <Icon icon="heroicons:chat-bubble-bottom-center-text-20-solid" className="size-4" />
                  <span>Catatan Sanggahan dari Tenant:</span>
                </div>
                <p className="text-amber-950 italic font-semibold ps-5">"{previewItem.teksSanggahan}"</p>
                {previewItem.buktiSanggahan && (
                  <div className="mt-1 ps-5">
                    <ImageGallerySlider
                      images={previewItem.buktiSanggahan}
                      resolveUrl={resolveStorageUrl}
                      title="Foto Lampiran Sanggahan"
                      maxHeightClass="max-h-52"
                      badgePrefix="Sanggahan #"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Receipt Image Preview */}
            <div className="flex flex-col gap-2">
              <label className="label-micro text-text-3">Lampiran Bukti Transfer</label>
              {previewItem.buktiUrl ? (
                <div className="w-full max-h-64 bg-mono-100/30 rounded-lg border border-border overflow-hidden flex items-center justify-center p-2">
                  <button
                    type="button"
                    onClick={() => window.open(resolveStorageUrl(previewItem.buktiUrl), '_blank')}
                    aria-label={`Buka lampiran bukti transfer ${previewItem.trxCode || ''} dalam ukuran penuh di tab baru`}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red rounded-md"
                    title="Klik untuk membuka ukuran penuh di tab baru"
                  >
                    <img
                      src={resolveStorageUrl(previewItem.buktiUrl)}
                      alt={`Bukti Transfer ${previewItem.trxCode}`}
                      loading="lazy"
                      className="max-h-60 max-w-full object-contain rounded-md shadow-xs"
                    />
                  </button>
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
        </Modal>
      )}
    </div>
  );
}

export default VerifikasiBuktiTransfer;
