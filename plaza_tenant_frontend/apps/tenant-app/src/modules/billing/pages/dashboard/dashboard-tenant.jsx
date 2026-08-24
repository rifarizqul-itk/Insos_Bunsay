import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Icon, SkeletonCard, SkeletonText, cn } from '@bunsay/shared-ui';
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

const formatMonthYearText = (periodeStr) => {
  if (!periodeStr) {
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
  }

  if (/^\d{4}-\d{2}$/.test(periodeStr)) {
    const [year, monthNum] = periodeStr.split('-');
    const monthIdx = parseInt(monthNum, 10) - 1;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${months[monthIdx]} ${year}`;
  }

  return periodeStr;
};

const getMonthlyRangeText = (periodeStr, siklusSewa) => {
  let year = new Date().getFullYear();
  let monthIdx = new Date().getMonth();

  if (periodeStr) {
    if (/^\d{4}-\d{2}$/.test(periodeStr)) {
      const [y, m] = periodeStr.split('-');
      year = parseInt(y, 10);
      monthIdx = parseInt(m, 10) - 1;
    } else {
      const months = [
        'januari', 'februari', 'maret', 'april', 'mei', 'juni',
        'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
      ];
      const parts = periodeStr.split(' ');
      if (parts.length === 2) {
        const idx = months.indexOf(parts[0].toLowerCase());
        if (idx !== -1) {
          monthIdx = idx;
          year = parseInt(parts[1], 10);
        }
      }
    }
  } else if (siklusSewa?.tanggalMulai) {
    const parts = siklusSewa.tanggalMulai.split('-');
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      monthIdx = parseInt(parts[1], 10) - 1;
    }
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const lastDay = new Date(year, monthIdx + 1, 0).getDate();
  return `1 ${months[monthIdx]} ${year} s/d ${lastDay} ${months[monthIdx]} ${year}`;
};

const getFixedJatuhTempo = (periodeStr, rawJatuhTempo) => {
  let year = new Date().getFullYear();
  let monthIdx = new Date().getMonth();

  if (rawJatuhTempo && rawJatuhTempo.includes('-')) {
    const parts = rawJatuhTempo.split('-');
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      monthIdx = parseInt(parts[1], 10) - 1;
    }
  } else if (periodeStr && /^\d{4}-\d{2}$/.test(periodeStr)) {
    const [y, m] = periodeStr.split('-');
    year = parseInt(y, 10);
    monthIdx = parseInt(m, 10) - 1;
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return `12 ${months[monthIdx]} ${year}`;
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

  const handleBayar = (nominal, noKios = 'semua') => {
    navigate('/tenant/pembayaran', { state: { nominal, selectedKios: noKios } });
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

  const { nama, kios, siklusSewa, tagihanBerjalan, kiosBreakdown, totalTagihanSemuaKios, totalTunggakanLalu, tarifBulanIni } = dashboardData || {};
  
  const periodeText = (siklusSewa?.tanggalMulai && siklusSewa?.tanggalSelesai) 
    ? `${formatDateIndo(siklusSewa.tanggalMulai)} s/d ${formatDateIndo(siklusSewa.tanggalSelesai)}` 
    : '—';
  const jatuhTempo = siklusSewa?.jatuhTempo ? formatDateIndo(siklusSewa.jatuhTempo) : '—';
  
  const tarifSewaVal = Number(tarifBulanIni ?? (tagihanBerjalan ? (tagihanBerjalan.tarifSewa ?? 0) : 0));
  const hutangTunggakanVal = Number(totalTunggakanLalu ?? (tagihanBerjalan ? (tagihanBerjalan.hutangTunggakan ?? 0) : 0));
  const totalTagihanVal = Number(totalTagihanSemuaKios ?? (tarifSewaVal + hutangTunggakanVal));

  const hasUnpaidKiosk = kiosBreakdown && Array.isArray(kiosBreakdown) && kiosBreakdown.length > 0
    ? kiosBreakdown.some(k => (k.totalKewajiban ?? 0) > 0 || (k.tagihan && (k.tagihan.statusTagihan === 'Belum Bayar' || k.tagihan.statusTagihan === 'Dicicil' || k.tagihan.statusTagihan === 'Menunggak')))
    : (tagihanBerjalan?.statusTagihan === 'Belum Bayar' || tagihanBerjalan?.statusTagihan === 'Dicicil' || totalTagihanVal > 0);

  const hasVerifikasiKiosk = kiosBreakdown && Array.isArray(kiosBreakdown) && kiosBreakdown.length > 0
    ? kiosBreakdown.some(k => k.tagihan && k.tagihan.statusTagihan === 'Menunggu Verifikasi')
    : (tagihanBerjalan?.statusTagihan === 'Menunggu Verifikasi');

  const statusTagihan = hasUnpaidKiosk ? 'Belum Bayar' : (hasVerifikasiKiosk ? 'Menunggu Verifikasi' : (tagihanBerjalan?.statusTagihan || 'Lunas'));

  const perluBayar = hasUnpaidKiosk && totalTagihanVal > 0;
  const sedangVerifikasi = hasVerifikasiKiosk && !hasUnpaidKiosk;

  return (
    <div data-slot="dashboard-tenant" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans max-w-6xl mx-auto w-full">
      {/* Top Greeting & Tenant Profile Quick Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-text tracking-tight leading-snug">
              Halo, {nama}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red/20 text-red text-xs font-extrabold font-tabular-nums shrink-0 whitespace-nowrap shadow-2xs">
              <Icon icon="heroicons:building-storefront-20-solid" className="size-3.5 text-red shrink-0" />
              <span>Kios {kios}</span>
            </span>
          </div>
          <p className="text-text-2 text-xs sm:text-sm font-medium mt-1 text-pretty">
            Selamat datang di Portal Layanan Tenant Plaza Kebun Sayur Balikpapan.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/tenant/akun')}
          className="h-10 px-4 text-xs sm:text-sm font-bold gap-2 border-border bg-white hover:bg-mono-50 shadow-2xs shrink-0"
        >
          <Icon icon="heroicons:document-text-20-solid" className="size-4.5 text-red" />
          <span>Informasi Kios & Legalitas</span>
        </Button>
      </div>

      {/* Priority Action Banners */}
      {perluBayar && (
        <div 
          role="alert"
          className="p-5 sm:p-7 bg-red-50/90 border border-red/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-card"
        >
          <div className="flex-1 min-w-72">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red text-white text-xs font-extrabold tracking-wider uppercase mb-2">
              <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-4" />
              <span>Tagihan Sewa Perlu Dibayar</span>
            </div>
            <p className="text-sm sm:text-base text-text font-bold leading-relaxed text-pretty">
              Total kewajiban sewa yang perlu diselesaikan bulan ini adalah <strong className="font-tabular-nums text-red font-extrabold text-lg sm:text-xl">Rp {totalTagihanVal.toLocaleString('id-ID')}</strong>
              {kiosBreakdown && kiosBreakdown.length > 1 && (
                <span className="text-xs sm:text-sm font-semibold text-text-2 block mt-1">
                  (Mengakumulasikan seluruh tagihan aktif untuk {kiosBreakdown.length} unit kios Anda)
                </span>
              )}.
            </p>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="md:w-auto h-12 px-7 text-sm sm:text-base font-extrabold gap-2 shadow-card"
              onClick={() => handleBayar(totalTagihanVal)}
            >
              Bayar Sekarang
              <Icon icon="heroicons:arrow-right-20-solid" className="size-4.5" />
            </Button>
          </div>
        </div>
      )}

      {sedangVerifikasi && (
        <div 
          role="status"
          className="p-5 sm:p-7 bg-amber-50/90 border border-amber-300/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-card"
        >
          <div className="flex-1 min-w-72">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-extrabold tracking-wider uppercase mb-2">
              <Icon icon="heroicons:clock-20-solid" className="size-4" />
              <span>Sedang Diverifikasi</span>
            </div>
            <p className="text-sm sm:text-base text-text font-bold leading-relaxed text-pretty">
              Bukti pembayaran sebesar <span className="font-tabular-nums text-amber-800 font-extrabold">Rp {totalTagihanVal.toLocaleString('id-ID')}</span> sudah diterima dan sedang diperiksa oleh kantor pengelola plaza.
            </p>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              className="md:w-auto h-11 px-5 text-xs sm:text-sm font-bold bg-white"
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
          className="p-5 sm:p-7 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-card"
        >
          <div className="flex-1 min-w-72">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold tracking-wider uppercase mb-2">
              <Icon icon="heroicons:check-circle-20-solid" className="size-4" />
              <span>Semua Kewajiban Lunas</span>
            </div>
            <p className="text-sm sm:text-base text-text font-bold leading-relaxed text-pretty">
              Tidak ada tagihan aktif yang perlu dibayar saat ini. Seluruh tagihan sewa dan tunggakan dari seluruh kios Anda dalam kondisi bersih.
            </p>
          </div>
        </div>
      )}

      {/* CARD STATISTIK UTAMA / BENTO SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card variant="default" className="p-5 sm:p-6 flex flex-col justify-between rounded-2xl border border-border/80 shadow-card bg-white">
          <div>
            <span className="text-xs font-extrabold text-text-3 uppercase tracking-wider block mb-1">
              Periode Sewa Aktif
            </span>
            <div className="font-tabular-nums text-xl sm:text-2xl lg:text-3xl font-extrabold text-text tracking-tight my-1">
              {formatMonthYearText(tagihanBerjalan?.periode)}
            </div>
            <div className="text-xs sm:text-sm text-text-2 font-medium font-tabular-nums">
              {getMonthlyRangeText(tagihanBerjalan?.periode, siklusSewa)}
            </div>
          </div>
          <div className="border-t border-border/60 pt-3.5 mt-5 text-xs sm:text-sm text-text-2 font-semibold">
            {statusTagihan !== 'Lunas' ? (
              <span>Jatuh tempo: <strong className="font-tabular-nums text-red font-bold">{getFixedJatuhTempo(tagihanBerjalan?.periode, tagihanBerjalan?.jatuhTempo)}</strong></span>
            ) : (
              <span className="text-green font-bold flex items-center gap-1.5">
                <Icon icon="heroicons:check-circle-20-solid" className="size-4.5 text-green shrink-0" />
                <span>Kewajiban sewa bulan ini telah lunas</span>
              </span>
            )}
          </div>
        </Card>

        <Card variant="default" className="p-5 sm:p-6 flex flex-col justify-between rounded-2xl border border-border/80 shadow-card bg-white">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold text-text-3 uppercase tracking-wider">
                Total Kewajiban Sewa
              </span>
              <Badge status={statusTagihan} />
            </div>
            <div className="font-tabular-nums text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight my-1">
              Rp {totalTagihanVal.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="border-t border-border/60 pt-3.5 mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs sm:text-sm">
            <span className="text-text-2 font-semibold text-pretty">
              {hutangTunggakanVal > 0 
                ? `Rincian: Rp ${tarifSewaVal.toLocaleString('id-ID')} (Sewa) + Rp ${hutangTunggakanVal.toLocaleString('id-ID')} (Tunggakan)`
                : (statusTagihan === 'Lunas' ? 'Semua kewajiban sewa periode ini lunas' : 'Sewa unit kios berjalan')}
            </span>
            {hutangTunggakanVal > 0 && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => navigate('/tenant/tunggakan')}
                className="text-xs sm:text-sm font-bold text-orange hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange/30 px-3.5 py-1.5 shrink-0"
              >
                Rincian Tunggakan →
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* SEKSI: RINCIAN TAGIHAN & STATUS PER UNIT KIOS (MULTI-KIOS) */}
      {kiosBreakdown && Array.isArray(kiosBreakdown) && kiosBreakdown.length > 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-red-50 text-red flex items-center justify-center font-bold">
                <Icon icon="heroicons:building-storefront-20-solid" className="size-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-text tracking-tight">
                  Rincian Tagihan per Unit Kios
                </h2>
                <p className="text-xs sm:text-sm text-text-3 font-medium">
                  Informasi rincian sewa aktif masing-masing unit kios yang Anda kelola.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-text-2 bg-mono-100 px-3 py-1 rounded-full border border-border">
              {kiosBreakdown.length} Unit Kios
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {kiosBreakdown.map((item, idx) => {
              const tagihan = item.tagihan;
              const totalKiosOwed = Number(item.totalKewajiban ?? (tagihan ? (tagihan.sisaTagihan ?? tagihan.totalTagihan) : 0));
              const isLunas = totalKiosOwed === 0;
              const statusBadge = isLunas ? 'Lunas' : (tagihan?.statusTagihan || 'Belum Bayar');

              return (
                <Card 
                  key={item.idSewa || idx} 
                  variant="default" 
                  className={cn(
                    "p-5 flex flex-col justify-between gap-4 rounded-2xl border transition-all duration-200 bg-white",
                    !isLunas ? "border-red/30 hover:border-red/60 shadow-card" : "border-border/80 hover:border-border shadow-2xs"
                  )}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2 border-b border-border/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-extrabold text-red font-tabular-nums tracking-tight">
                            Kios {item.noKios}
                          </strong>
                          <span className="text-2xs font-bold text-text-3 bg-mono-100 border border-border px-1.5 py-0.5 rounded">
                            {item.lantai}
                          </span>
                        </div>
                        <span className="text-xs text-text-2 font-semibold block mt-0.5">
                          {item.jenisUsaha}
                        </span>
                      </div>
                      <Badge status={statusBadge} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-text-3 font-semibold block text-2xs uppercase tracking-wide">Ukuran:</span>
                        <strong className="text-text font-bold">{item.ukuran}</strong>
                      </div>
                      <div>
                        <span className="text-text-3 font-semibold block text-2xs uppercase tracking-wide">Tarif Sewa:</span>
                        <strong className="text-text font-bold font-tabular-nums">
                          Rp {Number(item.tarifBulanan || 750000).toLocaleString('id-ID')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-2xs text-text-3 font-semibold uppercase tracking-wider block">
                        {item.unpaidCount && item.unpaidCount > 1 ? `Kewajiban (${item.unpaidCount} Periode):` : 'Kewajiban:'}
                      </span>
                      <strong className={cn(
                        "text-sm font-extrabold font-tabular-nums",
                        isLunas ? "text-emerald-700" : "text-red"
                      )}>
                        {isLunas ? "Lunas (Rp 0)" : `Rp ${Number(totalKiosOwed).toLocaleString('id-ID')}`}
                      </strong>
                    </div>

                    {!isLunas && (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => handleBayar(totalKiosOwed, item.noKios)}
                        className="h-8 px-3 text-2xs font-extrabold gap-1 shadow-2xs"
                      >
                        <span>Bayar Kios</span>
                        <Icon icon="heroicons:arrow-right-20-solid" className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardTenant;
