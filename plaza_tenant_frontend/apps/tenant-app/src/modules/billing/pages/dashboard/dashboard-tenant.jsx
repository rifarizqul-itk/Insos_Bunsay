import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Icon, SkeletonCard, SkeletonText } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../../public/useTenantAuth';

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${day} ${months[month]} ${year}`;
};

function DashboardTenant() {
  const navigate = useNavigate();
  const { httpClient } = useTenantAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await httpClient.get('/api/v1/tenant/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBayar = (nominal) => {
    navigate('/tenant/pembayaran', { state: { nominal } });
  };

  if (loading) {
    return (
      <div className="page-fade-in flex flex-col gap-8 font-sans" role="status" aria-live="polite">
        <div className="flex flex-col gap-2">
          <SkeletonText className="h-10 w-48" />
          <SkeletonText className="h-5 w-64 animate-pulse" />
        </div>
        <div className="h-32 w-full rounded-xl bg-gray-200/50 animate-pulse border border-border/40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-fade-in flex flex-col items-center justify-center p-8 sm:p-12 bg-red-50/50 border-2 border-dashed border-red/20 rounded-xl gap-4 font-sans text-center max-w-xl mx-auto my-8">
        <div className="size-16 rounded-full bg-red-50 text-red flex items-center justify-center mb-2">
          <Icon icon="heroicons:exclamation-triangle" width="36" height="36" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-text tracking-tight">Gagal Memuat Dashboard</h3>
          <p className="text-text-2 text-sm font-semibold mt-1.5 leading-relaxed text-balance">{error}</p>
        </div>
        <Button variant="primary" size="md" onClick={fetchDashboardData} className="px-6 h-11 font-bold shadow-sm mt-2">
          Coba Muat Ulang
        </Button>
      </div>
    );
  }

  const { nama, kios, siklusSewa, tagihanBerjalan } = dashboardData || {};
  
  const periodeText = (siklusSewa?.tanggalMulai && siklusSewa?.tanggalSelesai) 
    ? `${formatDateIndo(siklusSewa.tanggalMulai)} s/d ${formatDateIndo(siklusSewa.tanggalSelesai)}` 
    : '—';
  const jatuhTempo = siklusSewa?.jatuhTempo ? formatDateIndo(siklusSewa.jatuhTempo) : '—';
  const tarifSewaVal = tagihanBerjalan ? (tagihanBerjalan.tarifSewa ?? 0) : 0;
  const hutangTunggakanVal = tagihanBerjalan ? (tagihanBerjalan.hutangTunggakan ?? 0) : 0;
  const totalTagihanVal = tagihanBerjalan ? (tagihanBerjalan.totalTagihan ?? (tarifSewaVal + hutangTunggakanVal)) : 0;
  const statusTagihan = tagihanBerjalan?.statusTagihan || 'Lunas';

  const perluBayar = (statusTagihan === 'Belum Bayar' || statusTagihan === 'Dicicil') && totalTagihanVal > 0;
  const sedangVerifikasi = statusTagihan === 'Menunggu Verifikasi';

  return (
    <div className="page-fade-in flex flex-col gap-8 font-sans">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight text-balance">
          Halo, {nama}
        </h1>
        <p className="text-text-2 text-base font-semibold mt-1 text-pretty">
          Pemilik Kios <span className="font-tabular-nums font-bold text-red">{kios}</span> — Selamat datang di akun Bunsay Anda.
        </p>
      </div>

      {perluBayar && (
        <div 
          role="alert"
          className="p-6 sm:p-7 md:p-8 bg-red-50 border-2 border-red rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-glow-maroon"
        >
          <div className="flex-1 min-w-[280px]">
            <span className="label-micro text-red">
              Tagihan Sewa & Tunggakan Bulan Ini
            </span>
            <p className="text-base sm:text-lg text-text font-bold mt-2 leading-relaxed text-pretty">
              Total tagihan yang perlu dibayar bulan ini adalah <span className="font-tabular-nums text-red font-extrabold">Rp {totalTagihanVal.toLocaleString('id-ID')}</span> (sewa bulan ini Rp {tarifSewaVal.toLocaleString('id-ID')} + sisa tunggakan Rp {hutangTunggakanVal.toLocaleString('id-ID')}).
            </p>
          </div>
          <div className="w-full md:w-auto">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="md:w-auto h-13 px-8 text-base font-extrabold gap-2 shadow-md"
              onClick={() => handleBayar(totalTagihanVal)}
            >
              Bayar Sekarang
              <Icon icon="heroicons:arrow-right-20-solid" width="20" height="20" />
            </Button>
          </div>
        </div>
      )}

      {sedangVerifikasi && (
        <div 
          role="status"
          className="p-6 sm:p-7 md:p-8 bg-orange-bg border-2 border-orange rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-card"
        >
          <div className="flex-1 min-w-[280px]">
            <span className="label-micro text-orange">
              Pembayaran Sedang Diverifikasi
            </span>
            <p className="text-base sm:text-lg text-text font-bold mt-2 leading-relaxed text-pretty">
              Bukti pembayaran sebesar <span className="font-tabular-nums text-orange font-extrabold">Rp {totalTagihanVal.toLocaleString('id-ID')}</span> sudah diterima dan sedang diperiksa oleh kantor pengelola.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              className="md:w-auto h-12 px-6 font-bold"
              onClick={() => navigate('/tenant/histori')}
            >
              Lihat Status Transaksi
            </Button>
          </div>
        </div>
      )}

      {!perluBayar && !sedangVerifikasi && (
        <div 
          role="status"
          className="p-6 sm:p-7 md:p-8 bg-green-50 border-2 border-green/30 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-card"
        >
          <div className="flex-1 min-w-[280px]">
            <span className="label-micro text-green font-bold">
              Status Tagihan Sewa
            </span>
            <p className="text-base sm:text-lg text-text font-bold mt-2 leading-relaxed text-pretty">
              Tidak ada tagihan aktif yang perlu dibayar saat ini. Semua tagihan sewa dan tunggakan Anda dalam kondisi lunas / bersih.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="flex flex-col justify-between">
          <div>
            <h2 className="label-micro text-balance">Masa Sewa Bulanan</h2>
            <div className="font-tabular-nums text-lg sm:text-xl font-extrabold text-text mt-2 mb-2 leading-tight">
              {periodeText}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-text-2 font-semibold border-t border-border/60 pt-3 mt-4 text-pretty">
            Jatuh tempo pelunasan: <strong className="font-tabular-nums text-text">{jatuhTempo}</strong>
          </p>
        </Card>

        <Card variant="elevated" className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="label-micro text-balance">Tarif Sewa Bulan Ini</h2>
              <Badge status={statusTagihan} />
            </div>
            <div className="font-tabular-nums text-2xl sm:text-3xl font-extrabold text-text tracking-tight my-2">
              Rp {tarifSewaVal.toLocaleString('id-ID')}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-text-2 font-semibold border-t border-border/60 pt-3 mt-4 text-pretty">
            Sewa unit kios berjalan
          </p>
        </Card>

        <Card variant="elevated" className="flex flex-col justify-between">
          <div>
            <h2 className="label-micro text-balance">Total Tunggakan Sewa</h2>
            <div className={`font-tabular-nums text-2xl sm:text-3xl font-extrabold tracking-tight my-2 ${hutangTunggakanVal > 0 ? 'text-orange' : 'text-green'}`}>
              Rp {hutangTunggakanVal.toLocaleString('id-ID')}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-text-2 font-semibold border-t border-border/60 pt-3 mt-4 text-pretty">
            Sisa tunggakan dari bulan-bulan sebelumnya
          </p>
        </Card>
      </div>
    </div>
  );
}

export default DashboardTenant;
