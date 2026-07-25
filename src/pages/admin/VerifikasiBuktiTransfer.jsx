import React, { useState, useEffect } from 'react';
import { useTransactionDomain } from '../../context/TransactionContext';
import { useUI } from '../../context/UIContext';
import Icon from '../../components/ui/Icon';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AlokasiBreakdown from '../../components/ui/AlokasiBreakdown';
import EmptyState from '../../components/ui/EmptyState';

function VerifikasiBuktiTransfer({ selectedTenant = null }) {
  const { antrean, verifyTransaction } = useTransactionDomain();
  const { addToast } = useUI();
  const [previewItem, setPreviewItem] = useState(null);

  // Antrean khusus metode Transfer Bank manual yang membutuhkan verifikasi admin
  const transferAntrean = antrean.filter(item => item.metode === 'Transfer' || item.metode === 'transfer_manual' || !item.metode);

  const filteredAntrean = selectedTenant
    ? transferAntrean.filter(item => item.nama === selectedTenant)
    : transferAntrean;

  const tableHeaders = [
    { label: 'Tenant & Kios' },
    { label: 'Jenis Tagihan' },
    { label: 'Nominal Bayar' },
    { label: 'Alokasi Tagihan' },
    { label: 'Aksi', align: 'center' },
  ];

  useEffect(() => {
    if (selectedTenant && filteredAntrean.length > 0) {
      setPreviewItem(filteredAntrean[0]);
    }
  }, [selectedTenant]);

  const handleAksi = async (id, statusKonfirmasi) => {
    const itemTarget = transferAntrean.find(item => item.id === id);
    if (!itemTarget) return;

    const statusFinal = statusKonfirmasi === 'konfirmasi' ? 'Lunas' : 'Ditolak';
    const alasan = statusKonfirmasi === 'konfirmasi' ? null : 'Bukti transfer tidak sesuai / buram';

    try {
      const result = await verifyTransaction(id, statusFinal, alasan);
      if (result && result.success) {
        addToast(
          result.message || `Pembayaran ${id} berhasil di-${statusKonfirmasi === 'konfirmasi' ? 'setujui (Lunas)' : 'tolak'}.`,
          statusKonfirmasi === 'konfirmasi' ? 'success' : 'error'
        );
      } else {
        addToast(result?.message || 'Gagal memproses verifikasi.', 'error');
      }
    } catch (_) {
      addToast('Terjadi kesalahan saat memverifikasi transaksi.', 'error');
    }
    setPreviewItem(null);
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Verifikasi Bukti Transfer Bank
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          {selectedTenant 
            ? `Menampilkan antrean bukti transfer manual untuk: ${selectedTenant}`
            : 'Khusus memproses dan mengonfirmasi bukti transfer bank manual yang diunggah oleh tenant.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <Card variant="elevated" className="w-full lg:flex-[2] p-4 sm:p-6">
          {filteredAntrean.length === 0 ? (
            <EmptyState
              icon="heroicons:document-check-20-solid"
              title="Antrean Verifikasi Kosong"
              description={selectedTenant ? `Tidak ada antrean bukti transfer untuk ${selectedTenant}.` : 'Tidak ada antrean transfer manual yang menunggu verifikasi saat ini.'}
            />
          ) : (
            <Table
              caption="Antrean Verifikasi Bukti Transfer Tenant"
              ariaLabel="Tabel Antrean Verifikasi Pembayaran Transfer Manual"
              headers={tableHeaders}
              colSpan={5}
            >
              {filteredAntrean.map((item, index) => (
                <tr key={item.id || index} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                  <th scope="row" data-label="Tenant & Kios" className="p-3 text-left">
                    <div className="font-bold text-text text-sm">{item.nama}</div>
                    <div className="font-tabular-nums font-bold text-xs text-text-3">Kios {item.kios}</div>
                  </th>
                  <td data-label="Jenis Tagihan" className="p-3 text-text-2 font-medium">
                    {item.tagihan}
                  </td>
                  <td data-label="Nominal Bayar" className="font-tabular-nums font-extrabold p-3 text-text">
                    {item.nominal}
                  </td>
                  <td data-label="Estimasi Alokasi (FIFO)" className="p-3">
                    <AlokasiBreakdown alokasiList={item.alokasi} compact={true} />
                  </td>
                  <td data-label="Aksi" className="p-3 text-center">
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => setPreviewItem(item)}
                      aria-label={`Periksa bukti transfer ${item.nama} (${item.kios}) - nominal ${item.nominal}`}
                      className="min-h-[44px] sm:min-h-8 sm:h-8 px-3 text-xs font-bold"
                    >
                      Periksa Bukti
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <div className="w-full lg:flex-1">
          {previewItem ? (
            <Card variant="glow" className="p-6 flex flex-col gap-5 page-fade-in" role="region" aria-label={`Detail Transaksi Bukti Transfer ${previewItem.nama}`}>
              <h3 className="text-base font-extrabold text-text tracking-tight border-b border-border pb-3 text-balance">
                Detail Transaksi <span className="font-tabular-nums text-red">{previewItem.id}</span>
              </h3>
              
              <div className="text-sm flex flex-col gap-2">
                <div><span className="text-text-3 font-semibold">Tenant:</span> <strong className="text-text font-bold">{previewItem.nama} (<span className="font-tabular-nums">{previewItem.kios}</span>)</strong></div>
                <div><span className="text-text-3 font-semibold">Jenis Tagihan:</span> <strong className="text-text font-bold">{previewItem.tagihan}</strong></div>
                <div><span className="text-text-3 font-semibold">Nominal Bayar:</span> <strong className="text-text font-bold font-tabular-nums">{previewItem.nominal}</strong></div>
                <div><span className="text-text-3 font-semibold">Metode:</span> <strong className="text-text font-bold">{previewItem.labelMetode || 'Transfer Bank Manual'}</strong></div>
                <div><span className="text-text-3 font-semibold">Waktu Kirim:</span> <strong className="text-text font-bold font-tabular-nums">{previewItem.waktu}</strong></div>
              </div>

              {/* Breakdown Alokasi FIFO */}
              <AlokasiBreakdown alokasiList={previewItem.alokasi} />

              <figure className="w-full h-44 bg-warm-gray/60 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-center p-4">
                <figcaption className="text-xs text-text-3 font-medium italic">
                  [Simulasi Lampiran Bukti_Transfer_{previewItem.id}.jpg]
                </figcaption>
              </figure>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="primary"
                  fullWidth
                  className="bg-green hover:bg-green/90 h-11 text-sm font-extrabold gap-1.5"
                  onClick={() => handleAksi(previewItem.id, 'konfirmasi')}
                >
                  <Icon icon="heroicons:check-circle-20-solid" width="18" height="18" />
                  <span>Konfirmasi Lunas</span>
                </Button>
                <Button 
                  variant="danger"
                  fullWidth
                  className="h-11 text-sm font-bold gap-1.5"
                  onClick={() => handleAksi(previewItem.id, 'tolak')}
                >
                  <Icon icon="heroicons:x-circle-20-solid" width="18" height="18" />
                  <span>Tolak Bukti</span>
                </Button>
              </div>
            </Card>
          ) : (
            <Card variant="inset" className="p-8 text-center text-text-3 font-medium text-sm">
              {filteredAntrean.length > 0 
                ? 'Pilih salah satu antrean untuk memeriksa bukti transfer.'
                : 'Tidak ada bukti transfer manual yang perlu diverifikasi.'}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifikasiBuktiTransfer;
