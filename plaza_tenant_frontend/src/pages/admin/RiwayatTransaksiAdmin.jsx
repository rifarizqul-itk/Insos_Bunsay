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

            <div className="w-full h-44 bg-warm-gray/60 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-center p-4">
              <span className="text-xs text-text-3 font-medium italic">
                [Simulasi Lampiran Bukti_Pembayaran_{selectedBukti.id}.jpg]
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RiwayatTransaksiAdmin;
