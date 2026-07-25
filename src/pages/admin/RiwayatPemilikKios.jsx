import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTenants } from '../../hooks/useAdmin';
import Icon from '../../components/ui/Icon';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';

function RiwayatPemilikKios() {
  const navigate = useNavigate();
  const { data: tenants, loading, error, refetch } = useAdminTenants();
  const [searchQuery, setSearchQuery] = useState('');

  const tableHeaders = [
    { label: 'Nama Pemilik (Ex-Tenant)' },
    { label: 'Unit Kios Terakhir' },
    { label: 'Jenis Usaha' },
    { label: 'Status Keanggotaan' },
    { label: 'Keterangan' },
    { label: 'Aksi', align: 'center' }
  ];

  const nonactiveTenants = (tenants || []).filter(t => t.statusPemilik === 'Nonaktif');
  const filteredData = nonactiveTenants.filter(t => 
    (t.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.kios || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.usaha || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetailClick = (tenant) => {
    navigate('/admin/detail-administrasi', { 
      state: { 
        kiosId: tenant.kios,
        ownerData: tenant,
        from: '/admin/riwayat-pemilik',
        fromLabel: 'Kembali ke Riwayat Pemilik Kios'
      } 
    });
  };

  if (loading) {
    return (
      <div className="page-fade-in flex flex-col gap-8 font-sans">
        <div className="space-y-2">
          <SkeletonTable rows={1} className="h-9 w-64" />
          <SkeletonTable rows={1} className="h-5 w-80" />
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="inset" className="p-10 text-center my-8 font-sans">
        <p className="text-red font-bold text-base mb-4">Gagal memuat data riwayat pemilik.</p>
        <Button variant="primary" onClick={refetch}>
          Muat Ulang
        </Button>
      </Card>
    );
  }

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/kios')}
            className="mb-3 gap-2 font-bold"
          >
            <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
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
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Cari nama mantan pemilik kios nonaktif"
          className="h-10 px-3.5 rounded-md border border-border bg-white text-sm font-medium w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-red self-start sm:self-auto"
        />
      </div>

      <Card variant="elevated" className="p-4 sm:p-6">
        {filteredData.length === 0 ? (
          <EmptyState
            icon="heroicons:user-minus-20-solid"
            title="Arsip Nonaktif Kosong"
            description="Tidak ada catatan mantan pemilik kios nonaktif yang cocok dengan pencarian."
          />
        ) : (
          <Table
            caption="Daftar Arsip Pemilik Kios Nonaktif"
            ariaLabel="Tabel Riwayat Pemilik Kios Nonaktif Plaza Kebun Sayur"
            headers={tableHeaders}
            colSpan={6}
          >
            {filteredData.map((tenant, idx) => (
              <tr key={tenant.id || idx} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                <th scope="row" data-label="Nama Pemilik" className="p-3 font-bold text-left text-text">
                  {tenant.nama}
                </th>
                <td data-label="Unit Kios Terakhir" className="font-tabular-nums font-extrabold p-3 text-red">
                  {tenant.kios}
                </td>
                <td data-label="Jenis Usaha" className="p-3 text-text-2 font-medium">
                  {tenant.usaha || '—'}
                </td>
                <td data-label="Status Keanggotaan" className="p-3">
                  <Badge status="Kosong" />
                </td>
                <td data-label="Catatan" className="p-3 text-xs text-text-2 font-medium">
                  {tenant.rincianTunggakan || 'Pemilik lama telah berhenti berjualan'}
                </td>
                <td data-label="Aksi" className="p-3 text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDetailClick(tenant)}
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
