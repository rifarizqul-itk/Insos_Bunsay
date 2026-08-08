import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Badge, Button, Icon, Modal, FormField, EmptyState, SkeletonTable } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../../public/useTenantAuth';

function HistoriPembayaran() {
  const { httpClient } = useTenantAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetode, setSelectedMetode] = useState('Semua');
  const [toastMsg, setToastMsg] = useState(null);

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
          catatanAdmin: item.catatan_admin || '',
          teksSanggahan: item.teks_sanggahan || '',
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
    return list.sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (key === 'nominal') {
        valA = a.nominalAngka;
        valB = b.nominalAngka;
      }
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
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
      setToastMsg('Sanggahan pembayaran Anda berhasil dikirim! Status kembali Menunggu Verifikasi.');
      setTimeout(() => setToastMsg(null), 4000);
      await fetchHistory();
    } catch (err) {
      alert('Gagal mengirim sanggahan. Coba lagi.');
    } finally {
      setIsSubmittingSanggahan(false);
    }
  };

  const tableHeaders = [
    { label: 'ID Transaksi', sortKey: 'idReal' },
    { label: 'Tanggal', sortKey: 'tanggal' },
    { label: 'Nominal Bayar', sortKey: 'nominal' },
    { label: 'Metode Pembayaran', sortKey: 'metode' },
    { label: 'Status & Catatan Admin', sortKey: 'status' },
    { label: 'Aksi Sanggahan', align: 'center', sortable: false }
  ];

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {toastMsg && (
        <div className="bg-emerald-500 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:check-circle-20-solid" width="20" height="20" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Riwayat Pembayaran Tenant
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
            Daftar seluruh pembayaran sewa kios dan status verifikasinya.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="filter-metode-tenant" className="text-xs sm:text-sm font-bold text-text-2">Metode:</label>
          <select
            id="filter-metode-tenant"
            aria-label="Filter Metode Pembayaran Tenant"
            value={selectedMetode}
            onChange={(e) => setSelectedMetode(e.target.value)}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red"
          >
            <option value="Semua">Semua Metode</option>
            <option value="Transfer">Transfer Bank</option>
            <option value="Tunai">Tunai (Loket)</option>
            <option value="Midtrans">Midtrans Gateway</option>
          </select>
        </div>
      </div>

      <Card variant="elevated" className="p-4 sm:p-6">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            icon="heroicons:receipt-refund-20-solid"
            title="Belum Ada Riwayat Transaksi"
            description="Riwayat pembayaran sewa kios Anda akan otomatis tercatat di sini setelah melakukan pembayaran."
          />
        ) : (
          <Table
            caption="Tabel Histori Pembayaran Tenant"
            ariaLabel="Daftar Histori Transaksi Pembayaran Tenant"
            headers={tableHeaders}
            colSpan={6}
            sortConfig={sortConfig}
            onSort={handleSort}
          >
            {filteredHistory.map((row, idx) => (
              <tr key={row.id || idx} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                <th scope="row" data-label="ID Transaksi" className="font-tabular-nums font-bold p-3 text-text text-left">
                  {row.id}
                </th>
                <td data-label="Tanggal" className="p-3 text-text-2 font-medium">
                  {row.tanggal}
                </td>
                <td data-label="Nominal Bayar" className="font-tabular-nums font-extrabold p-3 text-text">
                  Rp {row.nominalAngka.toLocaleString('id-ID')}
                </td>
                <td data-label="Metode Pembayaran" className="p-3 text-text font-bold">
                  {row.metode === 'Midtrans' ? 'Midtrans Gateway' : row.metode === 'Transfer' ? 'Transfer Bank' : row.metode === 'Tunai' ? 'Tunai Loket' : row.metode}
                </td>
                <td data-label="Status & Catatan Admin" className="p-3">
                  <div className="flex flex-col gap-1">
                    <Badge status={row.status} />
                    {row.status === 'Ditolak' && row.catatanAdmin && (
                      <div className="p-2 bg-red-50 border border-red/20 rounded-md text-xs text-red font-bold flex items-center gap-1">
                        <Icon icon="heroicons:exclamation-circle-20-solid" width="14" height="14" />
                        <span>Alasan Tolak: "{row.catatanAdmin}"</span>
                      </div>
                    )}
                    {row.teksSanggahan && (
                      <div className="text-xs text-amber-700 font-semibold italic">
                        Sanggahan Anda: "{row.teksSanggahan}"
                      </div>
                    )}
                  </div>
                </td>
                <td data-label="Aksi Sanggahan" className="p-3 text-center">
                  {row.status === 'Ditolak' ? (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleOpenSanggahanModal(row)}
                      className="h-8 text-xs font-extrabold gap-1 px-3 shadow-sm"
                    >
                      <Icon icon="heroicons:chat-bubble-left-right-20-solid" width="14" height="14" />
                      <span>Ajukan Sanggahan</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-text-3 font-medium">-</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

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
                <Icon icon="heroicons:arrow-up-tray-20-solid" width="24" height="24" className="text-amber-500" />
                <span className="text-xs font-bold text-text">
                  {buktiSanggahanFile ? buktiSanggahanFile.name : 'Upload Foto Resi Baru'}
                </span>
                <span className="text-[11px] text-text-3">Format JPG, PNG, atau WEBP</span>
              </label>
              {previewBuktiSanggahan && (
                <div className="mt-2 border border-border rounded-lg p-2 bg-warm-gray/30 flex justify-center">
                  <img src={previewBuktiSanggahan} alt="Preview Bukti Sanggahan" className="max-h-36 rounded object-contain" />
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
