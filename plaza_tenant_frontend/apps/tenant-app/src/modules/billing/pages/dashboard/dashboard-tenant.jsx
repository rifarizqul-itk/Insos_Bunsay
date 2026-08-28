import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Icon, SkeletonCard, SkeletonText, BuktiPembayaranModal, cn } from '@bunsay/shared-ui';
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
  const [recentPayments, setRecentPayments] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, payRes] = await Promise.allSettled([
        httpClient.get('/api/v1/tenant/dashboard'),
        httpClient.get('/api/v1/tenant/pembayaran')
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashboardData(dashRes.value.data);
      } else {
        throw dashRes.reason;
      }

      if (payRes.status === 'fulfilled' && Array.isArray(payRes.value?.data)) {
        const mapped = payRes.value.data.slice(0, 4).map(item => ({
          id: `TRX-${item.Id_Pembayaran}`,
          idReal: item.Id_Pembayaran,
          tanggal: item.Tanggal_Bayar || '-',
          nominal: `Rp ${Number(item.Total_Bayar || 0).toLocaleString('id-ID')}`,
          metode: item.Metode_Bayar || 'Transfer',
          status: item.Verifikasi_Pembayaran || 'Menunggu',
          buktiUrl: item.Bukti_Pembayaran || '',
          nama: item.tagihan?.sewa?.pemilik?.Nama || 'Tenant',
          kios: item.tagihan?.sewa?.kios?.No_Kios || '',
          catatanAdmin: item.catatan_admin || '',
          alokasi: []
        }));
        setRecentPayments(mapped);
      }
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
      <div className="page-fade-in flex flex-col gap-8 font-sans max-w-6xl mx-auto w-full" role="status" aria-live="polite">
        <div className="flex flex-col gap-2">
          <SkeletonText className="h-10 w-48" />
          <SkeletonText className="h-5 w-64 animate-pulse" />
        </div>
        <div className="h-28 w-full rounded-2xl bg-gray-200/50 animate-pulse border border-border/40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard className="h-44" />
          <SkeletonCard className="h-44" />
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

  const { nama, kios, siklusSewa, tagihanBerjalan, kiosBreakdown, totalTagihanSemuaKios, totalTunggakanLalu, tarifBulanIni, hasActiveKios } = dashboardData || {};
  
  const hasActiveKiosks = (hasActiveKios !== false) && Boolean(kios && kios !== '—' && kios.trim() !== '') && (Array.isArray(kiosBreakdown) && kiosBreakdown.length > 0);

  const tarifSewaVal = Number(tarifBulanIni ?? (tagihanBerjalan ? (tagihanBerjalan.tarifSewa ?? 0) : 0));
  const hutangTunggakanVal = Number(totalTunggakanLalu ?? (tagihanBerjalan ? (tagihanBerjalan.hutangTunggakan ?? 0) : 0));
  const totalTagihanVal = Number(totalTagihanSemuaKios ?? (tarifSewaVal + hutangTunggakanVal));

  const hasUnpaidKiosk = kiosBreakdown && Array.isArray(kiosBreakdown) && kiosBreakdown.length > 0
    ? kiosBreakdown.some(k => (k.totalKewajiban ?? 0) > 0 || (k.tagihan && (k.tagihan.statusTagihan === 'Belum Bayar' || k.tagihan.statusTagihan === 'Dicicil' || k.tagihan.statusTagihan === 'Menunggak')))
    : (tagihanBerjalan?.statusTagihan === 'Belum Bayar' || tagihanBerjalan?.statusTagihan === 'Dicicil' || totalTagihanVal > 0);

  const hasVerifikasiKiosk = kiosBreakdown && Array.isArray(kiosBreakdown) && kiosBreakdown.length > 0
    ? kiosBreakdown.some(k => k.tagihan && k.tagihan.statusTagihan === 'Menunggu Verifikasi')
    : (tagihanBerjalan?.statusTagihan === 'Menunggu Verifikasi');

  const statusTagihan = !hasActiveKiosks ? 'Lunas' : (hasUnpaidKiosk ? 'Belum Bayar' : (hasVerifikasiKiosk ? 'Menunggu Verifikasi' : (tagihanBerjalan?.statusTagihan || 'Lunas')));
  const perluBayar = hasActiveKiosks && hasUnpaidKiosk && totalTagihanVal > 0;
  const sedangVerifikasi = hasActiveKiosks && hasVerifikasiKiosk && !hasUnpaidKiosk;

  return (
    <div data-slot="dashboard-tenant" className="page-fade-in flex flex-col gap-4 sm:gap-5 font-sans max-w-6xl mx-auto w-full">
      {/* 1. HEADER: Sapaan Personal & Info Kios */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text text-balance">
              Halo, {nama || 'Penyewa Kios'}
            </h1>
            {hasActiveKiosks ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-red-50 border border-red/20 text-red text-xs font-semibold font-tabular-nums shrink-0">
                <Icon icon="heroicons:building-storefront-20-solid" className="size-3.5 text-red shrink-0" />
                <span>Kios {kios}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-mono-100 border border-border text-text-3 text-xs font-semibold shrink-0">
                <Icon icon="heroicons:building-storefront-20-solid" className="size-3.5 text-mono-400 shrink-0" />
                <span>Tidak Ada Kios Aktif</span>
              </span>
            )}
          </div>
          <p className="text-text-2 text-xs sm:text-sm font-normal mt-0.5 text-pretty">
            {hasActiveKiosks ? 'Portal layanan sewa dan tagihan kios Anda.' : 'Akun arsip riwayat sewa dan transaksi Anda.'}
          </p>
        </div>

        {hasActiveKiosks && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-text-3 bg-white border border-border/80 px-3 py-1.5 rounded-xl shadow-xs">
            <Icon icon="heroicons:calendar-days-20-solid" className="size-4 text-mono-400" />
            <span>{getMonthlyRangeText(tagihanBerjalan?.periode, siklusSewa)}</span>
          </div>
        )}
      </div>

      {/* 2. ALERT BANNER STATUS TAGIHAN */}
      {!hasActiveKiosks ? (
        <div className="bg-mono-50 border border-border/80 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-mono-200 text-mono-700 flex items-center justify-center shrink-0">
              <Icon icon="heroicons:archive-box-20-solid" className="size-5" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm text-text font-bold block">
                Masa Sewa Telah Selesai
              </strong>
              <p className="text-xs text-text-2 font-normal text-pretty mt-0.5">
                Anda saat ini tidak memiliki unit kios aktif. Seluruh rekap kwitansi dan riwayat transaksi masa lalu tetap tersimpan di akun Anda.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/tenant/histori')}
            className="w-full sm:w-auto h-9 px-3.5 font-bold gap-1.5 shrink-0 bg-white text-text border-border hover:bg-mono-50 text-xs whitespace-nowrap"
          >
            <span>Lihat Riwayat Transaksi</span>
            <Icon icon="heroicons:document-text-20-solid" className="size-3.5" />
          </Button>
        </div>
      ) : perluBayar ? (
        <div className="bg-red-50/80 border border-red/20 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="size-9 rounded-xl bg-red text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-red block uppercase">
                Tagihan Perlu Dibayar
              </span>
              <p className="text-xs sm:text-sm text-text font-normal mt-0.5 text-pretty">
                Selesaikan tagihan sewa periode <strong className="text-text font-bold">{formatMonthYearText(tagihanBerjalan?.periode)}</strong> sebelum jatuh tempo.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleBayar(totalTagihanVal)}
            className="w-full sm:w-auto h-9 px-4 font-bold gap-1.5 shrink-0 text-xs sm:text-sm whitespace-nowrap"
          >
            <span>Bayar Sekarang</span>
            <Icon icon="heroicons:arrow-right-20-solid" className="size-4" />
          </Button>
        </div>
      ) : sedangVerifikasi ? (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Icon icon="heroicons:clock-20-solid" className="size-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 block uppercase">
                Pembayaran Sedang Diverifikasi
              </span>
              <p className="text-xs sm:text-sm text-amber-800 font-normal mt-0.5 text-pretty">
                Bukti transfer sedang diperiksa oleh kantor pengelola.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/tenant/histori')}
            className="w-full sm:w-auto h-9 px-4 font-bold gap-1.5 shrink-0 bg-amber-100/80 hover:bg-amber-100 text-amber-900 border-amber-300 text-xs sm:text-sm whitespace-nowrap"
          >
            <span>Lihat Status</span>
            <Icon icon="heroicons:arrow-right-20-solid" className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Icon icon="heroicons:check-badge-20-solid" className="size-5" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm text-emerald-950 font-bold block">
                Semua Tagihan Lunas
              </strong>
              <p className="text-xs text-emerald-800 font-normal text-pretty mt-0.5">
                Terima kasih telah menyelesaikan pembayaran periode {formatMonthYearText(tagihanBerjalan?.periode)}.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/tenant/histori')}
            className="w-full sm:w-auto h-9 px-3.5 font-bold gap-1.5 shrink-0 bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50 text-xs whitespace-nowrap"
          >
            <span>Lihat Kuitansi</span>
            <Icon icon="heroicons:document-text-20-solid" className="size-3.5" />
          </Button>
        </div>
      )}

      {/* 3. DUA CARD UTAMA: PERIODE AKTIF & TOTAL KEWAJIBAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Card 1: Periode Sewa Aktif */}
        <Card variant="default" className="p-4 sm:p-5 rounded-2xl bg-white border border-border/80 shadow-xs flex flex-col justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-text-3 uppercase block tracking-wider">
              {hasActiveKiosks ? 'Periode Sewa Aktif' : 'Status Kontrak Sewa'}
            </span>
            <div className="font-tabular-nums text-xl sm:text-2xl font-bold text-text mt-1.5 mb-0.5 leading-tight">
              {hasActiveKiosks ? formatMonthYearText(tagihanBerjalan?.periode) : 'Selesai / Nonaktif'}
            </div>
            <div className="text-xs sm:text-sm text-text-2 font-medium font-tabular-nums">
              {hasActiveKiosks ? getMonthlyRangeText(tagihanBerjalan?.periode, siklusSewa) : 'Tidak ada unit kios yang sedang disewa'}
            </div>
          </div>

          <div className="border-t border-border/60 pt-2.5 text-xs text-text-2 font-medium">
            {!hasActiveKiosks ? (
              <span className="text-text-3 font-normal">Hubungi pengelola untuk pengajuan sewa baru</span>
            ) : statusTagihan !== 'Lunas' ? (
              <div className="flex items-center justify-between">
                <span className="text-text-3 font-medium">Batas Pembayaran:</span>
                <span className="font-tabular-nums text-red font-bold">{getFixedJatuhTempo(tagihanBerjalan?.periode, tagihanBerjalan?.jatuhTempo)}</span>
              </div>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <Icon icon="heroicons:check-circle-20-solid" className="size-4 text-emerald-600 shrink-0" />
                <span>Kewajiban sewa bulan ini telah lunas</span>
              </span>
            )}
          </div>
        </Card>

        {/* Card 2: Total Kewajiban Sewa */}
        <Card variant="default" className="p-4 sm:p-5 rounded-2xl bg-white border border-border/80 shadow-xs flex flex-col justify-between gap-3">
          <div>
            <div className="flex justify-between items-center mb-1.5 gap-2">
              <span className="text-xs font-bold text-text-3 uppercase block tracking-wider">
                Total Kewajiban Sewa
              </span>
              <Badge status={!hasActiveKiosks ? 'Lunas' : statusTagihan} />
            </div>
            <div className="font-tabular-nums text-xl sm:text-2xl font-bold text-text mt-1.5 mb-0.5 leading-tight">
              Rp {hasActiveKiosks ? totalTagihanVal.toLocaleString('id-ID') : '0'}
            </div>
            <div className="text-xs sm:text-sm text-text-2 font-medium">
              {hasActiveKiosks ? (kios ? `Sewa Unit Kios ${kios}` : 'Sewa Unit Kios') : 'Tidak ada tagihan aktif'}
            </div>
          </div>

          <div className="border-t border-border/60 pt-2.5 text-xs text-text-2 font-medium">
            {!hasActiveKiosks ? (
              <span className="text-text-3 font-normal">Tidak ada tagihan sewa yang perlu dibayar</span>
            ) : hutangTunggakanVal > 0 ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-3">
                  Termasuk tunggakan <strong className="text-red font-bold font-tabular-nums">Rp {hutangTunggakanVal.toLocaleString('id-ID')}</strong>
                </span>
                <button 
                  type="button"
                  onClick={() => navigate('/tenant/tagihan')}
                  className="text-xs font-bold text-red hover:underline cursor-pointer shrink-0"
                >
                  Rincian &rarr;
                </button>
              </div>
            ) : (
              <span className="text-text-3">
                {statusTagihan === 'Lunas'
                  ? 'Semua kewajiban periode ini telah lunas'
                  : 'Sewa unit kios bulan berjalan'}
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* 4. MENU CEPAT (Bento Grid) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-bold text-text uppercase flex items-center gap-1.5">
            <Icon icon="heroicons:squares-2x2-20-solid" className="size-4 text-red" />
            <span>Menu Cepat</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Bento Card 1: Bayar Sewa */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/tenant/pembayaran')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/tenant/pembayaran'); } }}
            className="bg-white border border-border/80 hover:border-red/40 hover:shadow-sm active:scale-[0.98] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 transition-all cursor-pointer shadow-xs group select-none"
          >
            <div className="size-9 rounded-lg bg-red-50 text-red border border-red/20 flex items-center justify-center shrink-0">
              <Icon icon="heroicons:credit-card-20-solid" className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <strong className="text-xs sm:text-sm font-bold text-text group-hover:text-red transition-colors">
                Bayar Sewa
              </strong>
              <span className="text-[11px] text-text-3 font-normal mt-0.5 truncate">
                Transfer &amp; Online
              </span>
            </div>
          </div>

          {/* Bento Card 2: Tagihan Sewa */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/tenant/tagihan')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/tenant/tagihan'); } }}
            className="bg-white border border-border/80 hover:border-red/40 hover:shadow-sm active:scale-[0.98] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 transition-all cursor-pointer shadow-xs group select-none"
          >
            <div className="size-9 rounded-lg bg-red-50 text-red border border-red/20 flex items-center justify-center shrink-0">
              <Icon icon="heroicons:document-duplicate-20-solid" className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <strong className="text-xs sm:text-sm font-bold text-text group-hover:text-red transition-colors">
                Tagihan Sewa
              </strong>
              <span className="text-[11px] text-text-3 font-normal mt-0.5 truncate font-tabular-nums">
                {hutangTunggakanVal > 0 ? `Rp ${hutangTunggakanVal.toLocaleString('id-ID')}` : 'Tagihan Bersih'}
              </span>
            </div>
          </div>

          {/* Bento Card 3: Histori Transaksi */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/tenant/histori')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/tenant/histori'); } }}
            className="bg-white border border-border/80 hover:border-red/40 hover:shadow-sm active:scale-[0.98] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 transition-all cursor-pointer shadow-xs group select-none"
          >
            <div className="size-9 rounded-lg bg-red-50 text-red border border-red/20 flex items-center justify-center shrink-0">
              <Icon icon="heroicons:receipt-percent-20-solid" className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <strong className="text-xs sm:text-sm font-bold text-text group-hover:text-red transition-colors">
                Riwayat Transaksi
              </strong>
              <span className="text-[11px] text-text-3 font-normal mt-0.5 truncate">
                Bukti &amp; Kuitansi
              </span>
            </div>
          </div>

          {/* Bento Card 4: Kios & Akun */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/tenant/akun')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/tenant/akun'); } }}
            className="bg-white border border-border/80 hover:border-red/40 hover:shadow-sm active:scale-[0.98] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 transition-all cursor-pointer shadow-xs group select-none"
          >
            <div className="size-9 rounded-lg bg-red-50 text-red border border-red/20 flex items-center justify-center shrink-0">
              <Icon icon="heroicons:building-storefront-20-solid" className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <strong className="text-xs sm:text-sm font-bold text-text group-hover:text-red transition-colors">
                Kios &amp; Akun
              </strong>
              <span className="text-[11px] text-text-3 font-normal mt-0.5 truncate font-tabular-nums">
                Kios {kios}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. AKTIVITAS TRANSAKSI TERAKHIR (Recent Payments Feed) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-bold text-text uppercase flex items-center gap-1.5">
            <Icon icon="heroicons:clock-20-solid" className="size-4 text-red" />
            <span>Transaksi Terakhir</span>
          </span>
          <button
            type="button"
            onClick={() => navigate('/tenant/histori')}
            className="text-xs font-semibold text-red hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <Icon icon="heroicons:arrow-right-20-solid" className="size-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-border/80 shadow-xs p-4 sm:p-5 flex flex-col gap-2.5">
          {recentPayments.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
              <Icon icon="heroicons:receipt-percent-20-solid" className="size-10 text-mono-300" />
              <span className="text-xs font-bold text-text-2">Belum ada transaksi tercatat.</span>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60">
              {recentPayments.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 border",
                      item.metode === 'Midtrans' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red border-red/20'
                    )}>
                      <Icon icon={item.metode === 'Midtrans' ? 'heroicons:bolt-20-solid' : 'heroicons:building-library-20-solid'} className="size-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-text text-xs sm:text-sm truncate">
                        {item.metode === 'Midtrans' ? 'Midtrans Gateway' : 'Transfer Bank'}
                      </span>
                      <span className="text-2xs text-text-3 font-medium font-tabular-nums">
                        {item.id} • {item.tanggal}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="font-extrabold text-text text-xs sm:text-sm font-tabular-nums">
                        {item.nominal}
                      </span>
                      <Badge status={item.status} className="scale-90 origin-right" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(item)}
                      aria-label={`Lihat kuitansi transaksi ${item.id}`}
                      className="p-2 rounded-xl border border-border/80 hover:bg-mono-50 text-text-2 hover:text-text transition-colors cursor-pointer"
                      title="Lihat Kuitansi"
                    >
                      <Icon icon="heroicons:document-text-20-solid" className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. SEKSI: RINCIAN TAGIHAN PER UNIT KIOS (JIKA MEMILIKI MULTI-KIOS) */}
      {kiosBreakdown && Array.isArray(kiosBreakdown) && kiosBreakdown.length > 1 && (
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-red-50 text-red flex items-center justify-center font-bold">
                <Icon icon="heroicons:building-storefront-20-solid" className="size-4.5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-text text-balance">
                Rincian Tagihan per Unit Kios
              </h2>
            </div>
            <span className="text-xs font-semibold text-text-2 bg-mono-100 px-2.5 py-0.5 rounded-full border border-border">
              {kiosBreakdown.length} Unit Kios
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
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
                    "p-4 flex flex-col justify-between gap-3 rounded-xl border transition-colors bg-white",
                    !isLunas ? "border-red/30 shadow-sm" : "border-border/80 shadow-xs"
                  )}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-start gap-2 border-b border-border/60 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-red font-tabular-nums">
                            Kios {item.noKios}
                          </strong>
                          <span className="text-[11px] font-medium text-text-3 bg-mono-100 border border-border px-1.5 py-0.2 rounded">
                            {item.lantai}
                          </span>
                        </div>
                        <span className="text-xs text-text-2 font-medium block mt-0.5">
                          {item.jenisUsaha}
                        </span>
                      </div>
                      <Badge status={statusBadge} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-3 font-medium block text-[11px] uppercase">Ukuran:</span>
                        <strong className="text-text font-semibold">{item.ukuran}</strong>
                      </div>
                      <div>
                        <span className="text-text-3 font-medium block text-[11px] uppercase">Tarif Sewa:</span>
                        <strong className="text-text font-semibold font-tabular-nums">
                          Rp {Number(item.tarifBulanan || 750000).toLocaleString('id-ID')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-text-3 font-medium uppercase block">
                        {item.unpaidCount && item.unpaidCount > 1 ? `Kewajiban (${item.unpaidCount} Periode):` : 'Kewajiban:'}
                      </span>
                      <strong className={cn(
                        "text-sm font-bold font-tabular-nums",
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
                        className="h-8 px-2.5 text-xs font-bold gap-1"
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

      {/* Modal Detail & Kuitansi Transaksi Terakhir */}
      <BuktiPembayaranModal
        isOpen={Boolean(selectedReceipt)}
        item={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}

export default DashboardTenant;
