import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, Table, EmptyState, SkeletonTable, SkeletonCard, Pagination, formatDateTimeLocal, cn } from '@bunsay/shared-ui';
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
        tanggal: p.created_at || p.Tanggal_Bayar || '-',
        tipe: `Sewa Kios ${p.tagihan?.Periode || ''}`,
        nominal: Number(p.Total_Bayar || 0),
        metode: p.Metode_Bayar || 'Transfer Bank',
        status: p.Verifikasi_Pembayaran === 'Diterima' ? 'Lunas' : (p.Verifikasi_Pembayaran || 'Menunggu')
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
    { label: 'ID Transaksi' },
    { label: 'Tanggal Bayar' },
    { label: 'Jenis / Periode' },
    { label: 'Nominal Bayar' },
    { label: 'Metode Pembayaran' },
    { label: 'Status Verifikasi', align: 'center' }
  ];

  const paginatedRiwayat = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return riwayat.slice(startIndex, startIndex + pageSize);
  }, [riwayat, currentPage, pageSize]);

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
          <div className="p-4 sm:p-6 border-b border-border/80 bg-white">
            <h2 className="text-base sm:text-lg font-extrabold text-text tracking-tight">
              Riwayat Transaksi
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6">
              <SkeletonTable rows={4} cols={6} />
            </div>
          ) : riwayat.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="heroicons:receipt-refund-20-solid"
                title="Belum ada transaksi"
                description="Belum ada riwayat transaksi pembayaran untuk tenant ini."
              />
            </div>
          ) : (
            <Table
              className="border-0 rounded-none shadow-none"
              caption={`Riwayat Transaksi Keuangan Kios ${tenantInfo.kios}`}
              headers={tableHeaders}
              colSpan={6}
              footer={
                <Pagination
                  currentPage={currentPage}
                  totalItems={riwayat.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  itemName="transaksi"
                />
              }
            >
              {paginatedRiwayat.map((row, idx) => {
                const formattedWaktu = formatDateTimeLocal(row.tanggal);
                return (
                  <tr key={row.id || idx} className="border-b border-border/80 last:border-b-0 hover:bg-red-50/20 transition-colors">
                    <th scope="row" className="font-mono font-black py-3 px-4 text-text text-start text-xs sm:text-sm">
                      {row.id}
                    </th>
                    <td className="py-3 px-4 text-text-2 font-medium font-tabular-nums text-xs text-start" title={formattedWaktu.fullTitle}>
                      {formattedWaktu.formatted}
                    </td>
                    <td className="py-3 px-4 text-text font-bold text-xs sm:text-sm">
                      {row.tipe}
                    </td>
                  <td className="font-tabular-nums font-black py-3 px-4 text-text text-xs sm:text-sm">
                    Rp {row.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-text-3 font-semibold text-xs">
                    {row.metode}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge status={row.status} />
                  </td>
                </tr>
              );
            })}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailKeuanganTenant;
