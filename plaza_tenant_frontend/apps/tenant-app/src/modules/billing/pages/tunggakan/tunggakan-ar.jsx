import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, EmptyState, SkeletonCard, cn } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../../public/useTenantAuth';

function TunggakanAR() {
  const navigate = useNavigate();
  const { httpClient } = useTenantAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kiosInfo, setKiosInfo] = useState('');
  const [totalTunggakanVal, setTotalTunggakanVal] = useState(0);
  const [totalBebanVal, setTotalBebanVal] = useState(0);
  const [totalDicicilVal, setTotalDicicilVal] = useState(0);
  const [listTagihan, setListTagihan] = useState([]);

  const fetchTunggakanData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashRes = await httpClient.get('/api/v1/tenant/dashboard');
      const idPemilik = dashRes.data?.idPemilik;

      if (!idPemilik) {
        throw new Error('Data pemilik tidak ditemukan.');
      }

      // Ambil informasi kios untuk konteks halaman
      const noKios = dashRes.data?.kios || '';
      const lantai = dashRes.data?.kiosBreakdown?.[0]?.lantai || 'Lantai 1';
      setKiosInfo(noKios ? `Kios ${noKios} • ${lantai}` : 'Kios Anda');

      const tagihanRes = await httpClient.get('/api/v1/tenant/tagihan');
      const semuaTagihan = Array.isArray(tagihanRes.data) ? tagihanRes.data : [];

      // Filter hanya yang belum lunas
      const tagihanMenunggak = semuaTagihan
        .filter(t => t.Status_Tagihan !== 'Lunas')
        .map(t => {
          const totalTagihan = parseFloat(t.Total_Tagihan || t.Tarif_Sewa || 0);
          const sisaTagihan = parseFloat(t.Sisa_Tagihan ?? totalTagihan);
          const totalTerbayar = Math.max(0, totalTagihan - sisaTagihan);

          let jatuhTempo = t.Jatuh_Tempo || '—';
          if (jatuhTempo && jatuhTempo.includes('-')) {
            const parts = jatuhTempo.split('-');
            if (parts.length === 3) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
              const month = parseInt(parts[1], 10) - 1;
              jatuhTempo = `${parseInt(parts[2], 10)} ${months[month]} ${parts[0]}`;
            }
          }

          // Perbaikan konsistensi badge: jika ada pembayaran parsial, statusnya Dicicil
          let statusBadge = t.Status_Tagihan || 'Belum Bayar';
          if (totalTerbayar > 0 && sisaTagihan > 0) {
            statusBadge = 'Dicicil';
          } else if (sisaTagihan <= 0) {
            statusBadge = 'Lunas';
          } else {
            statusBadge = 'Belum Bayar';
          }

          return {
            idTagihan: t.Id_Tagihan,
            periode: t.Periode,
            tarifSewa: parseFloat(t.Tarif_Sewa || 0),
            totalTagihan,
            totalTerbayar,
            sisaTagihan,
            statusTagihan: statusBadge,
            jatuhTempo,
          };
        })
        .sort((a, b) => (a.periode || '').localeCompare(b.periode || ''));

      const sumSisa = tagihanMenunggak.reduce((acc, curr) => acc + curr.sisaTagihan, 0);
      const sumBeban = tagihanMenunggak.reduce((acc, curr) => acc + curr.totalTagihan, 0);
      const sumTerbayar = tagihanMenunggak.reduce((acc, curr) => acc + curr.totalTerbayar, 0);

      setTotalTunggakanVal(sumSisa);
      setTotalBebanVal(sumBeban);
      setTotalDicicilVal(sumTerbayar);
      setListTagihan(tagihanMenunggak);
    } catch (err) {
      console.error('Failed to fetch tunggakan data:', err);
      setError(err.message || 'Gagal memuat data tagihan sewa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTunggakanData();
  }, []);

  const handleBayar = () => {
    navigate('/tenant/pembayaran', {
      state: {
        nominal: totalTunggakanVal,
        totalTunggakan: totalTunggakanVal,
        listTagihan: listTagihan
      }
    });
  };

  const formatPeriodeToIndo = (periodeStr) => {
    if (!periodeStr) return 'Periode Berjalan';
    const months = {
      '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
      '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
      '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    };
    const parts = periodeStr.split('-');
    if (parts.length === 2 && months[parts[1]]) {
      return `${months[parts[1]]} ${parts[0]}`;
    }
    return periodeStr;
  };

  // Evaluasi logika tanggal jatuh tempo
  const today = new Date();
  const curYear = today.getFullYear();
  const curMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentPeriod = `${curYear}-${curMonth}`;
  const curDay = today.getDate();

  // Cek apakah ada tunggakan dari bulan-bulan lampau (sebelum bulan berjalan)
  const pastArrears = listTagihan.filter(t => t.periode < currentPeriod);
  const hasPastArrears = pastArrears.length > 0;
  const currentMonthBill = listTagihan.find(t => t.periode === currentPeriod);

  // Jika tidak punya tunggakan lampau dan hari ini <= 12, tenant dikategorikan belum menunggak
  const isDisciplinedBeforeDue = !hasPastArrears && curDay <= 12 && listTagihan.length > 0;

  if (loading) {
    return (
      <div className="page-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
        <div><SkeletonCard className="h-64" /></div>
        <div><SkeletonCard className="h-64" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center bg-red-50 border-red/20 flex flex-col items-center gap-3 max-w-xl mx-auto my-8">
        <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-8 text-red" />
        <h3 className="font-bold text-red text-base">Terjadi Kesalahan</h3>
        <p className="text-text-2 text-sm max-w-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchTunggakanData}>
          Coba Lagi
        </Button>
      </Card>
    );
  }

  return (
    <div data-slot="tunggakan-page" className="page-fade-in flex flex-col gap-6 font-sans w-full max-w-7xl mx-auto">
      {/* HEADER UTAMA */}
      <div className="flex flex-col gap-1 border-b border-border/70 pb-3.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
          Tunggakan Sewa Kios
        </h1>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-text-3 font-medium">
          <Icon icon="heroicons:building-storefront-20-solid" className="size-4 text-primary shrink-0" />
          <span>{kiosInfo}</span>
        </div>
      </div>

      {/* KONDISI 1: TIDAK ADA TUNGGAKAN SAMA SEKALI (LUNAS PENUH) */}
      {listTagihan.length === 0 && (
        <Card variant="default" className="p-8 sm:p-10 rounded-2xl bg-white border border-border/80 text-center flex flex-col items-center gap-3 shadow-xs">
          <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Icon icon="heroicons:check-circle-20-solid" className="size-8" />
          </div>
          <h2 className="text-lg font-bold text-text">Tidak Memiliki Tunggakan</h2>
          <p className="text-text-2 text-sm max-w-md">
            Luar biasa! Seluruh kewajiban sewa kios Anda telah lunas. Terima kasih atas ketertiban Anda dalam membayar retribusi pasar.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/tenant/dashboard')} className="mt-2">
            Kembali ke Dashboard
          </Button>
        </Card>
      )}

      {/* KONDISI 2: PENYEWA TERTIB (TIDAK ADA UTANG LAMPAU & SEBELUM TANGGAL 12) */}
      {isDisciplinedBeforeDue && (
        <Card variant="default" className="p-6 sm:p-7 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 shadow-xs flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Icon icon="heroicons:shield-check-20-solid" className="size-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-emerald-950">
                Status Kios: Tertib (Tidak Memiliki Tunggakan)
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                Anda tidak memiliki tunggakan dari bulan-bulan sebelumnya. Tagihan sewa bulan berjalan (
                <strong>{currentMonthBill ? formatPeriodeToIndo(currentMonthBill.periode) : 'Bulan Ini'}</strong>)
                sebesar <strong className="font-tabular-nums">Rp {totalTunggakanVal.toLocaleString('id-ID')}</strong> akan
                jatuh tempo pada <strong>{currentMonthBill?.jatuhTempo || '12 bulan ini'}</strong>.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-emerald-700 font-medium">
              Ingin membayar lebih awal sebelum jatuh tempo?
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={handleBayar}
              className="w-full sm:w-auto font-bold text-xs sm:text-sm gap-2"
            >
              <span>Bayar Sewa Bulan Ini</span>
              <Icon icon="heroicons:arrow-right-20-solid" className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* KONDISI 3: MEMILIKI TUNGGAKAN LAMPAU ATAU LEWAT JATUH TEMPO (2 CARD HORIZONTAL SIMETRIS 50:50) */}
      {totalTunggakanVal > 0 && !isDisciplinedBeforeDue && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">

          {/* KOLOM KIRI: KARTU RINGKASAN TUNGGAKAN (50%) */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <Card variant="default" className="p-5 sm:p-6 rounded-2xl bg-white border border-border/80 shadow-xs flex flex-col gap-4">

              {/* Header Card Ringkasan (Tanpa badge) */}
              <div className="border-b border-border/80 pb-2.5">
                <span className="text-l font-bold uppercase tracking-wider text-text-3">
                  Ringkasan Tunggakan
                </span>
              </div>

              {/* Rincian Total Tunggakan & Terbayar TERLEBIH DAHULU */}
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-text-2">
                  <span className="font-bold text-text-3 text-xs tracking-wider">TOTAL TUNGGAKAN:</span>
                  <span className="font-bold font-tabular-nums text-text">
                    Rp {totalBebanVal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-text-2">
                  <span className="font-bold text-text-3 text-xs tracking-wider">TOTAL TERBAYAR:</span>
                  <span className="font-bold font-tabular-nums text-emerald-800">
                    Rp {totalDicicilVal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Divider & SISA TAGIHAN (Angka Hasil Akhir) */}
              <div className="border-t border-border/80 pt-3 flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-text-3">
                  Sisa Tagihan
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-red font-tabular-nums">
                  Rp {totalTunggakanVal.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Tombol Aksi Utama */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleBayar}
                aria-label={`Lanjut ke pembayaran sewa sebesar Rp ${totalTunggakanVal.toLocaleString('id-ID')}`}
                className="w-full h-11 font-bold text-sm sm:text-base gap-2 shadow-xs mt-1"
              >
                <Icon icon="heroicons:credit-card-20-solid" className="size-4.5" />
                <span>Lanjut ke Pembayaran</span>
                <Icon icon="heroicons:arrow-right-20-solid" className="size-4" />
              </Button>

              {/* Catatan Edukatif Simpel (HIDDEN SECARA DEFAULT) */}
              <details className="group text-xs text-text-3 border-t border-border/80 pt-3">
                <summary className="flex items-center justify-between cursor-pointer list-none font-medium hover:text-text select-none py-0.5">
                  <span className="flex items-center gap-1.5">
                    <Icon icon="heroicons:information-circle-20-solid" className="size-4 text-primary shrink-0" />
                    <span>Bagaimana alur pelunasan?</span>
                  </span>
                  <Icon icon="heroicons:chevron-down-20-solid" className="size-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 p-2.5 rounded-xl bg-mono-50 border border-border/70 text-text-2 leading-relaxed">
                  Pembayaran otomatis dialokasikan untuk melunasi periode terlama terlebih dahulu.
                </p>
              </details>

            </Card>
          </div>

          {/* KOLOM KANAN: DAFTAR RINCIAN PER PERIODE (50%) */}
          <div className="flex flex-col gap-3">
            {/* Header Rincian dengan Badge Periode di Kanan */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm sm:text-base font-bold text-text flex items-center gap-2">
                <Icon icon="heroicons:calendar-days-20-solid" className="size-4.5 text-primary" />
                <span>Rincian per Periode</span>
              </h2>
              <span className="text-xs font-bold text-red bg-red-50 border border-red/20 px-2.5 py-0.5 rounded-full font-tabular-nums">
                {listTagihan.length} Periode Belum Lunas
              </span>
            </div>

            {/* List Kartu Periode persis seperti screenshot user */}
            <div className="flex flex-col gap-3">
              {listTagihan.map((item, idx) => {
                const total = item.totalTagihan || item.tarifSewa || 0;
                const terbayar = item.totalTerbayar || 0;
                const sisa = item.sisaTagihan;

                return (
                  <Card key={item.idTagihan || idx} variant="default" className="p-4 sm:p-4.5 rounded-xl bg-white border border-border/80 shadow-2xs flex flex-col gap-3">
                    {/* Baris Atas: Periode & Badge */}
                    <div className="flex items-start justify-between gap-2 border-b border-border/80 pb-2.5">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-text">
                          Sewa {formatPeriodeToIndo(item.periode)}
                        </div>
                        <div className="text-xs text-text-3 font-medium mt-0.5">
                          Jatuh Tempo: <span className="font-semibold text-text-2 font-tabular-nums">{item.jatuhTempo}</span>
                        </div>
                      </div>
                      <Badge status={item.statusTagihan} />
                    </div>

                    {/* Baris Bawah: 3 Kolom Metrik (TARIF, TOTAL TERBAYAR, SISA TAGIHAN) */}
                    <div className="grid grid-cols-3 gap-2 text-xs font-tabular-nums pt-0.5">
                      <div>
                        <span className="text-text-3 block text-[11px] font-bold uppercase tracking-wider">
                          TARIF
                        </span>
                        <span className="font-bold text-text text-xs sm:text-sm">
                          Rp {total.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-3 block text-[11px] font-bold uppercase tracking-wider">
                          TOTAL TERBAYAR
                        </span>
                        <span className="font-bold text-emerald-800 text-xs sm:text-sm">
                          Rp {terbayar.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-text-3 block text-[11px] font-bold uppercase tracking-wider">
                          SISA TAGIHAN
                        </span>
                        <span className="font-extrabold text-red text-xs sm:text-sm">
                          Rp {sisa.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default TunggakanAR;
