import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, Table, Icon, EmptyState, SkeletonTable, BuktiPembayaranModal, Pagination } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function RiwayatTransaksiAdmin() {
  const { httpClient } = useAdminAuth();
  const [selectedBukti, setSelectedBukti] = useState(null);
  const [filterMetode, setFilterMetode] = useState('Semua');
  const [riwayat, setRiwayat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'idRaw', direction: 'desc' });

  useEffect(() => {
    async function fetchRiwayatGlobal() {
      setIsLoading(true);
      try {
        const res = await httpClient.get('/api/v1/admin/pembayaran');
        if (res?.data && Array.isArray(res.data)) {
          const mapped = res.data.map(item => ({
            id: `TRX-${item.Id_Pembayaran}`,
            idRaw: item.Id_Pembayaran,
            nama: item.tagihan?.sewa?.pemilik?.Nama || 
                  item.tagihan?.sewa?.pemilik?.Nama_Pemilik || 
                  item.Nama_Tenant || 
                  item.tenant?.Nama_Tenant || 
                  item.tenant?.Nama || 
                  item.tenant?.Username || 
                  item.nama || 
                  'Penyewa Kios',
            kios: item.tagihan?.sewa?.kios?.No_Kios || 
                  item.tagihan?.sewa?.kios?.Kode_Kios || 
                  item.Nomor_Kios || 
                  item.tenant?.Nomor_Kios || 
                  item.kios || 
                  '-',
            tagihan: item.tagihan?.Periode 
              ? `Sewa Kios ${item.tagihan.Periode}` 
              : (item.tagihan?.Bulan_Tahun ? `Sewa Kios Periode ${item.tagihan.Bulan_Tahun}` : (item.Keterangan || 'Sewa Kios')),
            nominal: `Rp ${Number(item.Total_Bayar || 0).toLocaleString('id-ID')}`,
            nominalAngka: Number(item.Total_Bayar || 0),
            nominalRaw: Number(item.Total_Bayar || 0),
            metode: item.Metode_Bayar || 'Transfer',
            labelMetode: item.Metode_Bayar === 'Midtrans' 
              ? 'Midtrans Gateway' 
              : item.Metode_Bayar === 'Transfer' 
                ? 'Transfer Bank' 
                : item.Metode_Bayar === 'Tunai' 
                  ? 'Tunai Loket' 
                  : item.Metode_Bayar || 'Transfer Bank',
            waktu: item.Tanggal_Bayar || item.created_at || '-',
            status: item.Verifikasi_Pembayaran === 'Diterima' ? 'Lunas' : (item.Verifikasi_Pembayaran === 'Ditolak' ? 'Ditolak' : (item.Verifikasi_Pembayaran || 'Lunas')),
            buktiUrl: item.Bukti_Pembayaran || '',
            alasan: item.Catatan_Admin || '',
            alokasi: item.alokasi || []
          }));
          setRiwayat(mapped);
        } else {
          setRiwayat([]);
        }
      } catch (err) {
        setRiwayat([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRiwayatGlobal();
  }, [httpClient]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredRiwayat = useMemo(() => {
    let result = riwayat.filter(item => {
      if (filterMetode === 'Semua') return true;
      return item.metode === filterMetode;
    });

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aVal = sortConfig.key === 'nominal' ? (a.nominalAngka ?? 0) : (a[sortConfig.key] ?? '');
        let bVal = sortConfig.key === 'nominal' ? (b.nominalAngka ?? 0) : (b[sortConfig.key] ?? '');

        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [riwayat, filterMetode, sortConfig]);

  const paginatedRiwayat = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRiwayat.slice(startIndex, startIndex + pageSize);
  }, [filteredRiwayat, currentPage, pageSize]);

  const tableHeaders = [
    { label: 'ID TRX', sortKey: 'idRaw' },
    { label: 'Tenant & Kios', sortKey: 'nama' },
    { label: 'Periode', sortKey: 'tagihan' },
    { label: 'Nominal Bayar', sortKey: 'nominal' },
    { label: 'Metode & Waktu', sortKey: 'metode' },
    { label: 'Status', align: 'center', sortKey: 'status' },
    { label: 'Aksi', align: 'center', sortable: false }
  ];

  return (
    <div data-slot="riwayat-transaksi-admin" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Riwayat Transaksi
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="filter-metode-admin" className="text-xs sm:text-sm font-bold text-text-2">Metode:</label>
          <select
            id="filter-metode-admin"
            aria-label="Filter Metode Pembayaran Transaksi Admin"
            value={filterMetode}
            onChange={(e) => {
              setFilterMetode(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-md border border-border bg-white pl-3.5 pr-9 text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red cursor-pointer"
          >
            <option value="Semua">Semua Metode</option>
            <option value="Transfer">Transfer Bank</option>
            <option value="Tunai">Tunai (Kasir)</option>
            <option value="Midtrans">Midtrans Gateway</option>
          </select>
        </div>
      </div>

      {/* Main Global Transaction History Table (Seamless Edge-to-Edge Surface) */}
      <div className="w-full bg-white rounded-3xl border border-border/80 shadow-card overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={7} />
          </div>
        ) : filteredRiwayat.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="heroicons:receipt-percent-20-solid"
              title="Belum ada transaksi"
              description="Belum ada riwayat transaksi pembayaran untuk filter metode ini."
            />
          </div>
        ) : (
          <Table
            className="border-0 rounded-none shadow-none"
            caption="Riwayat Transaksi Lintas Metode Pengelola Plaza"
            ariaLabel="Tabel Riwayat Seluruh Transaksi Admin"
            headers={tableHeaders}
            colSpan={7}
            sortConfig={sortConfig}
            onSort={handleSort}
            footer={
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredRiwayat.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  itemName="transaksi"
                />
              }
            >
              {paginatedRiwayat.map((item, index) => (
                <tr key={item.id || index} className="border-b border-border/80 last:border-b-0 hover:bg-red-50/20 transition-colors">
                  <th scope="row" data-label="ID TRX" className="py-3 px-4 font-mono font-black text-text text-xs sm:text-sm">
                    {item.id}
                  </th>
                  <td data-label="Tenant & Kios" className="py-3 px-4 text-start">
                    <div className="font-extrabold text-text text-xs sm:text-sm">{item.nama}</div>
                    <div className="font-tabular-nums font-extrabold text-xs text-red">Kios {item.kios}</div>
                  </td>
                  <td data-label="Periode" className="py-3 px-4 text-text-2 font-medium text-xs sm:text-sm">
                    <div>{item.tagihan}</div>
                    {item.alokasi && item.alokasi.length > 1 && (
                      <span className="inline-flex items-center gap-1 text-2xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded mt-1 shadow-2xs">
                        <Icon icon="heroicons:arrows-split-20-solid" className="size-3 text-blue-600" />
                        <span>Alokasi {item.alokasi.length} Periode (Cicilan)</span>
                      </span>
                    )}
                  </td>
                  <td data-label="Nominal Bayar" className="py-3 px-4 font-tabular-nums font-black text-xs sm:text-sm text-text">
                    {item.nominal}
                  </td>
                  <td data-label="Metode & Waktu" className="py-3 px-4 text-text-2 text-xs">
                    <div className="font-bold text-text text-xs sm:text-sm">
                      {item.labelMetode || (item.metode === 'Midtrans' ? 'Midtrans Gateway' : item.metode === 'Transfer' ? 'Transfer Bank' : item.metode)}
                    </div>
                    <div className="text-text-3 font-medium font-tabular-nums">{item.waktu}</div>
                  </td>
                  <td data-label="Status" className="py-3 px-4 text-center">
                    <Badge status={item.status} />
                    {item.alasan && (
                      <div className="text-xs text-red mt-1 italic font-medium">
                        {item.alasan}
                      </div>
                    )}
                  </td>
                  <td data-label="Aksi" className="py-3 px-4 text-center whitespace-nowrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedBukti(item)}
                      aria-label={`Lihat detail transaksi ${item.id} oleh ${item.nama} (${item.kios})`}
                      className="h-8 px-3 text-xs font-bold shadow-2xs"
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
        )}
      </div>

      {/* Modal Detail & Kuitansi Transaksi */}
      <BuktiPembayaranModal
        isOpen={Boolean(selectedBukti)}
        item={selectedBukti}
        onClose={() => setSelectedBukti(null)}
      />
    </div>
  );
}

export default RiwayatTransaksiAdmin;
