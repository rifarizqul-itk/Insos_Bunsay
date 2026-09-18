import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Icon, EmptyState, SkeletonTable, BuktiPembayaranModal, UploadBuktiSusulanModal, Pagination, useToast, formatDateTimeLocal, cn } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../../public/useTenantAuth';
import SanggahanModal from './SanggahanModal';

/**
 * Normalisasi satu baris API pembayaran menjadi bentuk tampilan.
 */
function mapPaymentRow(item) {
  return {
    id: `TRX-${item.Id_Pembayaran}`,
    idReal: item.Id_Pembayaran,
    periode: item.tagihan?.Periode ? `Sewa Kios ${item.tagihan.Periode}` : (item.Periode ? `Sewa Kios ${item.Periode}` : 'Sewa Kios'),
    tanggal: item.Tanggal_Bayar || '-',
    waktu: item.created_at || item.Tanggal_Bayar || '-',
    nominalAngka: Number(item.Total_Bayar || 0),
    metode: item.Metode_Bayar || 'Transfer',
    status: item.Verifikasi_Pembayaran || 'Menunggu',
    buktiUrl: item.Bukti_Pembayaran || '',
    nama: item.tagihan?.sewa?.pemilik?.Nama || 'Tenant',
    kios: item.tagihan?.sewa?.kios?.No_Kios || '',
    catatanAdmin: item.catatan_admin || '',
    teksSanggahan: item.teks_sanggahan || '',
    buktiSanggahan: item.bukti_sanggahan || '',
  };
}

function HistoriPembayaran() {
  const { httpClient } = useTenantAuth();
  const { addToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetode, setSelectedMetode] = useState('Semua');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedUploadRow, setSelectedUploadRow] = useState(null);
  const [sanggahanModalItem, setSanggahanModalItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Pagination (server-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Sort (server-side)
  const [sortConfig, setSortConfig] = useState({ key: 'tanggal', direction: 'desc' });

  // Debounce search input → server query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchHistory = async (page = currentPage, size = pageSize, metode = selectedMetode, search = debouncedQuery, sort = sortConfig) => {
    setLoading(true);
    try {
      const params = { page, page_size: size, sort_by: sort.key, sort_dir: sort.direction };
      if (metode !== 'Semua') params.metode = metode;
      if (search) params.q = search;

      const res = await httpClient.get('/api/v1/tenant/pembayaran', { params });
      const rows = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
      const mapped = rows.map(mapPaymentRow);
      setHistory(mapped);
      setTotalItems(res?.data?.total ?? mapped.length);
      setLastPage(res?.data?.last_page ?? 1);
    } catch (err) {
      console.warn('Error fetching tenant history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1, pageSize, selectedMetode, debouncedQuery, sortConfig);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, debouncedQuery, sortConfig]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchHistory(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchHistory(1, size);
  };

  const handleMetodeChange = (metode) => {
    setSelectedMetode(metode);
    setCurrentPage(1);
    fetchHistory(1, pageSize, metode);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleOpenSanggahanModal = (item) => {
    setSanggahanModalItem(item);
  };

  const handleSanggahanSubmitted = async () => {
    addToast('Sanggahan berhasil dikirim', 'success');
    await fetchHistory();
  };

  const tableHeaders = [
    { label: 'ID Transaksi', sortKey: 'id', className: 'hidden sm:table-cell' },
    { label: 'Periode & Tanggal', sortKey: 'tanggal' },
    { label: 'Nominal Bayar', sortKey: 'nominal' },
    { label: 'Metode', className: 'hidden md:table-cell' },
    { label: 'Status', align: 'center', sortKey: 'status' },
    { label: 'Resi & Bukti', align: 'center', sortable: false }
  ];

  return (
    <div data-slot="histori-pembayaran" className="page-fade-in flex flex-col gap-4 sm:gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text text-balance">
            Histori Pembayaran
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Icon
              icon="heroicons:magnifying-glass-20-solid"
              className="size-4 text-text-3 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari TRX / kode bukti…"
              aria-label="Cari transaksi berdasarkan nomor atau kode bukti"
              className="h-9 w-full sm:w-56 rounded-lg border border-border bg-white ps-9 pe-3 text-xs sm:text-sm font-semibold text-text placeholder:text-text-3 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-red shadow-xs"
            />
          </div>
          <label htmlFor="filter-metode" className="text-xs font-semibold text-text-2 shrink-0 hidden sm:block">
            Metode:
          </label>
          <select
            id="filter-metode"
            value={selectedMetode}
            onChange={(e) => handleMetodeChange(e.target.value)}
            className="h-9 rounded-lg border border-border bg-white pl-3 pr-8 text-xs sm:text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red cursor-pointer shadow-xs"
          >
            <option value="Semua">Semua Metode</option>
            <option value="Transfer">Transfer Bank</option>
            <option value="Tunai">Tunai (Loket)</option>
            <option value="Midtrans">Midtrans Gateway</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : history.length === 0 ? (
          <div className="bg-white border border-border/80 rounded-2xl p-6 sm:p-10 shadow-xs">
            <EmptyState
              icon="heroicons:receipt-refund-20-solid"
              title={selectedMetode !== 'Semua' ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
              description={selectedMetode !== 'Semua' ? `Tidak ditemukan transaksi dengan metode "${selectedMetode}".` : "Pembayaran sewa kios Anda akan otomatis tercatat di sini."}
              actionLabel={selectedMetode !== 'Semua' ? "Reset Filter Metode" : undefined}
              onAction={selectedMetode !== 'Semua' ? () => handleMetodeChange('Semua') : undefined}
            />
          </div>
        ) : (
          <>
            {/* Tampilan Desktop: Tabel Lengkap */}
            <div className="hidden md:block">
              <Table
                caption="Tabel Histori Pembayaran Tenant"
                ariaLabel="Daftar Histori Transaksi Pembayaran Tenant"
                headers={tableHeaders}
                colSpan={6}
                sortConfig={sortConfig}
                onSort={handleSort}
                footer={
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    itemName="transaksi"
                  />
                }
              >
                {history.map((row, idx) => {
                  const formattedWaktu = formatDateTimeLocal(row.waktu || row.tanggal);
                  return (
                    <tr key={row.id || idx} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-warm-gray/20 transition-colors">
                      <th scope="row" className="font-mono font-black text-xs sm:text-sm p-3 text-text text-start">
                        {row.id}
                      </th>
                      <td className="p-3 text-start">
                        <div className="font-semibold text-text text-xs sm:text-sm">{row.periode || 'Sewa Kios'}</div>
                        <div className="text-text-2 font-medium text-xs font-tabular-nums" title={formattedWaktu.fullTitle}>
                          {formattedWaktu.formatted}
                        </div>
                      </td>
                      <td className="font-tabular-nums font-black p-3 text-text whitespace-nowrap text-xs sm:text-sm">
                        Rp {row.nominalAngka.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-text font-bold text-xs sm:text-sm">
                        {row.metode === 'Midtrans' ? 'Midtrans Gateway' : row.metode === 'Transfer' ? 'Transfer Bank' : row.metode === 'Tunai' ? 'Tunai Loket' : row.metode}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col gap-1 items-center justify-center">
                          <Badge status={row.status} />
                          {row.status === 'Ditolak' && (
                            <Button
                              variant="warning"
                              size="xs"
                              onClick={() => handleOpenSanggahanModal(row)}
                              className="text-2xs font-extrabold gap-1 px-2 py-1 shadow-2xs mt-1"
                            >
                              <Icon icon="heroicons:chat-bubble-left-right-20-solid" className="size-3" />
                              <span>Sanggah</span>
                            </Button>
                          )}
                        </div>
                        {row.status === 'Ditolak' && row.catatanAdmin && (
                          <div className="mt-1 p-1.5 bg-red-50 border border-red/20 rounded-md text-2xs text-red font-medium text-start">
                            Alasan: "{row.catatanAdmin}"
                          </div>
                        )}
                        {row.teksSanggahan && (
                          <div className="mt-1 p-1.5 bg-amber-50 border border-amber-200 rounded-md text-2xs text-amber-900 font-semibold flex flex-col gap-0.5 text-start">
                            <span>Sanggahan: "{row.teksSanggahan}"</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {(() => {
                          const isTunaiWithoutPhoto = (row.metode === 'Tunai' || String(row.buktiUrl).startsWith('LOKET-CASH') || !row.buktiUrl) && (!row.buktiUrl || row.buktiUrl === 'LOKET-CASH-CLAIM' || String(row.buktiUrl).startsWith('LOKET-CASH'));
                          const canUploadPhoto = isTunaiWithoutPhoto || row.status === 'Ditolak';
                          return (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedReceipt(row)}
                                aria-label={`Lihat rincian transaksi ${row.id}`}
                                className="font-bold text-xs gap-1.5 px-3 py-1.5 shadow-2xs"
                              >
                                {row.metode === 'Midtrans' ? (
                                  <>
                                    <Icon icon="heroicons:bolt-20-solid" className="size-3.5 text-orange" />
                                    <span>Resi Digital</span>
                                  </>
                                ) : row.metode === 'Tunai' ? (
                                  <>
                                    <Icon icon="heroicons:document-text-20-solid" className="size-3.5 text-amber-700" />
                                    <span>Rincian</span>
                                  </>
                                ) : (
                                  <>
                                    <Icon icon="heroicons:photo-20-solid" className="size-3.5 text-green" />
                                    <span>Foto Bukti</span>
                                  </>
                                )}
                              </Button>
                              {canUploadPhoto && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedUploadRow(row)}
                                  aria-label={`Unggah foto bukti untuk ${row.id}`}
                                  className="font-bold text-xs gap-1 px-2.5 py-1.5 border-red/40 text-red hover:bg-red-50"
                                >
                                  <Icon icon="heroicons:camera-20-solid" className="size-3.5" />
                                  <span>+ Foto</span>
                                </Button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </Table>
            </div>

            {/* Tampilan Mobile: Modern Spacious Transaction Feed (Design 1 Reference) */}
            <div className="block md:hidden flex flex-col gap-3">
              {history.map((row, idx) => {
                const isMidtrans = row.metode === 'Midtrans';
                const isTunai = row.metode === 'Tunai';
                const formattedWaktu = formatDateTimeLocal(row.waktu || row.tanggal);
                
                const methodLabel = isMidtrans ? 'Midtrans Gateway' : isTunai ? 'Setoran Tunai' : 'Transfer Bank';
                const iconName = isMidtrans ? 'heroicons:qr-code-20-solid' : isTunai ? 'heroicons:banknotes-20-solid' : 'heroicons:building-library-20-solid';
                const iconBg = isMidtrans ? 'bg-orange-50 text-orange border-orange-200/80' : isTunai ? 'bg-amber-50 text-amber-800 border-amber-200/80' : 'bg-red-50 text-red border-red/20';

                return (
                  <div
                    key={row.id || idx}
                    onClick={() => setSelectedReceipt(row)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedReceipt(row); } }}
                    className="p-4 bg-white border border-border/80 rounded-2xl shadow-2xs hover:border-red/40 hover:shadow-xs active:bg-mono-50/80 transition-all cursor-pointer select-none flex flex-col gap-3.5"
                    aria-label={`Transaksi ${row.id} sebesar Rp ${row.nominalAngka.toLocaleString('id-ID')}, status ${row.status}. Ketuk untuk melihat rincian.`}
                  >
                    {/* Top Row: Icon + Method & ID + Status Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs", iconBg)}>
                          <Icon icon={iconName} className="size-5" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <strong className="text-sm font-extrabold text-text tracking-tight truncate leading-tight">
                            {methodLabel}
                          </strong>
                          <div className="flex items-center gap-1.5 text-xs text-text-3 font-semibold mt-0.5">
                            <span className="font-tabular-nums">{row.id}</span>
                            {row.kios && (
                              <>
                                <span className="text-mono-300">•</span>
                                <span className="text-text-2 font-bold font-tabular-nums">Kios {row.kios}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Badge status={row.status} />
                      </div>
                    </div>

                    {/* Bottom Row: Date on Left + Amount & Actions on Right */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-3 font-tabular-nums" title={formattedWaktu.fullTitle}>
                        <Icon icon="heroicons:calendar-20-solid" className="size-3.5 text-mono-400 shrink-0" />
                        <span>{formattedWaktu.formatted}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-extrabold font-tabular-nums text-text whitespace-nowrap">
                          Rp {row.nominalAngka.toLocaleString('id-ID')}
                        </span>
                        {(() => {
                          const isTunaiWithoutPhoto = (row.metode === 'Tunai' || String(row.buktiUrl).startsWith('LOKET-CASH') || !row.buktiUrl) && (!row.buktiUrl || row.buktiUrl === 'LOKET-CASH-CLAIM' || String(row.buktiUrl).startsWith('LOKET-CASH'));
                          const canUploadPhoto = isTunaiWithoutPhoto || row.status === 'Ditolak';
                          return canUploadPhoto ? (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUploadRow(row);
                              }}
                              className="font-bold text-2xs px-2 py-1 border-red/40 text-red hover:bg-red-50 gap-1"
                            >
                              <Icon icon="heroicons:camera-20-solid" className="size-3" />
                              <span>+ Foto</span>
                            </Button>
                          ) : null;
                        })()}
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-mono-100 hover:bg-red-50 text-red text-xs font-extrabold transition-colors">
                          <span>Detail</span>
                          <Icon icon="heroicons:chevron-right-20-solid" className="size-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Sanggahan & Rejection Info for Mobile */}
                    {row.status === 'Ditolak' && (
                      <div className="pt-2 border-t border-border/50 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        {row.catatanAdmin && (
                          <div className="p-2.5 bg-red-50 border border-red/20 rounded-lg text-xs text-red font-bold flex items-center gap-2">
                            <Icon icon="heroicons:exclamation-circle-20-solid" className="size-4 shrink-0 text-red" />
                            <span>Alasan Tolak: "{row.catatanAdmin}"</span>
                          </div>
                        )}
                        <Button
                          variant="warning"
                          size="sm"
                          fullWidth
                          onClick={() => handleOpenSanggahanModal(row)}
                          className="min-h-10 text-xs sm:text-sm font-extrabold gap-1.5 shadow-2xs"
                        >
                          <Icon icon="heroicons:chat-bubble-left-right-20-solid" className="size-4" />
                          <span>Kirim Sanggahan Pembayaran</span>
                        </Button>
                      </div>
                    )}

                    {row.teksSanggahan && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-semibold flex flex-col gap-1">
                        <div className="flex items-start gap-1.5">
                          <Icon icon="heroicons:chat-bubble-bottom-center-text-20-solid" className="size-4 text-amber-700 shrink-0 mt-0.5" />
                          <span>Sanggahan Anda: "{row.teksSanggahan}"</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Pagination Control */}
            <div className="block md:hidden">
              <div className="bg-white p-3 border border-border/80 rounded-xl shadow-2xs">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  itemName="transaksi"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Detail & Bukti Pembayaran */}
      <BuktiPembayaranModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        item={selectedReceipt}
        onUploadBukti={(item) => setSelectedUploadRow(item)}
      />

      {/* Modal Upload Bukti Susulan */}
      <UploadBuktiSusulanModal
        isOpen={Boolean(selectedUploadRow)}
        onClose={() => setSelectedUploadRow(null)}
        pembayaran={selectedUploadRow}
        uploadEndpoint={selectedUploadRow ? `/api/v1/tenant/pembayaran/${String(selectedUploadRow.id).replace(/[^0-9]/g, '')}/bukti` : ''}
        httpClient={httpClient}
        onSuccess={() => {
          fetchHistory();
        }}
      />


      {/* Modal Form Sanggahan */}
      <SanggahanModal
        item={sanggahanModalItem}
        onClose={() => setSanggahanModalItem(null)}
        onSubmit={handleSanggahanSubmitted}
        httpClient={httpClient}
      />
    </div>
  );
}

export default HistoriPembayaran;
