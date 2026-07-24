import React, { useState } from 'react';
import { useTransactionDomain } from '../../context/TransactionContext';
import { useUI } from '../../context/UIContext';
import { useAdminTenants } from '../../hooks/useAdmin';
import DetailKeuanganTenant from './DetailKeuanganTenant';
import Drawer from '../../components/ui/Drawer';
import Table from '../../components/ui/Table';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Icon from '../../components/ui/Icon';
import AlokasiBreakdown from '../../components/ui/AlokasiBreakdown';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';

function DashboardAdmin() {
  const { antrean, verifyTransaction } = useTransactionDomain();
  const { addToast } = useUI();
  const { data: tenants, loading, error, refetch } = useAdminTenants();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showVerifikasiDrawer, setShowVerifikasiDrawer] = useState(false);
  const [verifikasiTarget, setVerifikasiTarget] = useState(null);

  const tableHeaders = [
    { label: 'Nama Tenant' },
    { label: 'No. Kios' },
    { label: 'Jenis Usaha' },
    { label: 'Tunggakan' },
    { label: 'Status Bulan Ini' },
    { label: 'Aksi', align: 'center' },
  ];

  const filteredTenants = (tenants || []).filter(tenant => {
    if (tenant.statusPemilik === 'Nonaktif') return false;
    const matchesSearch = tenant.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tenant.kios.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'Semua') return matchesSearch;
    return matchesSearch && tenant.statusPembayaran === statusFilter;
  });

  const handleOpenVerifikasi = (tenant) => {
    const antreanItem = antrean.find(a => a.nama === tenant.nama);
    if (!antreanItem) {
      addToast('Tidak ada bukti transfer yang menunggu verifikasi untuk tenant ini.', 'info');
      return;
    }
    setVerifikasiTarget({ tenant, antrean: antreanItem });
    setShowVerifikasiDrawer(true);
  };

  const handleProsesVerifikasi = async (id, status) => {
    const statusFinal = status === 'konfirmasi' ? 'Lunas' : 'Ditolak';
    const alasan = status === 'konfirmasi' ? null : 'Bukti transfer tidak valid';
    const item = antrean.find(a => a.id === id);
    if (!item) return;

    try {
      const result = await verifyTransaction(id, statusFinal, alasan);
      if (result && result.success) {
        addToast(result.message || `Pembayaran ${id} berhasil di-${status === 'konfirmasi' ? 'setujui' : 'tolak'}.`, status === 'konfirmasi' ? 'success' : 'error');
      } else {
        addToast(result?.message || 'Gagal memverifikasi transaksi.', 'error');
      }
    } catch (_) {
      addToast('Terjadi kesalahan saat memproses verifikasi.', 'error');
    }

    setShowVerifikasiDrawer(false);
    setVerifikasiTarget(null);
    refetch();
  };

  const handleDetailClick = (tenant) => {
    setSelectedTenant(tenant);
  };

  if (selectedTenant) {
    return <DetailKeuanganTenant tenant={selectedTenant} onBack={() => setSelectedTenant(null)} onUpdateTenant={() => {}} />;
  }

  if (loading) {
    return (
      <div className="page-fade-in flex flex-col gap-8">
        <div className="space-y-2">
          <SkeletonTable rows={1} className="h-10 w-64" />
          <SkeletonTable rows={1} className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="inset" className="p-10 text-center my-8">
        <p className="text-red font-bold text-base mb-4">Gagal memuat data tenant.</p>
        <Button variant="primary" onClick={refetch}>
          Muat Ulang
        </Button>
      </Card>
    );
  }

  const totalTenant = (tenants || []).filter(t => t.statusPemilik !== 'Nonaktif').length;
  const belumBayarCount = (tenants || []).filter(t => t.statusPembayaran === 'Belum Bayar' && t.statusPemilik !== 'Nonaktif').length;

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Dashboard Pengelola Plaza
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Ringkasan data pembayaran, antrean verifikasi, dan administrasi kios.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="Total Kios Terisi"
          value={totalTenant}
          color="red"
          icon={<Icon icon="heroicons:home-20-solid" width="24" height="24" />}
        />
        <StatCard
          label="Menunggu Verifikasi Transfer"
          value={antrean.length}
          color="orange"
          icon={<Icon icon="heroicons:clock-20-solid" width="24" height="24" />}
        />
        <StatCard
          label="Belum Bayar Bulan Ini"
          value={belumBayarCount}
          color="red"
          icon={<Icon icon="heroicons:exclamation-triangle-20-solid" width="24" height="24" />}
        />
      </div>

      <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-extrabold text-text tracking-tight text-balance">
            Daftar Administrasi Kios
          </h3>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari nama atau no kios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari nama tenant atau nomor kios"
              className="h-10 px-3.5 rounded-md border border-border bg-white text-sm font-medium w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-red"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status pembayaran bulan ini"
              className="h-10 px-3 rounded-md border border-border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red"
            >
              <option value="Semua">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Dicicil">Dicicil</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Belum Bayar">Belum Bayar</option>
            </select>
          </div>
        </div>

        {filteredTenants.length === 0 ? (
          <EmptyState
            icon="heroicons:user-minus-20-solid"
            title="Tenant Tidak Ditemukan"
            description="Tidak ada data tenant yang cocok dengan kriteria pencarian atau filter status."
          />
        ) : (
          <Table
            caption="Daftar Status Pembayaran Tenant Bulan Ini"
            ariaLabel="Tabel Status Pembayaran Kios Plaza Kebun Sayur"
            headers={tableHeaders}
            colSpan={6}
          >
            {filteredTenants.map((tenant, idx) => {
              const isVerifikasiPending = tenant.statusPembayaran === 'Menunggu Verifikasi';
              return (
                <tr key={tenant.id || idx} className={`border-b border-border/80 ${idx % 2 === 0 ? 'bg-white' : 'bg-warm-gray/30'}`}>
                  <th scope="row" data-label="Nama Tenant" className="p-3 font-semibold text-left text-text">
                    {tenant.nama}
                  </th>
                  <td data-label="No. Kios" className="font-tabular-nums font-extrabold p-3 text-text">
                    {tenant.kios}
                  </td>
                  <td data-label="Jenis Usaha" className="p-3 text-text-2 font-medium">
                    {tenant.usaha}
                  </td>
                  <td data-label="Tunggakan" className={`font-tabular-nums p-3 font-extrabold ${((tenant.hutangTunggakan ?? tenant.tunggakan ?? 0) > 0) ? 'text-orange' : 'text-text'}`}>
                    Rp {(tenant.hutangTunggakan ?? tenant.tunggakan ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td data-label="Status Bulan Ini" className="p-3">
                    <Badge 
                      status={tenant.statusPembayaran} 
                      clickable={isVerifikasiPending}
                      onClick={isVerifikasiPending ? () => handleOpenVerifikasi(tenant) : undefined}
                      aria-label={isVerifikasiPending ? `Verifikasi bukti transfer ${tenant.nama} (${tenant.kios})` : `Status pembayaran: ${tenant.statusPembayaran}`}
                    />
                  </td>
                  <td data-label="Aksi" className="p-3 text-center">
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDetailClick(tenant)} 
                      aria-label={`Lihat detail keuangan ${tenant.nama} (${tenant.kios})`}
                      className="h-9 px-4 text-xs font-bold"
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {/* Drawer Slide-Over Panel Verifikasi Bukti Transfer */}
      <Drawer
        isOpen={showVerifikasiDrawer}
        onClose={() => { setShowVerifikasiDrawer(false); setVerifikasiTarget(null); }}
        title="Verifikasi Bukti Transfer Bank"
        subtitle={verifikasiTarget ? `Tenant ${verifikasiTarget.tenant.nama} (${verifikasiTarget.tenant.kios})` : ''}
        size="md"
        footer={
          verifikasiTarget && (
            <>
              <Button 
                variant="danger"
                size="md"
                onClick={() => handleProsesVerifikasi(verifikasiTarget.antrean.id, 'tolak')} 
              >
                Tolak Bukti
              </Button>
              <Button 
                variant="primary"
                size="md"
                onClick={() => handleProsesVerifikasi(verifikasiTarget.antrean.id, 'konfirmasi')} 
              >
                Konfirmasi Lunas
              </Button>
            </>
          )
        }
      >
        {verifikasiTarget && (
          <div className="flex flex-col gap-5 text-sm">
            <Card variant="inset" className="p-4 flex flex-col gap-2.5">
              <div><span className="text-text-3 font-semibold">Jenis Tagihan:</span> <strong className="text-text font-bold">{verifikasiTarget.antrean.tagihan}</strong></div>
              <div><span className="text-text-3 font-semibold">Nominal Pembayaran:</span> <strong className="text-text font-bold font-tabular-nums">{verifikasiTarget.antrean.nominal}</strong></div>
              <div><span className="text-text-3 font-semibold">Metode:</span> <strong className="text-text font-bold">{verifikasiTarget.antrean.labelMetode || verifikasiTarget.antrean.metode}</strong></div>
              <div><span className="text-text-3 font-semibold">Waktu Pengiriman:</span> <strong className="text-text font-bold">{verifikasiTarget.antrean.waktu}</strong></div>
            </Card>

            <AlokasiBreakdown alokasiList={verifikasiTarget.antrean.alokasi} />

            <figure className="w-full min-h-[220px] bg-warm-gray/60 border-2 border-dashed border-border rounded-xl flex flex-col justify-center items-center text-center p-6 gap-2">
              <Icon icon="heroicons:photo-20-solid" width="32" height="32" className="text-text-3" />
              <figcaption className="text-xs text-text-3 font-medium italic">
                [Simulasi Lampiran Bukti_Transfer_{verifikasiTarget.antrean.id}.jpg]
              </figcaption>
            </figure>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default DashboardAdmin;
