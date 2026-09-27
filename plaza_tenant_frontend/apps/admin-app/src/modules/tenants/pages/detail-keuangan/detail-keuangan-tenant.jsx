import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, Table, EmptyState, SkeletonTable, SkeletonCard, Pagination, BuktiPembayaranModal, formatDateTimeLocal, cn } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function DetailKeuanganTenant() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { httpClient } = useAdminAuth();

  const stateTenant = location.state?.tenant || null;

  const [isLoading, setIsLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState(stateTenant || {
    id: id || 1,
    nama: 'Memuat Data Tenant...',
    kios: id || '—',
    usaha: '—',
    statusPembayaran: '—',
    tunggakan: 0
  });

  const [riwayat, setRiwayat] = useState([]);
  const [tagihanList, setTagihanList] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetode, setSelectedMetode] = useState('Semua');
  const [sortConfig, setSortConfig] = useState({ key: 'tanggal', direction: 'desc' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const fetchTenantFinancialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Kios list if stateTenant is not passed
      let currentTenant = stateTenant;
      if (!currentTenant && id) {
        try {
          const resKios = await httpClient.get(`/api/v1/admin/kios/${id}`);
          if (resKios?.data?.data) {
            const k = resKios.data.data;
            const s = Array.isArray(k.sewa) ? (k.sewa.find(item => item.Status === 'Aktif') || k.sewa[0]) : k.sewa;
            currentTenant = {
              id: k.Id_Kios,
              nama: s?.pemilik?.Nama || 'Penyewa Kios',
              kios: k.No_Kios || id,
              usaha: s?.Jenis_Usaha || 'Perdagangan Umum',
              statusPembayaran: k.Status === 'Terisi' ? 'Lunas' : 'Belum Bayar',
              tunggakan: 0
            };
          }
        } catch (_) {}
      }

      // 2. Fetch all payments and tagihan in parallel (Zero Waterfall Latency)
      const [resPembayaran, resTagihan] = await Promise.all([
        httpClient.get('/api/v1/admin/pembayaran').catch(() => ({ data: [] })),
        httpClient.get('/api/v1/admin/tagihan').catch(() => ({ data: [] }))
      ]);
      const allPembayaran = resPembayaran?.data || [];
      const allTagihan = resTagihan?.data || [];

      const targetIdKios = currentTenant?.idKios || currentTenant?.id;
      const targetIdPemilik = currentTenant?.idPemilik;
      const targetKios = (currentTenant?.kios || id || '').toLowerCase().trim();
      const targetNama = (currentTenant?.nama || '').toLowerCase().trim();

      // Filter payments matching this tenant / kiosk
      const matchedPayments = allPembayaran.filter(p => {
        const pIdKios = p.tagihan?.sewa?.kios?.Id_Kios || p.tagihan?.sewa?.Id_Kios;
        const pIdPemilik = p.tagihan?.sewa?.pemilik?.Id_Pemilik || p.tagihan?.sewa?.Id_Pemilik;
        const pKios = (p.tagihan?.sewa?.kios?.No_Kios || p.tagihan?.sewa?.kios?.Kode_Kios || '').toLowerCase().trim();
        const pNama = (p.tagihan?.sewa?.pemilik?.Nama || p.tagihan?.sewa?.pemilik?.Nama_Pemilik || '').toLowerCase().trim();

        if (targetKios && pKios) return pKios === targetKios;
        if (targetIdKios && pIdKios) return String(targetIdKios) === String(pIdKios);
        if (targetIdPemilik && pIdPemilik) return String(targetIdPemilik) === String(pIdPemilik);
        if (targetNama && pNama) return pNama === targetNama;

        return false;
      }).map(p => ({
        id: `TRX-${p.Id_Pembayaran}`,
        idReal: p.Id_Pembayaran,
        periode: p.tagihan?.Periode ? `Sewa Kios ${p.tagihan.Periode}` : (p.Periode ? `Sewa Kios ${p.Periode}` : 'Sewa Kios'),
        tanggal: p.Tanggal_Bayar || '-',
        waktu: p.created_at || p.Tanggal_Bayar || '-',
        nominal: Number(p.Total_Bayar || 0),
        nominalAngka: Number(p.Total_Bayar || 0),
        metode: p.Metode_Bayar || 'Transfer',
        status: p.Verifikasi_Pembayaran === 'Diterima' ? 'Lunas' : (p.Verifikasi_Pembayaran === 'Ditolak' ? 'Ditolak' : (p.Verifikasi_Pembayaran || 'Menunggu')),
        buktiUrl: p.Bukti_Pembayaran || '',
        nama: p.tagihan?.sewa?.pemilik?.Nama || p.tagihan?.sewa?.pemilik?.Nama_Pemilik || currentTenant?.nama || 'Tenant',
        kios: p.tagihan?.sewa?.kios?.No_Kios || currentTenant?.kios || '',
        catatanAdmin: p.catatan_admin || p.Catatan_Admin || '',
        teksSanggahan: p.teks_sanggahan || '',
        buktiSanggahan: p.bukti_sanggahan || '',
        details: p.details || [],
        tagihan: p.tagihan || null,
        alokasi: p.alokasi || []
      }));

      // Filter tagihan matching this tenant / kiosk
      const matchedBills = allTagihan.filter(t => {
        const tIdKios = t.sewa?.kios?.Id_Kios || t.sewa?.Id_Kios;
        const tIdPemilik = t.sewa?.pemilik?.Id_Pemilik || t.sewa?.Id_Pemilik;
        const tKios = (t.sewa?.kios?.No_Kios || t.sewa?.kios?.Kode_Kios || '').toLowerCase().trim();
        const tNama = (t.sewa?.pemilik?.Nama || t.sewa?.pemilik?.Nama_Pemilik || '').toLowerCase().trim();

        if (targetKios && tKios) return tKios === targetKios;
        if (targetIdKios && tIdKios) return String(targetIdKios) === String(tIdKios);
        if (targetIdPemilik && tIdPemilik) return String(targetIdPemilik) === String(tIdPemilik);
        if (targetNama && tNama) return tNama === targetNama;

        return false;
      });

      // Calculate total unpaid tunggakan exclusively for THIS tenant / kiosk
      const totalTunggakan = matchedBills.reduce((acc, curr) => {
        if (curr.Status_Tagihan !== 'Lunas') {
          return acc + Number(curr.Sisa_Tagihan || curr.Total_Tagihan || 0);
        }
        return acc;
      }, 0);

      // Determine latest bill status (sorted by Periode descending)
      const sortedBills = [...matchedBills].sort((a, b) => (b.Periode || '').localeCompare(a.Periode || ''));
      const latestBill = sortedBills[0];
      const realStatusPembayaran = latestBill ? latestBill.Status_Tagihan : (currentTenant?.statusPembayaran || 'Lunas');

      if (currentTenant) {
        setTenantInfo({
          ...currentTenant,
          tunggakan: totalTunggakan,
          statusPembayaran: realStatusPembayaran
        });
      }

      setRiwayat(matchedPayments);
      setTagihanList(matchedBills);
    } catch (err) {
      console.warn('Gagal memuat rincian keuangan tenant:', err);
    } finally {
      setIsLoading(false);
    }
  }, [httpClient, id, stateTenant]);

  useEffect(() => {
    fetchTenantFinancialData();
  }, [fetchTenantFinancialData]);

  const tableHeaders = [
    { label: 'ID Transaksi', sortKey: 'id' },
    { label: 'Periode & Tanggal', sortKey: 'tanggal' },
    { label: 'Nominal Bayar', sortKey: 'nominal' },
    { label: 'Metode' },
    { label: 'Status', align: 'center', sortKey: 'status' },
    { label: 'Resi & Bukti', align: 'center', sortable: false }
  ];

  const filteredAndSortedRiwayat = useMemo(() => {
    let list = riwayat.filter(item => {
      const matchesMetode = selectedMetode === 'Semua' || (
        selectedMetode === 'Transfer' ? item.metode === 'Transfer' :
        selectedMetode === 'Midtrans' ? item.metode === 'Midtrans' :
        selectedMetode === 'Tunai' ? item.metode === 'Tunai' : true
      );
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.periode && item.periode.toLowerCase().includes(q)) ||
        (item.buktiUrl && item.buktiUrl.toLowerCase().includes(q))
      );
      return matchesMetode && matchesQuery;
    });

    return list.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'tanggal') {
        aVal = new Date(a.waktu || a.tanggal).getTime() || 0;
        bVal = new Date(b.waktu || b.tanggal).getTime() || 0;
      } else if (sortConfig.key === 'nominal') {
        aVal = Number(a.nominal || 0);
        bVal = Number(b.nominal || 0);
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [riwayat, selectedMetode, searchQuery, sortConfig]);

  const paginatedRiwayat = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedRiwayat.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedRiwayat, currentPage, pageSize]);

  return (
    <div data-slot="detail-keuangan-tenant" className="page-fade-in flex flex-col gap-4 sm:gap-6 font-sans">
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate('/admin/dashboard');
            }
          }}
          className="mb-2 gap-1.5 font-bold h-8 text-xs px-2.5"
        >
          <Icon icon="heroicons:arrow-left-20-solid" className="size-4" />
          <span>Kembali</span>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text text-balance">
              Detail Keuangan: {tenantInfo.nama}
            </h1>
            <p className="text-text-2 text-xs sm:text-sm font-normal mt-0.5">
              Nomor Kios: <strong className="font-tabular-nums text-red">{tenantInfo.kios}</strong> — {tenantInfo.usaha}
            </p>
          </div>

          {tenantInfo.kios && tenantInfo.kios !== '—' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/admin/kios/${tenantInfo.kios}`)}
              className="gap-1.5 font-bold h-9 text-xs sm:text-sm shadow-2xs self-start sm:self-auto shrink-0 hover:text-red hover:border-red"
            >
              <Icon icon="heroicons:building-storefront-20-solid" className="size-4 text-red" />
              <span>Detail Administrasi Kios</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <Card variant="elevated" className="p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <span className="label-micro text-text-3">Status Pembayaran Terakhir</span>
              <div className="mt-1.5">
                <Badge status={tenantInfo.statusPembayaran} />
              </div>
            </Card>

            <Card variant="elevated" className="p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <span className="label-micro text-text-3">Total Tunggakan</span>
              <div className={cn("text-xl sm:text-2xl font-bold font-tabular-nums mt-1", tenantInfo.tunggakan > 0 ? 'text-orange' : 'text-green')}>
                Rp {tenantInfo.tunggakan.toLocaleString('id-ID')}
              </div>
            </Card>
          </div>
        )}

        {/* Main Tenant Financial History Table (Seamless Edge-to-Edge Surface) */}
        <div className="w-full bg-white rounded-3xl border border-border/80 shadow-card overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-border/80 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-text tracking-tight">
                Riwayat Transaksi
              </h2>
              <p className="text-xs text-text-2 font-normal">
                Daftar mutasi pembayaran dan resi transfer dari kios {tenantInfo.kios}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Icon
                  icon="heroicons:magnifying-glass-20-solid"
                  className="size-4 text-text-3 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari TRX / kode bukti…"
                  aria-label="Cari transaksi berdasarkan nomor atau kode bukti"
                  className="h-9 w-full sm:w-56 rounded-lg border border-border bg-white ps-9 pe-3 text-xs sm:text-sm font-semibold text-text placeholder:text-text-3 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-red shadow-xs"
                />
              </div>
              <label htmlFor="filter-metode" className="text-xs font-semibold text-text-2 shrink-0 hidden sm:block">
                Metode:
              </label>
              <select
                id="filter-metode"
                value={selectedMetode}
                onChange={(e) => {
                  setSelectedMetode(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-lg border border-border bg-white pl-3 pr-8 text-xs sm:text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red cursor-pointer shadow-xs"
              >
                <option value="Semua">Semua Metode</option>
                <option value="Transfer">Transfer Bank</option>
                <option value="Midtrans">Midtrans Gateway</option>
                <option value="Tunai">Tunai Loket</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <SkeletonTable rows={4} cols={6} />
            </div>
          ) : filteredAndSortedRiwayat.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="heroicons:receipt-refund-20-solid"
                title={selectedMetode !== 'Semua' || searchQuery ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
                description={selectedMetode !== 'Semua' || searchQuery ? "Coba gunakan kata kunci pencarian atau filter metode lain." : "Belum ada riwayat transaksi pembayaran untuk tenant ini."}
                actionLabel={selectedMetode !== 'Semua' || searchQuery ? "Reset Filter" : undefined}
                onAction={selectedMetode !== 'Semua' || searchQuery ? () => { setSelectedMetode('Semua'); setSearchQuery(''); } : undefined}
              />
            </div>
          ) : (
            <Table
              className="border-0 rounded-none shadow-none"
              caption={`Riwayat Transaksi Keuangan Kios ${tenantInfo.kios}`}
              ariaLabel={`Riwayat Transaksi Keuangan Kios ${tenantInfo.kios}`}
              headers={tableHeaders}
              sortConfig={sortConfig}
              onSort={handleSort}
              colSpan={6}
              footer={
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredAndSortedRiwayat.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  itemName="transaksi"
                />
              }
            >
              {paginatedRiwayat.map((row, idx) => {
                const formattedWaktu = formatDateTimeLocal(row.waktu || row.tanggal);
                return (
                  <tr key={row.id || idx} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-warm-gray/20 transition-colors">
                    <th scope="row" className="font-mono font-black text-xs sm:text-sm p-3 text-text text-start">
                      {row.id}
                    </th>
                    <td className="p-3 text-start">
                      <div className="font-semibold text-text text-xs sm:text-sm">{row.periode || 'Sewa Kios'}</div>
                      <div className="text-text-2 font-medium text-xs font-tabular-nums" title={formattedWaktu.fullTitle}>
                        {formattedWaktu.formatted}
                      </div>
                    </td>
                    <td className="font-tabular-nums font-black p-3 text-text whitespace-nowrap text-xs sm:text-sm">
                      Rp {row.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-text font-bold text-xs sm:text-sm">
                      {row.metode === 'Midtrans' ? 'Midtrans Gateway' : row.metode === 'Transfer' ? 'Transfer Bank' : row.metode === 'Tunai' ? 'Tunai Loket' : row.metode}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col gap-1 items-center justify-center">
                        <Badge status={row.status} />
                      </div>
                      {row.status === 'Ditolak' && row.catatanAdmin && (
                        <div className="mt-1 p-1.5 bg-red-50 border border-red/20 rounded-md text-2xs text-red font-medium text-start">
                          Alasan: "{row.catatanAdmin}"
                        </div>
                      )}
                      {row.teksSanggahan && (
                        <div className="mt-1 p-1.5 bg-amber-50 border border-amber-200 rounded-md text-2xs text-amber-900 font-semibold flex flex-col gap-0.5 text-start">
                          <span>Sanggahan: "{row.teksSanggahan}"</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedReceipt(row)}
                        aria-label={`Lihat rincian transaksi ${row.id}`}
                        className="font-bold text-xs gap-1.5 px-3 py-1.5 shadow-2xs mx-auto"
                      >
                        {row.metode === 'Midtrans' ? (
                          <>
                            <Icon icon="heroicons:bolt-20-solid" className="size-3.5 text-orange" />
                            <span>Resi Digital</span>
                          </>
                        ) : row.metode === 'Tunai' ? (
                          <>
                            <Icon icon="heroicons:document-text-20-solid" className="size-3.5 text-amber-700" />
                            <span>Rincian</span>
                          </>
                        ) : (
                          <>
                            <Icon icon="heroicons:photo-20-solid" className="size-3.5 text-green" />
                            <span>Foto Bukti</span>
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </div>
      </div>

      {/* Modal Detail & Resi Transaksi */}
      <BuktiPembayaranModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        item={selectedReceipt}
      />
    </div>
  );
}

export default DetailKeuanganTenant;
