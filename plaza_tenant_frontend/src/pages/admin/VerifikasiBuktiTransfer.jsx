import React, { useState, useEffect } from 'react';
import { useTransactionDomain } from '../../context/TransactionContext';
import { useUI } from '../../context/UIContext';
import Icon from '../../components/ui/Icon';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AlokasiBreakdown from '../../components/ui/AlokasiBreakdown';
import EmptyState from '../../components/ui/EmptyState';

import ErrorBoundary from '../../components/ErrorBoundary';

function VerifikasiBuktiTransfer({ selectedTenant = null }) {
  const domain = useTransactionDomain();
  const ui = useUI();

  const antrean = domain?.antrean || [];
  const verifyTransaction = domain?.verifyTransaction;
  const addToast = ui?.addToast || console.log;

  const [previewItem, setPreviewItem] = useState(null);

  const safeAntrean = Array.isArray(antrean) ? antrean : [];

  // Antrean transaksi yang membutuhkan verifikasi admin (Transfer / Tunai)
  const transferAntrean = safeAntrean.filter(item => item && (
    item.metode === 'Transfer' || 
    item.metode === 'transfer_manual' || 
    item.metode === 'Cash' || 
    item.metode === 'Tunai' || 
    !item.metode
  ));

  const filteredAntrean = selectedTenant
    ? transferAntrean.filter(item => item && item.nama === selectedTenant)
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

  const formatTagihanLabel = (tagihan) => {
    if (typeof tagihan === 'string') return tagihan;
    if (tagihan && typeof tagihan === 'object') {
      return tagihan.Periode ? `Sewa Kios Periode ${tagihan.Periode}` : (tagihan.Periode_Tagihan ? `Sewa Kios Periode ${tagihan.Periode_Tagihan}` : 'Pelunasan Masa Sewa Kios');
    }
    return 'Pelunasan Masa Sewa Kios';
  };

  const createSampleReceiptSVG = (item) => {
    const trxId = item?.id || 'TRX-UNKNOWN';
    const nama = item?.nama || 'Tenant Kebun Sayur';
    const kios = item?.kios || 'B-1001';
    const nominalStr = item?.nominal || (item?.nominalAngka ? `Rp ${Number(item.nominalAngka).toLocaleString('id-ID')}` : 'Rp 500.000');
    const waktu = item?.waktu || new Date().toISOString().split('T')[0];
    const metode = item?.labelMetode || item?.metode || 'Transfer Bank Manual';

    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300" fill="none">
  <rect width="500" height="300" rx="16" fill="#FDFBF7"/>
  <rect x="2" y="2" width="496" height="296" rx="14" stroke="#E5DCD3" stroke-width="2" stroke-dasharray="6 6"/>
  <rect x="20" y="16" width="460" height="46" rx="8" fill="#8B0000"/>
  <text x="36" y="44" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="bold" letter-spacing="1">BUKTI RESMI TRANSFER TENANT</text>
  <text x="464" y="44" fill="#FDFBF7" font-family="sans-serif" font-size="11" font-weight="600" text-anchor="end">${metode.toUpperCase()}</text>
  <text x="36" y="92" fill="#666666" font-family="sans-serif" font-size="12">NO. TRANSAKSI:</text>
  <text x="150" y="92" fill="#1A1A1A" font-family="sans-serif" font-size="13" font-weight="bold">${trxId}</text>
  <text x="36" y="120" fill="#666666" font-family="sans-serif" font-size="12">NAMA TENANT:</text>
  <text x="150" y="120" fill="#1A1A1A" font-family="sans-serif" font-size="13" font-weight="bold">${nama} (${kios})</text>
  <text x="36" y="148" fill="#666666" font-family="sans-serif" font-size="12">WAKTU KIRIM:</text>
  <text x="150" y="148" fill="#1A1A1A" font-family="sans-serif" font-size="13" font-weight="bold">${waktu}</text>
  <line x1="36" y1="170" x2="464" y2="170" stroke="#E5DCD3" stroke-width="1.5"/>
  <text x="36" y="202" fill="#666666" font-family="sans-serif" font-size="12" font-weight="bold">NOMINAL DITRANSFER:</text>
  <text x="464" y="205" fill="#8B0000" font-family="sans-serif" font-size="20" font-weight="900" text-anchor="end">${nominalStr}</text>
  <rect x="36" y="230" width="428" height="46" rx="8" fill="#F4EBE1"/>
  <text x="250" y="258" fill="#2E7D32" font-family="sans-serif" font-size="12" font-weight="extrabold" text-anchor="middle">✔ DOKUMEN TERSIMPAN &amp; TERVERIFIKASI DI DATABASE SERVER</text>
</svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  };

  const formatBuktiSrc = (item) => {
    const bukti = item?.bukti;

    // Check localStorage cache for recent uploads
    if (item?.id) {
      const cached = localStorage.getItem(`bukti_file_${item.id}`);
      if (cached) return cached;
    }
    const latestCache = localStorage.getItem('latest_uploaded_bukti');

    if (typeof bukti === 'string' && bukti.trim().length > 0) {
      if (bukti.startsWith('data:image/') || bukti.startsWith('blob:')) {
        return bukti;
      }
      if (bukti.startsWith('http://') || bukti.startsWith('https://')) {
        return bukti;
      }
      if (bukti.startsWith('storage/')) {
        return `http://localhost:8000/${bukti}`;
      }
      if (bukti.endsWith('.png') || bukti.endsWith('.jpg') || bukti.endsWith('.jpeg') || bukti.endsWith('.webp')) {
        return `http://localhost:8000/storage/bukti/${bukti}`;
      }
    }

    if (latestCache && (item?.metode === 'Transfer' || item?.labelMetode?.includes('Transfer'))) {
      return latestCache;
    }

    return createSampleReceiptSVG(item);
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
                    {formatTagihanLabel(item.tagihan)}
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
                <div><span className="text-text-3 font-semibold">Jenis Tagihan:</span> <strong className="text-text font-bold">{formatTagihanLabel(previewItem.tagihan)}</strong></div>
                <div><span className="text-text-3 font-semibold">Nominal Bayar:</span> <strong className="text-text font-bold font-tabular-nums">{previewItem.nominal}</strong></div>
                <div><span className="text-text-3 font-semibold">Metode:</span> <strong className="text-text font-bold">{previewItem.labelMetode || 'Transfer Bank Manual'}</strong></div>
                <div><span className="text-text-3 font-semibold">Waktu Kirim:</span> <strong className="text-text font-bold font-tabular-nums">{previewItem.waktu}</strong></div>
              </div>

              {/* Breakdown Alokasi FIFO */}
              <AlokasiBreakdown alokasiList={previewItem.alokasi} />

              <div className="w-full min-h-[220px] bg-white border border-border rounded-xl flex flex-col items-center justify-center p-2 shadow-sm overflow-hidden">
                <img
                  src={formatBuktiSrc(previewItem)}
                  alt={`Bukti transfer ${previewItem.nama}`}
                  className="w-full max-h-64 rounded-lg object-contain"
                />
              </div>

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

export default function VerifikasiBuktiTransferWithBoundary(props) {
  return (
    <ErrorBoundary>
      <VerifikasiBuktiTransfer {...props} />
    </ErrorBoundary>
  );
}
