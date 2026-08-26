import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Table, StatCard, Badge, Button, Card, Icon, AlokasiBreakdown, EmptyState, SkeletonCard, SkeletonTable, Pagination, cn } from '@bunsay/shared-ui';
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
        const [dashResult, kiosResult, bayarResult] = await Promise.allSettled([
          httpClient.get('/api/v1/admin/dashboard'),
          httpClient.get('/api/v1/admin/kios'),
          httpClient.get('/api/v1/admin/pembayaran')
        ]);

        if (dashResult.status === 'fulfilled' && dashResult.value?.data) {
          setMetrics(dashResult.value.data);
        }

        if (kiosResult.status === 'fulfilled') {
          const resKios = kiosResult.value;
          const rawKios = resKios?.data?.data || resKios?.data;
          if (Array.isArray(rawKios)) {
            const fetchedTenants = [];
            rawKios.forEach((item, idx) => {
              const sewaList = Array.isArray(item.sewa) ? item.sewa : (item.sewa ? [item.sewa] : []);
              if (sewaList.length === 0) {
                fetchedTenants.push({
                  id: item.Id_Kios || idx + 1,
                  idKios: item.Id_Kios,
                  idPemilik: null,
                  nama: item.Nama || 'Kios Belum Tersewa',
                  kios: item.No_Kios || `Kios-${idx + 1}`,
                  usaha: 'Belum Ada Usaha',
                  tunggakan: 0,
                  statusPembayaran: 'Kosong'
                });
              } else {
                sewaList.forEach((sewaObj, sIdx) => {
                  const namaTenant = sewaObj?.pemilik?.Nama || item.tenant || item.Nama || 'Kios Tanpa Nama';
                  const jenisUsaha = sewaObj?.Jenis_Usaha || item.usaha || 'Perdagangan Umum';
                  const idPemilik = sewaObj?.pemilik?.Id_Pemilik || sewaObj?.Id_Pemilik;
                  
                  const tagihanList = Array.isArray(sewaObj?.tagihan) ? sewaObj.tagihan : [];
                  const latestBill = tagihanList.length > 0 
                    ? [...tagihanList].sort((a, b) => String(b.Periode || b.Id_Tagihan || '').localeCompare(String(a.Periode || a.Id_Tagihan || '')))[0] 
                    : null;
                  
                  const unpaidBills = tagihanList.filter(t => ['Belum Bayar', 'Dicicil', 'Menunggu Verifikasi'].includes(t.Status_Tagihan));
                  const totalTunggakan = unpaidBills.reduce((acc, t) => acc + Number(t.Sisa_Tagihan ?? t.Total_Tagihan ?? 0), 0);

                  let statusPembayaran = 'Belum Bayar';
                  if (latestBill) {
                    if (latestBill.Status_Tagihan === 'Lunas') {
                      statusPembayaran = 'Lunas';
                    } else if (latestBill.Status_Tagihan === 'Menunggu Verifikasi') {
                      statusPembayaran = 'Menunggu Verifikasi';
                    } else if (latestBill.Status_Tagihan === 'Dicicil') {
                      statusPembayaran = 'Dicicil';
                    } else {
                      statusPembayaran = 'Belum Bayar';
                    }
                  } else if (item.Status === 'Kosong') {
                    statusPembayaran = 'Kosong';
                  }

                  fetchedTenants.push({
                    id: sewaObj.Id_Sewa ? `sewa-${sewaObj.Id_Sewa}` : (item.Id_Kios || idx + 1),
                    idSewa: sewaObj.Id_Sewa,
                    idKios: item.Id_Kios,
                    idPemilik: idPemilik,
                    nama: namaTenant,
                    kios: item.No_Kios || `Kios-${idx + 1}`,
                    usaha: jenisUsaha,
                    tunggakan: totalTunggakan,
                    statusPembayaran: statusPembayaran
                  });
                });
              }
            });
            setTenants(fetchedTenants);
          }
        }

        if (bayarResult.status === 'fulfilled') {
          const resPembayaran = bayarResult.value;
          const rawPembayaran = resPembayaran?.data?.data || resPembayaran?.data;
          if (Array.isArray(rawPembayaran)) {
            const mappedQueue = rawPembayaran.map(p => ({
              id: `TRX-${p.Id_Pembayaran}`,
              nama: p.tagihan?.sewa?.pemilik?.Nama || 'Tenant',
              kios: p.tagihan?.sewa?.kios?.No_Kios || 'Kios',
              tagihan: `Sewa Kios ${p.tagihan?.Periode || 'Berjalan'}`,
              nominal: `Rp ${Number(p.Total_Bayar || 0).toLocaleString('id-ID')}`,
              labelMetode: p.Metode_Bayar || 'Transfer Bank',
              waktu: p.Tanggal_Bayar || 'Baru Saja',
              status: p.Verifikasi_Pembayaran === 'Diterima' ? 'Lunas' : 'Menunggu Verifikasi',
              alokasi: []
            }));
            setAntrean(mappedQueue);
          }
        }

        if (dashResult.status === 'rejected' && kiosResult.status === 'rejected' && bayarResult.status === 'rejected') {
          setErrorMsg('Gagal memuat data dashboard. Silakan periksa koneksi atau muat ulang halaman.');
        }
      } catch (err) {
        console.error('Gagal memuat data dashboard:', err);
        setErrorMsg('Gagal memuat data dashboard. Silakan periksa koneksi atau muat ulang halaman.');
      } finally {
        setIsLoading(false);
      }
    }

    loadRealDashboardData();
  }, [httpClient]);

  const tableHeaders = [
    { label: 'Nama Tenant', sortKey: 'nama' },
    { label: 'No. Kios', sortKey: 'kios' },
    { label: 'Jenis Usaha', sortKey: 'usaha', className: 'hidden sm:table-cell' },
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
    return [...list].sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      return direction === 'asc'
        ? String(valA).localeCompare(String(valB), undefined, { numeric: true })
        : String(valB).localeCompare(String(valA), undefined, { numeric: true });
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
    <div data-slot="dashboard-admin" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans max-w-7xl mx-auto w-full">
      {errorMsg && (
        <div className="bg-red text-white font-bold text-sm px-4 py-3.5 rounded-xl shadow-card flex items-center justify-between animate-fade-in border border-red-rich">
          <div className="flex items-center gap-2.5">
            <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            aria-label="Tutup notifikasi error"
            className="text-white hover:opacity-80 p-1 cursor-pointer"
          >
            <Icon icon="heroicons:x-mark-20-solid" className="size-4" />
          </button>
        </div>
      )}

      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Dashboard Pengelola Plaza
          </h1>
          <p className="text-text-2 text-xs sm:text-sm font-medium mt-1 text-pretty">
            Ringkasan data pembayaran sewa, antrean verifikasi bukti transfer, dan administrasi kios.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-mono-100 border border-border text-xs sm:text-sm font-bold text-text-2 shadow-2xs">
            <Icon icon="heroicons:calendar-days-20-solid" className="size-4.5 text-red" />
            <span>Periode: {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())}</span>
          </span>
        </div>
      </div>

      {/* 3 Summary StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="Total Kios Terisi"
          value={metrics?.kios_terisi ?? totalTenant}
          color="text"
          subtext="Unit aktif terdaftar"
          icon={<Icon icon="heroicons:building-storefront-20-solid" className="size-5.5" />}
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={verifikasiCount}
          color={verifikasiCount > 0 ? "amber" : "text"}
          subtext="Perlu konfirmasi loket admin"
          trend={verifikasiCount > 0 ? "action" : "optimal"}
          trendLabel={verifikasiCount > 0 ? `${verifikasiCount} Antrean` : "Semua Beres"}
          icon={<Icon icon="heroicons:clock-20-solid" className="size-5.5" />}
        />
        <StatCard
          label="Belum Bayar Bulan Ini"
          value={belumBayarCount}
          color={belumBayarCount > 0 ? "red" : "green"}
          subtext="Siklus sewa bulan berjalan"
          trend={belumBayarCount > 0 ? "warning" : "positive"}
          trendLabel={belumBayarCount > 0 ? "Perlu Follow-up" : "100% Lunas"}
          icon={<Icon icon="heroicons:exclamation-triangle-20-solid" className="size-5.5" />}
        />
      </div>

      {/* Main Kiosk Administration Data Table (Seamless Edge-to-Edge Surface) */}
      <div className="w-full bg-white rounded-3xl border border-border/80 shadow-card overflow-hidden flex flex-col">
        {/* Table Toolbar Header */}
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 bg-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-red-50 text-red border border-red/20 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Icon icon="heroicons:table-cells-20-solid" className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-text tracking-tight text-balance">
                Daftar Administrasi Kios
              </h2>
              <p className="text-xs sm:text-sm text-text-3 font-medium">
                Status pembayaran dan kewajiban sewa seluruh unit kios pada siklus berjalan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Icon icon="heroicons:magnifying-glass-20-solid" className="size-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" />
              <input
                type="text"
                placeholder="Cari nama tenant / nomor kios..."
                aria-label="Cari nama tenant atau nomor kios"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm font-semibold rounded-xl border border-border bg-mono-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red focus:border-red transition-all shadow-2xs"
              />
            </div>

            {/* Filter Status */}
            <select
              aria-label="Filter status pembayaran kios"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 text-xs sm:text-sm font-extrabold rounded-xl border border-border bg-white text-text px-3.5 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red shadow-2xs"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Belum Bayar">Belum Bayar</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={6} cols={6} />
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="heroicons:user-group-20-solid"
              title="Tenant Tidak Ditemukan"
              description="Tidak ada data tenant yang cocok dengan kriteria pencarian atau filter status."
            />
          </div>
        ) : (
          <Table
            className="border-0 rounded-none shadow-none"
            caption="Daftar Status Pembayaran Tenant Bulan Ini"
            ariaLabel="Tabel Status Pembayaran Kios Plaza Kebun Sayur"
            headers={tableHeaders}
            colSpan={6}
            sortConfig={sortConfig}
            onSort={handleSort}
            footer={
              <Pagination
                currentPage={currentPage}
                totalItems={filteredTenants.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemName="tenant"
              />
            }
          >
            {filteredTenants.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((tenant, idx) => {
              const isVerifikasiPending = tenant.statusPembayaran === 'Menunggu Verifikasi';
              return (
                <tr key={tenant.id || idx} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-red-50/20 transition-colors">
                  <th scope="row" data-label="Nama Tenant" className="py-3 px-3 sm:px-4 font-extrabold text-start text-text text-sm sm:text-base">
                    {tenant.nama}
                  </th>
                  <td data-label="No. Kios" className="font-tabular-nums font-extrabold py-3 px-3 sm:px-4 text-text text-xs sm:text-sm">
                    <span className="bg-mono-100/90 text-red px-2.5 py-0.5 rounded-lg border border-border/70 font-extrabold font-tabular-nums">
                      {tenant.kios}
                    </span>
                  </td>
                  <td data-label="Jenis Usaha" className="hidden sm:table-cell py-3 px-3 sm:px-4 text-text-2 font-semibold text-xs sm:text-sm">
                    {tenant.usaha}
                  </td>
                  <td data-label="Tunggakan" className={cn("font-tabular-nums py-3 px-3 sm:px-4 font-black text-xs sm:text-sm", tenant.tunggakan > 0 ? "text-orange" : "text-text")}>
                    Rp {tenant.tunggakan.toLocaleString('id-ID')}
                  </td>
                  <td data-label="Status Tagihan" className="py-3 px-3 sm:px-4">
                    <Badge status={tenant.statusPembayaran} />
                  </td>
                  <td data-label="Aksi" className="py-3 px-3 sm:px-4 text-center">
                    {isVerifikasiPending ? (
                      <Button
                        variant="primary"
                        size="xs"
                        className="gap-1 bg-amber-500 hover:bg-amber-600 border-amber-600 text-white font-extrabold shadow-2xs"
                        onClick={() => handleOpenVerifikasi(tenant)}
                        aria-label={`Verifikasi bukti bayar ${tenant.nama} kios ${tenant.kios}`}
                      >
                        <Icon icon="heroicons:check-badge-20-solid" className="size-3.5" />
                        <span>Verifikasi Bukti</span>
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="xs"
                        className="gap-1 text-text-2 font-bold hover:text-red hover:border-red shadow-2xs"
                        onClick={() => navigate('/admin/detail-keuangan', { state: { tenant } })}
                        aria-label={`Lihat detail informasi kios ${tenant.kios}`}
                      >
                        <Icon icon="heroicons:eye-20-solid" className="size-3.5" />
                        <span>Detail Kios</span>
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>

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
          <div className="flex flex-col gap-5 text-sm font-sans">
            <Card variant="inset" className="p-4 flex flex-col gap-2.5">
              <div><span className="text-text-3 font-semibold text-xs">Periode:</span> <strong className="text-text font-bold block">{verifikasiTarget.antrean.tagihan}</strong></div>
              <div><span className="text-text-3 font-semibold text-xs">Nominal Pembayaran:</span> <strong className="text-text font-bold font-tabular-nums block">{verifikasiTarget.antrean.nominal}</strong></div>
              <div><span className="text-text-3 font-semibold text-xs">Metode:</span> <strong className="text-text font-bold block">{verifikasiTarget.antrean.labelMetode}</strong></div>
              <div><span className="text-text-3 font-semibold text-xs">Waktu Pengiriman:</span> <strong className="text-text font-bold block">{verifikasiTarget.antrean.waktu}</strong></div>
            </Card>

            <AlokasiBreakdown alokasiList={verifikasiTarget.antrean.alokasi} />
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default DashboardAdmin;

