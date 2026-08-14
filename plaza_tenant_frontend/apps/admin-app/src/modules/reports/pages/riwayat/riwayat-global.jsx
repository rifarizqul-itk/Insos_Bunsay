import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, Table, AlokasiBreakdown, EmptyState, SkeletonTable, BuktiPembayaranModal } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function RiwayatTransaksiAdmin() {
  const { httpClient } = useAdminAuth();
  const [selectedBukti, setSelectedBukti] = useState(null);
  const [filterMetode, setFilterMetode] = useState('Semua');
  const [riwayat, setRiwayat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'idRaw', direction: 'desc' });

  useEffect(() => {
    async function fetchRiwayatGlobal() {
      setIsLoading(true);
      try {
        const response = await httpClient.get('/api/v1/admin/pembayaran');
        if (response?.data && Array.isArray(response.data)) {
          const raw = response.data;
          const mapped = raw.map(p => ({
            id: `TRX-${p.Id_Pembayaran}`,
            idRaw: p.Id_Pembayaran,
            nama: p.tagihan?.sewa?.pemilik?.Nama || 'Hj. Yuliana',
            kios: p.tagihan?.sewa?.kios?.No_Kios || 'B-1001',
            tagihan: `Sewa Kios ${p.tagihan?.Periode || 'Berjalan'}`,
            nominalRaw: Number(p.Total_Bayar || 0),
            nominal: `Rp ${Number(p.Total_Bayar || 0).toLocaleString('id-ID')}`,
            metode: p.Metode_Bayar || 'Transfer',
            labelMetode: `${p.Metode_Bayar || 'Transfer Bank'} (SQL DB)`,
            waktu: p.Tanggal_Bayar || 'Terbaru',
            status: p.Verifikasi_Pembayaran === 'Diterima' ? 'Lunas' : (p.Verifikasi_Pembayaran === 'Ditolak' ? 'Ditolak' : 'Menunggu Verifikasi'),
            buktiUrl: p.Bukti_Pembayaran || '',
            alokasi: []
          }));
          setRiwayat(mapped);
        }
      } catch (err) {
        console.warn('Backend fetch riwayat error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRiwayatGlobal();
  }, [httpClient]);


  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredRiwayat = useMemo(() => {
    let list = riwayat.filter(item => {
      if (filterMetode === 'Semua') return true;
      return item.metode === filterMetode;
    });

    const { key, direction } = sortConfig;
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
  }, [riwayat, filterMetode, sortConfig]);

  const tableHeaders = [
    { label: 'ID TRX', sortKey: 'idRaw' },
    { label: 'Tenant & Kios', sortKey: 'nama' },
    { label: 'Jenis Tagihan', sortKey: 'tagihan' },
    { label: 'Nominal Bayar', sortKey: 'nominal' },
    { label: 'Metode & Waktu', sortKey: 'metode' },
    { label: 'Alokasi Tagihan', sortable: false },
    { label: 'Status', align: 'center', sortKey: 'status' },
    { label: 'Aksi', align: 'center', sortable: false }
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
        {isLoading ? (
          <SkeletonTable rows={4} cols={8} />
        ) : filteredRiwayat.length === 0 ? (
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
            sortConfig={sortConfig}
            onSort={handleSort}
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

      {/* Modal Detail & Resi/Bukti Transaksi */}
      <BuktiPembayaranModal
        isOpen={Boolean(selectedBukti)}
        onClose={() => setSelectedBukti(null)}
        item={selectedBukti}
      />
    </div>
  );
}

export default RiwayatTransaksiAdmin;

