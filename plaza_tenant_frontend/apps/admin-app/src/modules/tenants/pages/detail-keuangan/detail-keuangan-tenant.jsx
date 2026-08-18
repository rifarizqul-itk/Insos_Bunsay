import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, Table, EmptyState, SkeletonTable, SkeletonCard, Pagination, cn } from '@bunsay/shared-ui';
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

      // 2. Fetch all payments and filter for this tenant/kios
      const resPembayaran = await httpClient.get('/api/v1/admin/pembayaran');
      const allPembayaran = resPembayaran?.data || [];

      // 3. Fetch tagihan to calculate real outstanding tunggakan
      let allTagihan = [];
      try {
        const resTagihan = await httpClient.get('/api/v1/admin/tagihan');
        allTagihan = resTagihan?.data || [];
      } catch (_) {}

      const targetKios = currentTenant?.kios || id || '';
      const targetNama = currentTenant?.nama || '';

      // Filter payments matching this tenant / kiosk
      const matchedPayments = allPembayaran.filter(p => {
        const pKios = p.tagihan?.sewa?.kios?.No_Kios || '';
        const pNama = p.tagihan?.sewa?.pemilik?.Nama || '';
        if (targetKios && pKios && pKios.toLowerCase() === targetKios.toLowerCase()) return true;
        if (targetNama && pNama && pNama.toLowerCase() === targetNama.toLowerCase()) return true;
        return false;
      }).map(p => ({
        id: `TRX-${p.Id_Pembayaran}`,
        tanggal: p.Tanggal_Bayar || '-',
        tipe: `Sewa Kios ${p.tagihan?.Periode || ''}`,
        nominal: Number(p.Total_Bayar || 0),
        metode: p.Metode_Bayar || 'Transfer Bank',
        status: p.Verifikasi_Pembayaran === 'Diterima' ? 'Lunas' : (p.Verifikasi_Pembayaran || 'Menunggu')
      }));

      // Filter tagihan matching this tenant / kiosk
      const matchedBills = allTagihan.filter(t => {
        const tKios = t.sewa?.kios?.No_Kios || '';
        const tNama = t.sewa?.pemilik?.Nama || '';
        if (targetKios && tKios && tKios.toLowerCase() === targetKios.toLowerCase()) return true;
        if (targetNama && tNama && tNama.toLowerCase() === targetNama.toLowerCase()) return true;
        return false;
      });

      // Calculate total unpaid tunggakan
      const totalTunggakan = matchedBills.reduce((acc, curr) => {
        if (curr.Status_Tagihan !== 'Lunas') {
          return acc + Number(curr.Sisa_Tagihan || curr.Total_Tagihan || 0);
        }
        return acc;
      }, 0);

      // Determine latest bill status
      const latestBill = matchedBills[0];
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
    { label: 'Status Verifikasi' }
  ];

  const paginatedRiwayat = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return riwayat.slice(startIndex, startIndex + pageSize);
  }, [riwayat, currentPage, pageSize]);

  return (
    <div data-slot="detail-keuangan-tenant" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 gap-2 font-bold"
        >
          <Icon icon="heroicons:arrow-left-20-solid" className="size-4.5" />
          <span>Kembali</span>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
              Detail Keuangan: {tenantInfo.nama}
            </h1>
            <p className="text-text-2 text-sm sm:text-base font-medium mt-1">
              Nomor Kios: <strong className="font-tabular-nums text-red">{tenantInfo.kios}</strong> — {tenantInfo.usaha}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card variant="elevated" className="p-5 flex flex-col justify-between">
              <span className="label-micro text-text-3">Status Pembayaran Tagihan Terakhir</span>
              <div className="mt-2">
                <Badge status={tenantInfo.statusPembayaran} />
              </div>
            </Card>

            <Card variant="elevated" className="p-5 flex flex-col justify-between">
              <span className="label-micro text-text-3">Total Tunggakan Akumulatif</span>
              <div className={cn("text-2xl sm:text-3xl font-extrabold font-tabular-nums mt-1", tenantInfo.tunggakan > 0 ? 'text-orange' : 'text-green')}>
                Rp {tenantInfo.tunggakan.toLocaleString('id-ID')}
              </div>
            </Card>
          </div>
        )}

        <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-5">
          <h3 className="text-lg font-extrabold text-text tracking-tight">
            Riwayat Transaksi Pembayaran Tenant
          </h3>

          {isLoading ? (
            <SkeletonTable rows={4} cols={6} />
          ) : riwayat.length === 0 ? (
            <EmptyState
              icon="heroicons:receipt-refund-20-solid"
              title="Belum Ada Transaksi"
              description="Tenant ini belum memiliki riwayat transaksi pembayaran di database."
            />
          ) : (
            <Table
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
              {paginatedRiwayat.map((row, idx) => (
                <tr key={row.id || idx} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-warm-gray/20 transition-colors">
                  <th scope="row" className="font-tabular-nums font-bold p-3 text-text text-start">
                    {row.id}
                  </th>
                  <td className="p-3 text-text-2 font-medium font-tabular-nums">
                    {row.tanggal}
                  </td>
                  <td className="p-3 text-text font-semibold">
                    {row.tipe}
                  </td>
                  <td className="font-tabular-nums font-extrabold p-3 text-text">
                    Rp {row.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-text-3 font-semibold text-xs">
                    {row.metode}
                  </td>
                  <td className="p-3">
                    <Badge status={row.status} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}

export default DetailKeuanganTenant;
