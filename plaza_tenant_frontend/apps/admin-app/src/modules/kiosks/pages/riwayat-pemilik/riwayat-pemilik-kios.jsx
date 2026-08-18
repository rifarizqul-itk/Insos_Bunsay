import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Table, Card, Badge, Button, EmptyState, Pagination } from '@bunsay/shared-ui';

function RiwayatPemilikKios() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const tableHeaders = [
    { label: 'Nama Pemilik (Ex-Tenant)', sortKey: 'nama' },
    { label: 'Unit Kios Terakhir', sortKey: 'kios' },
    { label: 'Jenis Usaha', sortKey: 'usaha' },
    { label: 'Status Keanggotaan', sortKey: 'statusPemilik' },
    { label: 'Keterangan', sortKey: 'rincianTunggakan' },
    { label: 'Aksi', align: 'center', sortable: false }
  ];

  const exTenants = [
    { id: 101, nama: 'Bpk. Bambang Soetrisno', kios: 'B-1008', usaha: 'Kerajinan Kayu', statusPemilik: 'Nonaktif', rincianTunggakan: 'Masa kontrak berakhir Des 2025' },
    { id: 102, nama: 'Ibu Ratna Juwita', kios: 'B-2005', usaha: 'Pakaian Anak', statusPemilik: 'Nonaktif', rincianTunggakan: 'Pindah lokasi usaha Nov 2025' }
  ];

  const filteredData = useMemo(() => {
    let list = exTenants.filter(t => 
      (t.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.kios || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.usaha || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const { key, direction } = sortConfig;
    return list.sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [exTenants, searchQuery, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div data-slot="riwayat-pemilik-kios" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/kios')}
            className="mb-3 gap-2 font-bold"
          >
            <Icon icon="heroicons:arrow-left-20-solid" className="size-4.5" />
            <span>Kembali ke Ketersediaan Kios</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Riwayat Pemilik Kios
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1">
            Arsip seluruh pemilik kios yang sudah tidak aktif berjualan di Plaza Kebun Sayur.
          </p>
        </div>

        <input
          type="text"
          placeholder="Cari mantan pemilik..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 px-3.5 rounded-md border border-border bg-white text-sm font-medium w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-red self-start sm:self-auto"
        />
      </div>

      <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-5">
        {filteredData.length === 0 ? (
          <EmptyState
            icon="heroicons:user-minus-20-solid"
            title="Arsip Nonaktif Kosong"
            description="Tidak ada catatan mantan pemilik kios nonaktif yang cocok dengan pencarian."
          />
        ) : (
          <Table
            caption="Daftar Arsip Pemilik Kios Nonaktif"
            headers={tableHeaders}
            colSpan={6}
            sortConfig={sortConfig}
            onSort={handleSort}
            footer={
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredData.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  itemName="arsip"
                />
              }
            >
              {paginatedData.map((tenant, idx) => (
                <tr key={tenant.id || idx} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-warm-gray/20 transition-colors">
                  <th scope="row" className="p-3 font-bold text-start text-text">
                    {tenant.nama}
                  </th>
                  <td className="font-tabular-nums font-extrabold p-3 text-red">
                    {tenant.kios}
                  </td>
                  <td className="p-3 text-text-2 font-medium">
                    {tenant.usaha || '—'}
                  </td>
                  <td className="p-3">
                    <Badge status="Belum Bayar" customText="Nonaktif" />
                  </td>
                  <td className="p-3 text-xs text-text-2 font-medium">
                    {tenant.rincianTunggakan}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/admin/kios/${tenant.kios}`)}
                      className="h-8 px-3 text-xs font-bold"
                    >
                      Detail Legalitas
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
        )}
      </Card>
    </div>
  );
}

export default RiwayatPemilikKios;
