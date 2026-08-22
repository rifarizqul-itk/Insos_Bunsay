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
  if (!periodeStr) return 'Periode Berjalan';

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
    <div data-slot="dashboard-tenant" className="page-fade-in flex flex-col gap-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight text-balance">
            Halo, {nama}
          </h1>
          <p className="text-text-2 text-base font-semibold mt-1 text-pretty">
            Pemilik Kios <span className="font-tabular-nums font-bold text-red">{kios}</span> — Selamat datang di akun Bunsay Anda.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/tenant/akun')}
          className="h-10 text-xs font-bold gap-1.5 border-border hover:bg-mono-100 shadow-xs shrink-0"
        >
          <Icon icon="heroicons:document-text-20-solid" className="size-4 text-red" />
          <span>Detail Administrasi & Legalitas Kios</span>
        </Button>
      </div>

      {perluBayar && (
        <div 
          role="alert"
          className="p-6 sm:p-7 md:p-8 bg-red-50 border-2 border-red rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-glow-maroon"
        >
          <div className="flex-1 min-w-72">
            <span className="label-micro text-red">
              Tagihan Sewa & Tunggakan Bulan Ini
            </span>
            <p className="text-base sm:text-lg text-text font-bold mt-2 leading-relaxed text-pretty">
              Total kewajiban sewa yang perlu dibayar bulan ini adalah <span className="font-tabular-nums text-red font-extrabold text-xl">Rp {totalTagihanVal.toLocaleString('id-ID')}</span>
              {kiosBreakdown && kiosBreakdown.length > 1 && (
                <span className="text-sm font-semibold text-text-2 block mt-1">
                  (Mengakumulasikan seluruh tagihan aktif untuk {kiosBreakdown.length} unit kios Anda)
                </span>
              )}.
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
              <Icon icon="heroicons:arrow-right-20-solid" className="size-5" />
            </Button>
          </div>
        </div>
      )}

      {sedangVerifikasi && (
        <div 
          role="status"
          className="p-6 sm:p-7 md:p-8 bg-orange-bg border-2 border-orange rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-card"
        >
          <div className="flex-1 min-w-72">
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
          className="p-6 sm:p-7 md:p-8 bg-green-bg border-2 border-green/30 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-card"
        >
          <div className="flex-1 min-w-72">
            <span className="label-micro text-green font-bold">
              Status Tagihan Sewa
            </span>
            <p className="text-base sm:text-lg text-text font-bold mt-2 leading-relaxed text-pretty">
              Tidak ada tagihan aktif yang perlu dibayar saat ini. Semua tagihan sewa dan tunggakan dari seluruh kios Anda dalam kondisi lunas / bersih.
            </p>
          </div>
        </div>
      )}

      {/* CARD STATISTIK UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated" className="flex flex-col justify-between">
          <div>
            <h2 className="label-micro text-balance">Tagihan Bulan Aktif</h2>
            <div className="font-tabular-nums text-xl sm:text-2xl font-extrabold text-text mt-1.5 mb-1 leading-tight">
              {formatMonthYearText(tagihanBerjalan?.periode)}
            </div>
            <div className="text-xs sm:text-sm text-text-2 font-medium font-tabular-nums">
              {getMonthlyRangeText(tagihanBerjalan?.periode, siklusSewa)}
            </div>
          </div>
          <div className="border-t border-border/60 pt-3 mt-4 text-xs sm:text-sm text-text-2 font-semibold text-pretty">
            {statusTagihan !== 'Lunas' ? (
              <span>Jatuh tempo pelunasan: <strong className="font-tabular-nums text-red font-bold">{getFixedJatuhTempo(tagihanBerjalan?.periode, tagihanBerjalan?.jatuhTempo)}</strong></span>
            ) : (
              <span className="text-green font-bold flex items-center gap-1.5">
                <Icon icon="heroicons:check-circle-20-solid" width="18" height="18" className="text-green shrink-0" />
                <span>Kewajiban sewa bulan ini telah lunas</span>
              </span>
            )}
          </div>
        </Card>

        <Card variant="elevated" className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="label-micro text-balance">Total Kewajiban Sewa</h2>
              <Badge status={statusTagihan} />
            </div>
            <div className="font-tabular-nums text-2xl sm:text-3xl font-extrabold text-text tracking-tight my-2">
              Rp {totalTagihanVal.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="border-t border-border/60 pt-3 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs sm:text-sm">
            <span className="text-text-2 font-semibold text-pretty">
              {hutangTunggakanVal > 0 
                ? `Rincian: Rp ${tarifSewaVal.toLocaleString('id-ID')} (Sewa Bulan Ini) + Rp ${hutangTunggakanVal.toLocaleString('id-ID')} (Sisa Tunggakan Lalu)`
                : (statusTagihan === 'Lunas' ? 'Semua kewajiban sewa periode ini telah lunas' : 'Sewa unit kios berjalan')}
            </span>
            {hutangTunggakanVal > 0 && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => navigate('/tenant/tunggakan')}
                className="text-xs font-extrabold text-orange hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange/30 px-3 py-1.5 shrink-0"
              >
                Rincian Tunggakan →
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* SEKSI: RINCIAN TAGIHAN & STATUS PER UNIT KIOS (HANYA MUNCUL JIKA MEMILIKI MULTI-KIOS) */}
      {kiosBreakdown && Array.isArray(kiosBreakdown) && kiosBreakdown.length > 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-red-50 text-red flex items-center justify-center font-bold">
                <Icon icon="heroicons:building-storefront-20-solid" className="size-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-text tracking-tight">
                  Rincian Tagihan per Unit Kios
                </h2>
                <p className="text-xs text-text-3 font-medium">
                  Informasi tarif, jenis usaha, dan status pembayaran aktif masing-masing unit kios Anda.
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
                  variant="elevated" 
                  className={cn(
                    "p-5 sm:p-6 flex flex-col justify-between gap-4 border transition-all duration-200",
                    !isLunas ? "border-red/30 hover:border-red/60 shadow-xs" : "border-border hover:border-border/90"
                  )}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2 border-b border-border/70 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-base font-extrabold text-red font-tabular-nums tracking-tight">
                            Kios {item.noKios}
                          </strong>
                          <span className="text-2xs font-bold text-text-3 bg-mono-100 border border-border px-2 py-0.5 rounded">
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
                        <span className="text-text-3 font-semibold block">Ukuran Kios:</span>
                        <strong className="text-text font-bold">{item.ukuran}</strong>
                      </div>
                      <div>
                        <span className="text-text-3 font-semibold block">Tarif Sewa:</span>
                        <strong className="text-text font-bold font-tabular-nums">
                          Rp {Number(item.tarifBulanan || 750000).toLocaleString('id-ID')}/bln
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/70 pt-3 flex items-center justify-between mt-1">
                    <div>
                      <span className="text-2xs text-text-3 font-semibold uppercase tracking-wider block">
                        {item.unpaidCount && item.unpaidCount > 1 ? `Kewajiban (${item.unpaidCount} Periode):` : 'Tagihan Kewajiban:'}
                      </span>
                      <strong className={cn(
                        "text-sm sm:text-base font-extrabold font-tabular-nums",
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
                        className="h-8 px-3 text-2xs font-extrabold gap-1 shadow-xs"
                      >
                        <span>Bayar Kios Ini</span>
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
