import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useTenantDashboard } from '../../hooks/useTenant';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Icon from '../../components/ui/Icon';
import { SkeletonCard, SkeletonText } from '../../components/ui/Skeleton';

function DashboardTenant() {
  const navigate = useNavigate();
  const { setBayar } = useUI();
  const { data, loading, error, refetch } = useTenantDashboard();

  if (loading) {
    return (
      <div className="page-fade-in flex flex-col gap-8">
        <div className="space-y-2">
          <SkeletonText className="h-9 w-64" />
          <SkeletonText className="h-5 w-96 max-w-full" />
        </div>
        <SkeletonCard className="h-36 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard className="h-36" />
          <SkeletonCard className="h-36" />
          <SkeletonCard className="h-36" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="inset" className="p-10 text-center my-8">
        <p className="text-red font-bold text-base mb-4">Gagal memuat data. Silakan coba lagi.</p>
        <Button variant="primary" onClick={refetch}>
          Muat Ulang
        </Button>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-text-3 font-medium">Data tidak tersedia.</div>
    );
  }

  const { nama, kios, siklusSewa, tagihanBerjalan } = data || {};
  
  const periodeText = siklusSewa ? `${siklusSewa.tanggalMulai} s/d ${siklusSewa.tanggalSelesai}` : '—';
  const jatuhTempo = siklusSewa?.jatuhTempo || '—';
  const tarifSewaVal = tagihanBerjalan ? (tagihanBerjalan.tarifSewa ?? 0) : 0;
  const hutangTunggakanVal = tagihanBerjalan ? (tagihanBerjalan.hutangTunggakan ?? 0) : 0;
  const totalTagihanVal = tagihanBerjalan ? (tagihanBerjalan.totalTagihan ?? (tarifSewaVal + hutangTunggakanVal)) : 0;
  const statusTagihan = tagihanBerjalan?.statusTagihan || 'Lunas';

  const perluBayar = (statusTagihan === 'Belum Bayar' || statusTagihan === 'Dicicil') && totalTagihanVal > 0;
  const sedangVerifikasi = statusTagihan === 'Menunggu Verifikasi';

  const handleBayar = (nominal) => {
    setBayar(String(nominal), 'Pelunasan Masa Sewa & Tunggakan');
    navigate('/tenant/pembayaran');
  };

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
