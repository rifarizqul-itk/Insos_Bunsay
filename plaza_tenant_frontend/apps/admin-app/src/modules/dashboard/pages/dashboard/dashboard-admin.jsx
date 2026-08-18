import React, { useState } from 'react';
import { Drawer, Table, StatCard, Badge, Button, Card, Icon, AlokasiBreakdown, EmptyState, SkeletonCard, SkeletonTable } from '@bunsay/shared-ui';

function DashboardAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [showVerifikasiDrawer, setShowVerifikasiDrawer] = useState(false);
  const [verifikasiTarget, setVerifikasiTarget] = useState(null);

  const antrean = [
    {
      id: 'TRX-1092',
      nama: 'Eva Tauresea',
      kios: 'B-1004',
      tagihan: 'Sewa Kios Mei 2026',
      nominal: 'Rp 4.000.000',
      labelMetode: 'Transfer Bank (BNI)',
      waktu: '19 Mei 2026, 14:20 WITA',
      status: 'Menunggu Verifikasi',
      alokasi: [{ idTagihan: 102, periode: '2026-05', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Lunas' }]
    }
  ];

  const tenants = [
    { id: 1, nama: 'Hj. Yuliana', kios: 'B-1001, B-1002', usaha: 'Sembako & Kelontong', tunggakan: 3500000, statusPembayaran: 'Belum Bayar' },
    { id: 2, nama: 'Eva Tauresea', kios: 'B-1004', usaha: 'Pakaian & Tekstil', tunggakan: 0, statusPembayaran: 'Menunggu Verifikasi' },
    { id: 3, nama: 'H. Ahmad', kios: 'B-1013', usaha: 'Warung Kopi & Makanan', tunggakan: 1500000, statusPembayaran: 'Dicicil' },
    { id: 4, nama: 'Toko Kalimantan', kios: 'A-1002', usaha: 'Kerajinan Khas Kaltim', tunggakan: 0, statusPembayaran: 'Lunas' }
  ];

  const tableHeaders = [
    { label: 'Nama Tenant' },
    { label: 'No. Kios' },
    { label: 'Jenis Usaha' },
    { label: 'Tunggakan' },
    { label: 'Status Bulan Ini' },
    { label: 'Aksi', align: 'center' }
  ];

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = (tenant.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (tenant.kios || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'Semua') return matchesSearch;
    return matchesSearch && tenant.statusPembayaran === statusFilter;
  });

  const handleOpenVerifikasi = (tenant) => {
    const antreanItem = antrean.find(a => a.nama === tenant.nama);
    if (antreanItem) {
      setVerifikasiTarget({ tenant, antrean: antreanItem });
      setShowVerifikasiDrawer(true);
    }
  };

  const totalTenant = tenants.length;
  const belumBayarCount = tenants.filter(t => t.statusPembayaran === 'Belum Bayar').length;

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
                <tr key={tenant.id || idx} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                  <th scope="row" data-label="Nama Tenant" className="p-3 font-semibold text-left text-text">
                    {tenant.nama}
                  </th>
                  <td data-label="No. Kios" className="font-tabular-nums font-extrabold p-3 text-text">
                    {tenant.kios}
                  </td>
                  <td data-label="Jenis Usaha" className="p-3 text-text-2 font-medium">
                    {tenant.usaha}
                  </td>
                  <td data-label="Tunggakan" className={`font-tabular-nums p-3 font-extrabold ${(tenant.tunggakan > 0) ? 'text-orange' : 'text-text'}`}>
                    Rp {tenant.tunggakan.toLocaleString('id-ID')}
                  </td>
                  <td data-label="Status Bulan Ini" className="p-3">
                    <Badge 
                      status={tenant.statusPembayaran} 
                      clickable={isVerifikasiPending}
                      onClick={isVerifikasiPending ? () => handleOpenVerifikasi(tenant) : undefined}
                    />
                  </td>
                  <td data-label="Aksi" className="p-3 text-center">
                    <Button 
                      variant="secondary"
                      size="sm"
                      className="min-h-[44px] sm:min-h-9 sm:h-9 px-4 text-xs font-bold"
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
                onClick={() => { setShowVerifikasiDrawer(false); setVerifikasiTarget(null); }}
              >
                Tolak Bukti
              </Button>
              <Button 
                variant="primary"
                size="md"
                onClick={() => { setShowVerifikasiDrawer(false); setVerifikasiTarget(null); }}
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
              <div><span className="text-text-3 font-semibold">Metode:</span> <strong className="text-text font-bold">{verifikasiTarget.antrean.labelMetode}</strong></div>
              <div><span className="text-text-3 font-semibold">Waktu Pengiriman:</span> <strong className="text-text font-bold">{verifikasiTarget.antrean.waktu}</strong></div>
            </Card>

            <AlokasiBreakdown alokasiList={verifikasiTarget.antrean.alokasi} />
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default DashboardAdmin;
