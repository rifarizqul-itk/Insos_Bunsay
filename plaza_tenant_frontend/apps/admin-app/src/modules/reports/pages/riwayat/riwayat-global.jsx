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
    { label: 'Jenis Tagihan', sortKey: 'tagihan' },
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
            onChange={(e) => {
              setFilterMetode(e.target.value);
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
        {isLoading ? (
          <SkeletonTable rows={5} cols={7} />
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
              {paginatedRiwayat.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-warm-gray/20 transition-colors">
                  <th scope="row" data-label="ID TRX" className="font-tabular-nums font-bold p-3 text-text text-start">
                    {item.id}
                  </th>
                  <td data-label="Tenant & Kios" className="p-3 text-start">
                    <div className="font-bold text-text text-sm">{item.nama}</div>
                    <div className="font-tabular-nums font-bold text-xs text-text-3">Kios {item.kios}</div>
                  </td>
                  <td data-label="Jenis Tagihan" className="p-3 text-text-2 font-medium">
                    <div>{item.tagihan}</div>
                    {item.alokasi && item.alokasi.length > 1 && (
                      <span className="inline-flex items-center gap-1 text-2xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded mt-1 shadow-2xs">
                        <Icon icon="heroicons:arrows-split-20-solid" className="size-3 text-blue-600" />
                        <span>Alokasi {item.alokasi.length} Periode (Cicilan)</span>
                      </span>
                    )}
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
                  <td data-label="Status" className="p-3 text-center">
                    <Badge status={item.status} />
                    {item.alasan && (
                      <div className="text-xs text-red mt-1 italic font-medium">
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
                      className="min-h-10 sm:min-h-8 sm:h-8 px-3 text-xs font-bold"
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
        )}
      </Card>

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
