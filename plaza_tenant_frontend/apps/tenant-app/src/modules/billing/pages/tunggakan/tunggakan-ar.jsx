import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, EmptyState, SkeletonCard, cn } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../../public/useTenantAuth';

function TunggakanAR() {
  const navigate = useNavigate();
  const { httpClient } = useTenantAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTunggakanVal, setTotalTunggakanVal] = useState(0);
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

      const tagihanRes = await httpClient.get('/api/v1/tenant/tagihan');
      const semuaTagihan = Array.isArray(tagihanRes.data) ? tagihanRes.data : [];

      // Filter hanya yang belum lunas (menunggak)
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
              const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
              const month = parseInt(parts[1], 10) - 1;
              jatuhTempo = `${parseInt(parts[2], 10)} ${months[month]} ${parts[0]}`;
            }
          }
          return {
            idTagihan: t.Id_Tagihan,
            periode: t.Periode,
            tarifSewa: parseFloat(t.Tarif_Sewa || 0),
            totalTagihan,
            totalTerbayar,
            sisaTagihan,
            statusTagihan: t.Status_Tagihan || 'Belum Bayar',
            jatuhTempo,
          };
        });

      const sumSisa = tagihanMenunggak.reduce((acc, curr) => acc + curr.sisaTagihan, 0);

      setTotalTunggakanVal(sumSisa);
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

  if (loading) {
    return (
      <div className="page-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
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
    <div data-slot="tunggakan-ar" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Tagihan &amp; Tunggakan Sewa
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Rincian kewajiban sewa aktif dan sisa bulan sebelumnya yang belum lunas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* KOLOM KIRI: KARTU RINGKASAN KEWAJIBAN */}
        <Card variant="default" className="p-6 sm:p-7 rounded-3xl bg-white border border-border/80 shadow-2xs flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center gap-2">
              <span className="text-2xs font-extrabold text-text-3 uppercase tracking-wider">
                Total Tagihan Kumulatif
              </span>
              <Badge status={totalTunggakanVal > 0 ? 'Belum Bayar' : 'Lunas'} />
            </div>
            <div className={cn('text-3xl sm:text-4xl font-extrabold font-tabular-nums tracking-tight mt-1', totalTunggakanVal > 0 ? 'text-text' : 'text-emerald-700')}>
              Rp {totalTunggakanVal.toLocaleString('id-ID')}
            </div>
          </div>
          
          {/* Rincian Sub-Strip */}
          {totalTunggakanVal > 0 && listTagihan.length > 0 && (() => {
            const sorted = [...listTagihan].sort((a, b) => (a.periode || '').localeCompare(b.periode || ''));
            const latestBill = sorted[sorted.length - 1];
            const tarifBulanIni = latestBill ? latestBill.sisaTagihan : 0;
            const tunggakanLalu = Math.max(0, totalTunggakanVal - tarifBulanIni);

            return (
              <div className="bg-mono-50/80 rounded-2xl p-4 border border-border/70 flex flex-col gap-3 text-xs sm:text-sm text-text-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-semibold flex items-center gap-2 text-text-2 min-w-0">
                    <Icon icon="heroicons:clock-20-solid" className="size-4 text-amber-700 shrink-0" />
                    <span className="truncate">Tunggakan Lalu:</span>
                  </span>
                  <span className="font-tabular-nums font-bold text-amber-800 shrink-0 whitespace-nowrap">
                    Rp {tunggakanLalu.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-2 border-t border-border/50 pt-2.5">
                  <span className="font-semibold flex items-center gap-2 text-text-2 min-w-0">
                    <Icon icon="heroicons:building-storefront-20-solid" className="size-4 text-text-3 shrink-0" />
                    <span className="truncate">Tarif Sewa ({latestBill?.periode ? formatPeriodeToIndo(latestBill.periode) : 'Berjalan'}):</span>
                  </span>
                  <span className="font-tabular-nums font-bold text-text shrink-0 whitespace-nowrap">
                    Rp {tarifBulanIni.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-2 border-t border-border/50 pt-2.5 font-extrabold text-text">
                  <span className="flex items-center gap-2">
                    <Icon icon="heroicons:document-text-20-solid" className="size-4 text-red shrink-0" />
                    <span>Total Tagihan:</span>
                  </span>
                  <span className="font-tabular-nums text-red text-sm sm:text-base">
                    Rp {totalTunggakanVal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            );
          })()}

          {totalTunggakanVal > 0 ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleBayar}
              aria-label={`Bayar cicilan atau pelunasan sebesar total Rp ${totalTunggakanVal.toLocaleString('id-ID')}`}
              className="w-full h-12 font-extrabold text-sm sm:text-base gap-2 shadow-2xs"
            >
              <Icon icon="heroicons:bolt-20-solid" className="size-5" />
              <span>Bayar Tagihan Sekarang</span>
              <Icon icon="heroicons:arrow-right-20-solid" className="size-4" />
            </Button>
          ) : (
            <div className="py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <Icon icon="heroicons:check-circle-20-solid" className="size-5 text-emerald-600" />
              <span>Tidak Ada Tagihan Menunggak</span>
            </div>
          )}
        </Card>

        {/* KOLOM KANAN: DAFTAR TAGIHAN MENUNGGAK */}
        <Card variant="default" className="p-6 sm:p-7 rounded-3xl bg-white border border-border/80 shadow-2xs flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border/70 pb-3">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2">
              <Icon icon="heroicons:queue-list-20-solid" className="size-4.5 text-red" />
              <span>Daftar Tagihan Menunggak</span>
            </h2>
            <span className="text-xs font-extrabold text-red bg-red-50 border border-red/20 px-2.5 py-0.5 rounded-full font-tabular-nums">
              {listTagihan.length} Periode
            </span>
          </div>

          {listTagihan.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon="heroicons:check-circle-20-solid"
                title="Semua Tagihan Lunas!"
                description="Hebat! Tidak ada tunggakan sewa kios untuk akun Anda saat ini."
              />
            </div>
          ) : (
            <ul className="space-y-3.5 list-none p-0 m-0">
              {listTagihan.map((item, idx) => {
                const total = item.totalTagihan || item.tarifSewa || 0;
                const terbayar = item.totalTerbayar || 0;
                const sisa = item.sisaTagihan;
                const percent = total > 0 ? Math.min(100, Math.round((terbayar / total) * 100)) : 0;

                return (
                  <li key={item.idTagihan || idx} className="bg-mono-50/70 border border-border/80 rounded-2xl p-4 sm:p-4.5 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex flex-col">
                        <div className="font-extrabold text-sm text-text">
                          Periode: <span className="font-bold text-red font-tabular-nums">{formatPeriodeToIndo(item.periode)}</span>
                        </div>
                        <div className="text-xs text-text-3 font-medium mt-0.5">
                          Jatuh Tempo: <span className="font-bold text-text-2 font-tabular-nums">{item.jatuhTempo}</span>
                        </div>
                      </div>
                      <Badge status={item.statusTagihan} />
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <div className="flex justify-between text-xs font-tabular-nums text-text-2">
                        <span>Terbayar: <strong className="text-text">Rp {terbayar.toLocaleString('id-ID')}</strong> / Rp {total.toLocaleString('id-ID')}</span>
                        <span className="font-bold text-text">{percent}%</span>
                      </div>
                      <div 
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`Progres pelunasan tagihan periode ${item.periode}: ${percent}% terbayar`}
                        className="h-2 bg-mono-200 rounded-full overflow-hidden"
                      >
                        <div 
                          className={cn('h-full transition-all duration-300 rounded-full', percent >= 100 ? 'bg-green' : percent > 0 ? 'bg-orange' : 'bg-red')} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      {sisa > 0 && (
                        <div className="text-xs text-orange font-bold font-tabular-nums pt-0.5 flex items-center justify-between">
                          <span>Sisa Tagihan:</span>
                          <span className="text-sm font-extrabold text-red">Rp {sisa.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

export default TunggakanAR;
