import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Badge, Button, Icon, Modal, FormField, EmptyState, SkeletonTable, BuktiPembayaranModal, Pagination, useToast, formatDateTimeLocal, cn } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../../public/useTenantAuth';

function HistoriPembayaran() {
  const { httpClient } = useTenantAuth();
  const { addToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetode, setSelectedMetode] = useState('Semua');
  const [toastMsg, setToastMsg] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Table Sort State
  const [sortConfig, setSortConfig] = useState({ key: 'idReal', direction: 'desc' });

  // Rebuttal Modal State
  const [sanggahanModalItem, setSanggahanModalItem] = useState(null);
  const [teksSanggahan, setTeksSanggahan] = useState('');
  const [buktiSanggahanFile, setBuktiSanggahanFile] = useState(null);
  const [previewBuktiSanggahan, setPreviewBuktiSanggahan] = useState(null);
  const [isSubmittingSanggahan, setIsSubmittingSanggahan] = useState(false);
  const [sanggahanError, setSanggahanError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await httpClient.get('/api/v1/tenant/pembayaran');
      if (res?.data && Array.isArray(res.data)) {
        const mapped = res.data.map(item => ({
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
          alokasi: []
        }));
        setHistory(mapped);
      }
    } catch (err) {
      console.warn('Error fetching tenant history:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchHistory();
  }, [httpClient]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredHistory = useMemo(() => {
    let list = history.filter(item => {
      if (selectedMetode === 'Semua') return true;
      return item.metode === selectedMetode;
    });

    const { key, direction } = sortConfig;
    return [...list].sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (key === 'nominal') {
        valA = a.nominalAngka || 0;
        valB = b.nominalAngka || 0;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      return direction === 'asc'
        ? String(valA).localeCompare(String(valB), undefined, { numeric: true })
        : String(valB).localeCompare(String(valA), undefined, { numeric: true });
    });
  }, [history, selectedMetode, sortConfig]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiSanggahanFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewBuktiSanggahan(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenSanggahanModal = (item) => {
    setSanggahanModalItem(item);
    setTeksSanggahan('');
    setBuktiSanggahanFile(null);
    setPreviewBuktiSanggahan(null);
    setSanggahanError('');
  };

  const handleKirimSanggahan = async (e) => {
    e.preventDefault();
    if (!teksSanggahan.trim()) {
      setSanggahanError('Penjelasan sanggahan wajib diisi.');
      return;
    }

    setIsSubmittingSanggahan(true);
    setSanggahanError('');

    try {
      const formData = new FormData();
      formData.append('teks_sanggahan', teksSanggahan);
      if (buktiSanggahanFile) {
        formData.append('bukti_sanggahan', buktiSanggahanFile);
      }

      await httpClient.post(`/api/v1/tenant/pembayaran/${sanggahanModalItem.idReal}/sanggahan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSanggahanModalItem(null);
      addToast('Sanggahan berhasil dikirim', 'success');
      await fetchHistory();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Gagal mengirim sanggahan. Coba lagi.', 'error');
    } finally {
      setIsSubmittingSanggahan(false);
    }
  };

  const tableHeaders = [
    { label: 'ID Transaksi', sortKey: 'idReal', className: 'hidden sm:table-cell' },
    { label: 'Periode & Tanggal', sortKey: 'tanggal' },
    { label: 'Nominal Bayar', sortKey: 'nominal' },
    { label: 'Metode', sortKey: 'metode', className: 'hidden md:table-cell' },
    { label: 'Status', align: 'center', sortKey: 'status' },
    { label: 'Resi & Bukti', align: 'center', sortable: false }
  ];

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredHistory.slice(startIndex, startIndex + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  return (
    <div data-slot="histori-pembayaran" className="page-fade-in flex flex-col gap-4 sm:gap-6 font-sans">
      {toastMsg && (
        <div className="bg-red text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-xs flex items-center justify-between animate-fade-in border border-red-rich">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-4.5 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            aria-label="Tutup notifikasi error"
            className="text-white hover:opacity-80 p-1 cursor-pointer"
          >
            <Icon icon="heroicons:x-mark-20-solid" className="size-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text text-balance">
            Histori Pembayaran
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-metode" className="text-xs font-semibold text-text-2 shrink-0">
            Metode:
          </label>
          <select
            id="filter-metode"
            value={selectedMetode}
            onChange={(e) => {
              setSelectedMetode(e.target.value);
              setCurrentPage(1);
            }}
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
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white border border-border/80 rounded-2xl p-6 sm:p-10 shadow-xs">
            <EmptyState
              icon="heroicons:receipt-refund-20-solid"
              title={selectedMetode !== 'Semua' ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
              description={selectedMetode !== 'Semua' ? `Tidak ditemukan transaksi dengan metode "${selectedMetode}".` : "Pembayaran sewa kios Anda akan otomatis tercatat di sini."}
              actionLabel={selectedMetode !== 'Semua' ? "Reset Filter Metode" : undefined}
              onAction={selectedMetode !== 'Semua' ? () => { setSelectedMetode('Semua'); setCurrentPage(1); } : undefined}
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
                    totalItems={filteredHistory.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    itemName="transaksi"
                  />
                }
              >
                {paginatedHistory.map((row, idx) => {
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
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedReceipt(row)}
                          aria-label={`Lihat bukti atau resi transaksi ${row.id}`}
                          className="font-bold text-xs gap-1.5 px-3 py-1.5"
                        >
                          {row.metode === 'Midtrans' ? (
                            <>
                              <Icon icon="heroicons:bolt-20-solid" className="size-3.5 text-orange" />
                              <span>Resi Digital</span>
                            </>
                          ) : row.metode === 'Tunai' ? (
                            <>
                              <Icon icon="heroicons:document-text-20-solid" className="size-3.5 text-amber-700" />
                              <span>Kuitansi</span>
                            </>
                          ) : (
                            <>
                              <Icon icon="heroicons:photo-20-solid" className="size-3.5 text-green" />
                              <span>Foto Bukti</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            </div>

            {/* Tampilan Mobile: Modern Spacious Transaction Feed (Design 1 Reference) */}
            <div className="block md:hidden flex flex-col gap-3">
              {paginatedHistory.map((row, idx) => {
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
                    aria-label={`Transaksi ${row.id} sebesar Rp ${row.nominalAngka.toLocaleString('id-ID')}, status ${row.status}. Ketuk untuk melihat resi.`}
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

                    {/* Bottom Row: Date on Left + Amount & Resi Button on Right */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-3 font-tabular-nums" title={formattedWaktu.fullTitle}>
                        <Icon icon="heroicons:calendar-20-solid" className="size-3.5 text-mono-400 shrink-0" />
                        <span>{formattedWaktu.formatted}</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-sm sm:text-base font-extrabold font-tabular-nums text-text whitespace-nowrap">
                          Rp {row.nominalAngka.toLocaleString('id-ID')}
                        </span>
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-mono-100 hover:bg-red-50 text-red text-xs font-extrabold transition-colors">
                          <span>Resi</span>
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
                          <span>Ajukan Sanggahan</span>
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

              <div className="p-4 bg-white border border-border/80 rounded-2xl shadow-2xs mt-1">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredHistory.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  itemName="transaksi"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Resi & Bukti Pembayaran */}
      <BuktiPembayaranModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        item={selectedReceipt}
      />


      {/* Modal Form Sanggahan */}
      {sanggahanModalItem && (
        <Modal
          isOpen={Boolean(sanggahanModalItem)}
          onClose={() => setSanggahanModalItem(null)}
          disableBackdropClick={true}
          title="Ajukan Sanggahan Pembayaran"
          size="md"
          footer={
            <div className="flex gap-3 w-full">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setSanggahanModalItem(null)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={isSubmittingSanggahan}
                onClick={handleSubmitSanggahan}
                className="bg-amber-500 hover:bg-amber-600 border-none font-extrabold text-white"
              >
                {isSubmittingSanggahan ? 'Mengirim...' : 'Kirim Sanggahan'}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4 font-sans">
            <div className="bg-red-50 border border-red/30 rounded-xl p-3.5 text-xs text-red leading-relaxed flex gap-2 items-start">
              <Icon icon="heroicons:exclamation-triangle-20-solid" width="20" height="20" className="flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5 text-red">Catatan Penolakan dari Admin:</strong>
                "{sanggahanModalItem.catatanAdmin || 'Bukti transfer tidak terbaca / nominal kurang.'}"
              </div>
            </div>

            <FormField label="Alasan Sanggahan" id="teks-sanggahan-field" required error={sanggahanError}>
              <textarea
                rows={3}
                value={teksSanggahan}
                onChange={(e) => {
                  setTeksSanggahan(e.target.value);
                  setSanggahanError('');
                }}
                placeholder="Jelaskan alasan sanggahan (Contoh: Pembayaran sudah sesuai resi / sudah transfer ulang selisih Rp 50.000)."
                className="w-full text-sm p-3 border border-border rounded-xl focus:border-amber-500 focus:outline-none bg-warm-gray/10 font-medium"
              />
            </FormField>

            <FormField label="Foto Bukti Perbaikan (Opsional)" id="bukti-sanggahan-field">
              <input
                id="bukti-sanggahan-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <label
                htmlFor="bukti-sanggahan-input"
                className="flex flex-col items-center justify-center gap-1.5 bg-warm-gray/50 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer text-center hover:border-amber-500 transition-all"
              >
                <Icon icon="heroicons:arrow-up-tray-20-solid" className="size-6 text-amber-600" />
                <span className="text-xs font-bold text-text">
                  {buktiSanggahanFile ? buktiSanggahanFile.name : 'Upload Foto Bukti Baru'}
                </span>
                <span className="text-xs text-text-3">Format JPG, PNG, atau WEBP</span>
              </label>
              {previewBuktiSanggahan && (
                <div className="mt-2 border border-border rounded-lg p-2 bg-warm-gray/30 flex justify-center">
                  <img src={previewBuktiSanggahan} alt="Preview Bukti Sanggahan" loading="lazy" className="max-h-36 rounded object-contain" />
                </div>
              )}
            </FormField>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default HistoriPembayaran;
