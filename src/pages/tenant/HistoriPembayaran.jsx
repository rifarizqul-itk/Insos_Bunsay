import React, { useState, useEffect } from 'react';
import { getTenantHistory } from '../../api/tenant';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import AlokasiBreakdown from '../../components/ui/AlokasiBreakdown';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';

function HistoriPembayaran() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetode, setSelectedMetode] = useState('Semua');

  useEffect(() => {
    getTenantHistory()
      .then(data => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredHistory = history.filter(item => {
    if (selectedMetode === 'Semua') return true;
    return item.metode === selectedMetode;
  });

  const tableHeaders = [
    { label: 'ID Transaksi' },
    { label: 'Tanggal' },
    { label: 'Nominal Bayar' },
    { label: 'Metode Pembayaran' },
    { label: 'Rincian Cicilan' },
    { label: 'Status' }
  ];

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Riwayat Pembayaran Tenant
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
            Daftar seluruh pembayaran sewa kios dan pemotongan tagihannya.
          </p>
        </div>

        {/* Filter 3 Metode Pembayaran Resmi */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="filter-metode-tenant" className="text-xs sm:text-sm font-bold text-text-2">Metode:</label>
          <select
            id="filter-metode-tenant"
            aria-label="Filter Metode Pembayaran Tenant"
            value={selectedMetode}
            onChange={(e) => setSelectedMetode(e.target.value)}
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
          >
            {filteredHistory.map((row, idx) => (
              <tr key={row.id || idx} className={`border-b border-border/80 ${idx % 2 === 0 ? 'bg-white' : 'bg-warm-gray/30'}`}>
                <th scope="row" data-label="ID Transaksi" className="font-tabular-nums font-bold p-3 text-text text-left">
                  {row.id}
                </th>
                <td data-label="Tanggal" className="p-3 text-text-2 font-medium">
                  {row.tanggal || row.waktu}
                </td>
                <td data-label="Nominal Bayar" className="font-tabular-nums font-extrabold p-3 text-text">
                  Rp {(Number(row.nominal) || 0).toLocaleString('id-ID')}
                </td>
                <td data-label="Metode Pembayaran" className="p-3 text-text font-bold">
                  {row.metode === 'Midtrans' ? 'Midtrans Gateway' : row.metode === 'Transfer' ? 'Transfer Bank' : row.metode === 'Tunai' ? 'Tunai Loket' : row.metode}
                </td>
                <td data-label="Rincian Cicilan" className="p-3">
                  <AlokasiBreakdown alokasiList={row.alokasi} compact={true} />
                </td>
                <td data-label="Status" className="p-3">
                  <Badge status={row.status} />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

export default HistoriPembayaran;
