import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Table, StatCard, Badge, Button, Card, Icon, AlokasiBreakdown, EmptyState, SkeletonCard, SkeletonTable } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function DashboardAdmin() {
  const navigate = useNavigate();
  const { httpClient } = useAdminAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [showVerifikasiDrawer, setShowVerifikasiDrawer] = useState(false);
  const [verifikasiTarget, setVerifikasiTarget] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [antrean, setAntrean] = useState([]);
  const [tenants, setTenants] = useState([]);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'kios', direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  useEffect(() => {
    async function loadRealDashboardData() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const resDashboard = await httpClient.get('/api/v1/admin/dashboard');
        if (resDashboard?.data) {
          setMetrics(resDashboard.data);
        }

        const resKios = await httpClient.get('/api/v1/admin/kios');
        const rawKios = resKios?.data?.data || resKios?.data;
        if (Array.isArray(rawKios)) {
          const fetchedTenants = rawKios.map((item, idx) => {
            const namaTenant = item.sewa?.pemilik?.Nama || item.sewa?.[0]?.pemilik?.Nama || item.tenant || item.Nama || 'Kios Tanpa Nama';
            const jenisUsaha = item.sewa?.Jenis_Usaha || item.sewa?.[0]?.Jenis_Usaha || item.usaha || 'Perdagangan Umum';
            return {
              id: item.Id_Kios || idx + 1,
              nama: namaTenant,
              kios: item.No_Kios || `Kios-${idx + 1}`,
              usaha: jenisUsaha,
              tunggakan: 0,
              statusPembayaran: item.Status === 'Terisi' ? 'Lunas' : 'Belum Bayar'
            };
          });
          setTenants(fetchedTenants);
        }

        const resPembayaran = await httpClient.get('/api/v1/admin/pembayaran');
        const rawPembayaran = resPembayaran?.data?.data || resPembayaran?.data;
        if (Array.isArray(rawPembayaran)) {
          const mappedQueue = rawPembayaran.map(p => ({
            id: `TRX-${p.Id_Pembayaran}`,
            nama: p.tagihan?.sewa?.pemilik?.Nama || 'Tenant',
            kios: p.tagihan?.sewa?.kios?.No_Kios || 'Kios',
            tagihan: `Sewa Kios ${p.tagihan?.Periode || 'Berjalan'}`,
            nominal: `Rp ${Number(p.Total_Bayar || 0).toLocaleString('id-ID')}`,
            labelMetode: `${p.Metode_Bayar || 'Transfer Bank'} (SQL DB)`,
            waktu: p.Tanggal_Bayar || 'Baru Saja',
            status: p.Verifikasi_Pembayaran === 'Diterima' ? 'Lunas' : 'Menunggu Verifikasi',
            alokasi: []
          }));
          setAntrean(mappedQueue);
        }
      } catch (err) {
        console.error('Gagal mengambil data dari database backend:', err);
        setErrorMsg('Gagal terhubung ke database backend SQL. Silakan periksa koneksi server.');
      } finally {
        setIsLoading(false);
      }
    }

    loadRealDashboardData();
  }, [httpClient]);

  const tableHeaders = [
    { label: 'Nama Tenant', sortKey: 'nama' },
    { label: 'No. Kios', sortKey: 'kios' },
    { label: 'Jenis Usaha', sortKey: 'usaha' },
    { label: 'Tunggakan', sortKey: 'tunggakan' },
    { label: 'Status Bulan Ini', sortKey: 'statusPembayaran' },
    { label: 'Aksi', align: 'center', sortable: false }
  ];

  const filteredTenants = useMemo(() => {
    let list = tenants.filter(tenant => {
      const matchesSearch = (tenant.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (tenant.kios || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (statusFilter === 'Semua') return matchesSearch;
      return matchesSearch && tenant.statusPembayaran === statusFilter;
    });

    const { key, direction } = sortConfig;
    return list.sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tenants, searchQuery, statusFilter, sortConfig]);

  const handleOpenVerifikasi = (tenant) => {
    const antreanItem = antrean.find(a => a.nama === tenant.nama);
    if (antreanItem) {
      setVerifikasiTarget({ tenant, antrean: antreanItem });
      setShowVerifikasiDrawer(true);
    }
  };

  const totalTenant = metrics?.total_kios ?? tenants.length;
  const verifikasiCount = metrics?.tagihan_menunggu ?? antrean.length;
  const belumBayarCount = metrics?.tagihan_pending ?? tenants.filter(t => t.statusPembayaran === 'Belum Bayar').length;

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {errorMsg && (
        <div className="bg-red-500 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:exclamation-triangle-20-solid" width="20" height="20" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

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
          value={metrics?.kios_terisi ?? totalTenant}
          color="red"
          icon={<Icon icon="heroicons:home-20-solid" width="24" height="24" />}
        />
        <StatCard
          label="Menunggu Verifikasi Transfer"
          value={verifikasiCount}
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
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Belum Bayar">Belum Bayar</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={4} cols={6} />
        ) : filteredTenants.length === 0 ? (
          <EmptyState
            icon="heroicons:user-minus-20-solid"
            title="Tenant Tidak Ditemukan"
            description="Tidak ada data tenant dari database backend yang cocok dengan kriteria pencarian atau filter status."
          />
        ) : (
          <Table
            caption="Daftar Status Pembayaran Tenant Bulan Ini"
            ariaLabel="Tabel Status Pembayaran Kios Plaza Kebun Sayur"
            headers={tableHeaders}
            colSpan={6}
            sortConfig={sortConfig}
            onSort={handleSort}
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
                      onClick={() => navigate('/admin/detail-keuangan', { state: { tenant } })}
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
