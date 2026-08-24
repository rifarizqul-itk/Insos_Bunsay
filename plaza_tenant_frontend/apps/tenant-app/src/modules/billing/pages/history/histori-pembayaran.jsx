import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Badge, Button, Icon, Modal, FormField, EmptyState, SkeletonTable, BuktiPembayaranModal, Pagination, useToast, cn } from '@bunsay/shared-ui';
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
          tanggal: item.Tanggal_Bayar || '-',
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

  const handleSubmitSanggahan = async () => {
    if (!teksSanggahan.trim()) {
      setSanggahanError('Alasan sanggahan wajib diisi.');
      return;
    }

    setIsSubmittingSanggahan(true);
    try {
      await httpClient.post(`/api/v1/tenant/pembayaran/${sanggahanModalItem.idReal}/sanggah`, {
        teks_sanggahan: teksSanggahan.trim(),
        bukti_sanggahan: previewBuktiSanggahan || null
      });

      setSanggahanModalItem(null);
      addToast('Sanggahan pembayaran Anda berhasil dikirim! Status kembali Menunggu Verifikasi.', 'success');
      await fetchHistory();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Gagal mengirim sanggahan. Coba lagi.', 'error');
    } finally {
      setIsSubmittingSanggahan(false);
    }
  };

  const tableHeaders = [
    { label: 'ID Transaksi', sortKey: 'idReal', className: 'hidden sm:table-cell' },
    { label: 'Tanggal', sortKey: 'tanggal' },
    { label: 'Nominal Bayar', sortKey: 'nominal' },
    { label: 'Metode', sortKey: 'metode', className: 'hidden md:table-cell' },
    { label: 'Resi & Bukti', align: 'center', sortable: false },
    { label: 'Status & Keterangan', sortKey: 'status' }
  ];

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredHistory.slice(startIndex, startIndex + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  return (
    <div data-slot="histori-pembayaran" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {toastMsg && (
        <div className="bg-emerald-600 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:check-circle-20-solid" className="size-5" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            aria-label="Tutup notifikasi"
            className="text-white hover:opacity-80 p-1 cursor-pointer"
          >
            <Icon icon="heroicons:x-mark-20-solid" className="size-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Histori Pembayaran
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
            Daftar seluruh transaksi pembayaran sewa kios yang pernah Anda lakukan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-metode" className="text-xs font-bold text-text-2 shrink-0">
            Metode:
          </label>
          <select
            id="filter-metode"
            value={selectedMetode}
            onChange={(e) => {
              setSelectedMetode(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-md border border-border bg-white pl-3.5 pr-9 text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red cursor-pointer"
          >
            <option value="Semua">Semua Metode</option>
            <option value="Transfer">Transfer Bank</option>
            <option value="Tunai">Tunai (Loket)</option>
            <option value="Midtrans">Midtrans Gateway</option>
          </select>
        </div>
      </div>

      <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-5">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            icon="heroicons:receipt-refund-20-solid"
            title="Belum Ada Riwayat Transaksi"
            description="Riwayat pembayaran sewa kios Anda akan otomatis tercatat di sini setelah melakukan pembayaran."
          />
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
                {paginatedHistory.map((row, idx) => (
                  <tr key={row.id || idx} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-warm-gray/20 transition-colors">
                    <th scope="row" className="font-tabular-nums font-bold p-3 text-text text-start">
                      {row.id}
                    </th>
                    <td className="p-3 text-text-2 font-medium text-xs font-tabular-nums">
                      {row.tanggal}
                    </td>
                    <td className="font-tabular-nums font-extrabold p-3 text-text">
                      Rp {row.nominalAngka.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-text font-bold">
                      {row.metode === 'Midtrans' ? 'Midtrans Gateway' : row.metode === 'Transfer' ? 'Transfer Bank' : row.metode === 'Tunai' ? 'Tunai Loket' : row.metode}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(row)}
                        aria-label={`Lihat bukti atau resi transaksi ${row.id}`}
                        className="min-h-8 h-8 text-xs font-bold gap-1.5 px-3 border-border hover:border-red hover:text-red transition-all"
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
                    <td className="p-3">
                      <div className="flex flex-col gap-2 items-start">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge status={row.status} />
                          {row.status === 'Ditolak' && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleOpenSanggahanModal(row)}
                              className="min-h-8 h-8 text-xs font-extrabold gap-1.5 px-2.5 shadow-2xs"
                            >
                              <Icon icon="heroicons:chat-bubble-left-right-20-solid" className="size-3.5" />
                              <span>Ajukan Sanggahan</span>
                            </Button>
                          )}
                        </div>
                        {row.status === 'Ditolak' && row.catatanAdmin && (
                          <div className="p-2 bg-red-50 border border-red/20 rounded-md text-xs text-red font-bold flex items-center gap-1.5 w-full">
                            <Icon icon="heroicons:exclamation-circle-20-solid" className="size-4 shrink-0 text-red" />
                            <span>Alasan Tolak: "{row.catatanAdmin}"</span>
                          </div>
                        )}
                        {row.teksSanggahan && (
                          <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 font-semibold flex flex-col gap-1 w-full">
                            <div className="flex items-start gap-1.5">
                              <Icon icon="heroicons:chat-bubble-bottom-center-text-20-solid" className="size-4 text-amber-700 shrink-0 mt-0.5" />
                              <span>Sanggahan Anda: "{row.teksSanggahan}"</span>
                            </div>
                            {row.buktiSanggahan && (
                              <span className="ps-5.5 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                                <Icon icon="heroicons:paper-clip-20-solid" className="size-3.5" />
                                <span>Lampiran foto sanggahan disertakan (terlampir di berkas resi)</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Tampilan Mobile: BRImo-Style Activity List Card */}
            <div className="block md:hidden flex flex-col divide-y divide-border/70 border border-border/80 rounded-2xl overflow-hidden bg-white shadow-card">
              {paginatedHistory.map((row, idx) => {
                const isMidtrans = row.metode === 'Midtrans';
                const isTunai = row.metode === 'Tunai';
                
                const methodLabel = isMidtrans ? 'Pembayaran Otomatis' : isTunai ? 'Setoran Tunai (Loket)' : 'Transfer Bank (Manual)';
                const iconName = isMidtrans ? 'heroicons:qr-code-20-solid' : isTunai ? 'heroicons:banknotes-20-solid' : 'heroicons:building-library-20-solid';
                const iconBg = isMidtrans ? 'bg-orange-50 text-orange border-orange-200' : isTunai ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-red-50 text-red border-red/20';

                return (
                  <div
                    key={row.id || idx}
                    onClick={() => setSelectedReceipt(row)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedReceipt(row); } }}
                    className="p-4 flex flex-col gap-3 hover:bg-mono-50/60 active:bg-mono-100/80 transition-colors cursor-pointer select-none"
                    aria-label={`Transaksi ${row.id} sebesar Rp ${row.nominalAngka.toLocaleString('id-ID')}, status ${row.status}. Ketuk untuk melihat resi.`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Icon Box & Transaction Details */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-2xs", iconBg)}>
                          <Icon icon={iconName} className="size-5" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <strong className="text-sm font-extrabold text-text tracking-tight truncate leading-tight">
                            {methodLabel}
                          </strong>
                          <span className="text-xs text-text-3 font-semibold truncate mt-0.5">
                            {row.id}{row.kios ? ` • Kios ${row.kios}` : ''}
                          </span>
                          <span className="text-sm font-extrabold font-tabular-nums text-text mt-1.5">
                            Rp {row.nominalAngka.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] text-text-3 font-medium font-tabular-nums mt-0.5">
                            {row.tanggal}
                          </span>
                        </div>
                      </div>

                      {/* Right: Status Badge & Chevron */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge status={row.status} />
                        <div className="flex items-center gap-1 text-xs font-bold text-red hover:underline pt-1">
                          <span>Resi</span>
                          <Icon icon="heroicons:chevron-right-20-solid" className="size-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Sanggahan & Rejection Info for Mobile */}
                    {row.status === 'Ditolak' && (
                      <div className="mt-1 pt-2 border-t border-border/50 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
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
                          className="min-h-9 h-9 text-xs font-extrabold gap-1.5 shadow-2xs"
                        >
                          <Icon icon="heroicons:chat-bubble-left-right-20-solid" className="size-3.5" />
                          <span>Ajukan Sanggahan</span>
                        </Button>
                      </div>
                    )}

                    {row.teksSanggahan && (
                      <div className="mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-semibold flex flex-col gap-1">
                        <div className="flex items-start gap-1.5">
                          <Icon icon="heroicons:chat-bubble-bottom-center-text-20-solid" className="size-4 text-amber-700 shrink-0 mt-0.5" />
                          <span>Sanggahan Anda: "{row.teksSanggahan}"</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="p-3 bg-mono-50/50 border-t border-border/70">
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
      </Card>

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
          title={`Form Sanggahan ${sanggahanModalItem.id}`}
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
                {isSubmittingSanggahan ? 'Kirim Sanggahan...' : 'Kirim Sanggahan'}
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

            <FormField label="Alasan Sanggahan Anda" id="teks-sanggahan-field" required error={sanggahanError}>
              <textarea
                rows={3}
                value={teksSanggahan}
                onChange={(e) => {
                  setTeksSanggahan(e.target.value);
                  setSanggahanError('');
                }}
                placeholder="Jelaskan alasan sanggahan Anda (Contoh: Pembayaran sudah sesuai dengan resi terlampir / sudah transfer ulang kekurangan Rp 50.000)."
                className="w-full text-sm p-3 border border-border rounded-xl focus:border-amber-500 focus:outline-none bg-warm-gray/10 font-medium"
              />
            </FormField>

            <FormField label="Foto Bukti Transfer Baru / Perbaikan (Opsional)" id="bukti-sanggahan-field">
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
                  {buktiSanggahanFile ? buktiSanggahanFile.name : 'Upload Foto Resi Baru'}
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
