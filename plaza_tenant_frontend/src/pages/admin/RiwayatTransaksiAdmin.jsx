import React, { useState } from 'react';
import { useTransactionDomain } from '../../context/TransactionContext';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import AlokasiBreakdown from '../../components/ui/AlokasiBreakdown';
import EmptyState from '../../components/ui/EmptyState';

function RiwayatTransaksiAdmin() {
  const { riwayat } = useTransactionDomain();
  const [selectedBukti, setSelectedBukti] = useState(null);
  const [filterMetode, setFilterMetode] = useState('Semua');

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
  <text x="36" y="44" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="bold" letter-spacing="1">BUKTI RESMI PEMBAYARAN SEWA</text>
  <text x="464" y="44" fill="#FDFBF7" font-family="sans-serif" font-size="11" font-weight="600" text-anchor="end">${metode.toUpperCase()}</text>
  <text x="36" y="92" fill="#666666" font-family="sans-serif" font-size="12">NO. TRANSAKSI:</text>
  <text x="150" y="92" fill="#1A1A1A" font-family="sans-serif" font-size="13" font-weight="bold">${trxId}</text>
  <text x="36" y="120" fill="#666666" font-family="sans-serif" font-size="12">NAMA TENANT:</text>
  <text x="150" y="120" fill="#1A1A1A" font-family="sans-serif" font-size="13" font-weight="bold">${nama} (${kios})</text>
  <text x="36" y="148" fill="#666666" font-family="sans-serif" font-size="12">WAKTU BAYAR:</text>
  <text x="150" y="148" fill="#1A1A1A" font-family="sans-serif" font-size="13" font-weight="bold">${waktu}</text>
  <line x1="36" y1="170" x2="464" y2="170" stroke="#E5DCD3" stroke-width="1.5"/>
  <text x="36" y="202" fill="#666666" font-family="sans-serif" font-size="12" font-weight="bold">NOMINAL DIBAYAR:</text>
  <text x="464" y="205" fill="#8B0000" font-family="sans-serif" font-size="20" font-weight="900" text-anchor="end">${nominalStr}</text>
  <rect x="36" y="230" width="428" height="46" rx="8" fill="#F4EBE1"/>
  <text x="250" y="258" fill="#2E7D32" font-family="sans-serif" font-size="12" font-weight="extrabold" text-anchor="middle">✔ RESI TRANSAKSI RESMI PLAZA BUNSAY</text>
</svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  };

  const formatBuktiSrc = (item) => {
    const bukti = item?.bukti;

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

  const filteredRiwayat = riwayat.filter(item => {
    if (filterMetode === 'Semua') return true;
    return item.metode === filterMetode;
  });

  const tableHeaders = [
    { label: 'ID TRX' },
    { label: 'Tenant & Kios' },
    { label: 'Jenis Tagihan' },
    { label: 'Nominal Bayar' },
    { label: 'Metode & Waktu' },
    { label: 'Alokasi Tagihan' },
    { label: 'Status', align: 'center' },
    { label: 'Aksi', align: 'center' },
  ];

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Riwayat Transaksi Admin
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
            Log seluruh transaksi lintas metode (Transfer Bank, Tunai Loket, Midtrans Gateway).
          </p>
        </div>

        {/* Filter 3 Metode Pembayaran Resmi */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="filter-metode-admin" className="text-xs sm:text-sm font-bold text-text-2">Metode:</label>
          <select
            id="filter-metode-admin"
            aria-label="Filter Metode Pembayaran Transaksi Admin"
            value={filterMetode}
            onChange={(e) => setFilterMetode(e.target.value)}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red"
          >
            <option value="Semua">Semua Metode (3)</option>
            <option value="Transfer">Transfer Bank</option>
            <option value="Tunai">Tunai (Loket)</option>
            <option value="Midtrans">Midtrans Gateway</option>
          </select>
        </div>
      </div>

      <Card variant="elevated" className="p-4 sm:p-6">
        {filteredRiwayat.length === 0 ? (
          <EmptyState
            icon="heroicons:receipt-percent-20-solid"
            title="Riwayat Transaksi Kosong"
            description="Belum ada transaksi pembayaran yang tercatat untuk filter metode ini."
          />
        ) : (
          <Table
            caption="Riwayat Transaksi Lintas Metode Pengelola Plaza"
            ariaLabel="Tabel Riwayat Seluruh Transaksi Admin"
            headers={tableHeaders}
            colSpan={8}
          >
            {filteredRiwayat.map((item, idx) => (
              <tr key={item.id || idx} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                <th scope="row" data-label="ID TRX" className="font-tabular-nums font-bold p-3 text-text text-left">
                  {item.id}
                </th>
                <td data-label="Tenant & Kios" className="p-3 text-left">
                  <div className="font-bold text-text text-sm">{item.nama}</div>
                  <div className="font-tabular-nums font-bold text-xs text-text-3">Kios {item.kios}</div>
                </td>
                <td data-label="Jenis Tagihan" className="p-3 text-text-2 font-medium">
                  {item.tagihan}
                </td>
                <td data-label="Nominal Bayar" className="font-tabular-nums font-extrabold p-3 text-text">
                  {item.nominal}
                </td>
                <td data-label="Metode & Waktu" className="p-3 text-text-2 text-xs">
                  <div className="font-bold text-text text-sm">
                    {item.labelMetode || (item.metode === 'Midtrans' ? 'Midtrans Gateway' : item.metode === 'Transfer' ? 'Transfer Bank' : item.metode)}
                  </div>
                  <div className="text-text-3 font-medium font-tabular-nums">{item.waktu}</div>
                </td>
                <td data-label="Alokasi Tagihan" className="p-3">
                  <AlokasiBreakdown alokasiList={item.alokasi} compact={true} />
                </td>
                <td data-label="Status" className="p-3 text-center">
                  <Badge status={item.status} />
                  {item.alasan && (
                    <div className="text-[11px] text-red mt-1 italic font-medium">
                      {item.alasan}
                    </div>
                  )}
                </td>
                <td data-label="Aksi" className="p-3 text-center">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBukti(item)}
                    aria-label={`Lihat detail transaksi ${item.id} oleh ${item.nama} (${item.kios})`}
                    className="h-8 px-3 text-xs font-bold"
                  >
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Modal Detail Transaksi Admin */}
      <Modal
        isOpen={!!selectedBukti}
        onClose={() => setSelectedBukti(null)}
        title={selectedBukti ? `Detail Transaksi ${selectedBukti.id}` : ''}
        size="md"
        footer={
          <Button 
            variant="secondary"
            fullWidth
            onClick={() => setSelectedBukti(null)}
          >
            Tutup
          </Button>
        }
      >
        {selectedBukti && (
          <div className="flex flex-col gap-4 text-sm font-sans">
            <Card variant="inset" className="p-4 flex flex-col gap-2">
              <div><span className="text-text-3 font-semibold">Tenant:</span> <strong className="text-text font-bold">{selectedBukti.nama} (<span className="font-tabular-nums">{selectedBukti.kios}</span>)</strong></div>
              <div><span className="text-text-3 font-semibold">Nominal Bayar:</span> <strong className="text-text font-bold font-tabular-nums">{selectedBukti.nominal}</strong></div>
              <div><span className="text-text-3 font-semibold">Metode:</span> <strong className="text-text font-bold">{selectedBukti.labelMetode || selectedBukti.metode}</strong></div>
              <div><span className="text-text-3 font-semibold">Waktu:</span> <strong className="text-text font-bold font-tabular-nums">{selectedBukti.waktu}</strong></div>
              <div><span className="text-text-3 font-semibold">Status:</span> <Badge status={selectedBukti.status} /></div>
              {selectedBukti.alasan && <div><span className="text-text-3 font-semibold">Alasan Tolak:</span> <strong className="text-red font-bold">{selectedBukti.alasan}</strong></div>}
            </Card>

            {/* Rincian Alokasi FIFO */}
            <AlokasiBreakdown alokasiList={selectedBukti.alokasi} />

            <div className="w-full min-h-[220px] bg-white border border-border rounded-xl flex flex-col items-center justify-center p-2 shadow-sm overflow-hidden">
              <img
                src={formatBuktiSrc(selectedBukti)}
                alt={`Bukti pembayaran ${selectedBukti.nama}`}
                className="w-full max-h-64 rounded-lg object-contain"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RiwayatTransaksiAdmin;
