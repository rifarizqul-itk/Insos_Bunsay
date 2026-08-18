import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, EmptyState, SkeletonCard, SkeletonText, cn } from '@bunsay/shared-ui';
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
      // Step 1: Ambil idPemilik dari dashboard
      const dashRes = await httpClient.get('/api/v1/tenant/dashboard');
      const idPemilik = dashRes.data?.idPemilik;

      if (!idPemilik) {
        throw new Error('Data pemilik tidak ditemukan.');
      }

      // Step 2: Ambil semua tagihan milik penyewa ini
      const tagihanRes = await httpClient.get('/api/v1/tenant/tagihan');
      const semuaTagihan = Array.isArray(tagihanRes.data) ? tagihanRes.data : [];


      // Filter hanya yang belum lunas
      const tagihanMenunggak = semuaTagihan
        .filter(t => t.Status_Tagihan !== 'Lunas')
        .map(t => {
          const totalTagihan = parseFloat(t.Total_Tagihan || 0);
          const sisaTagihan = parseFloat(t.Sisa_Tagihan ?? totalTagihan);
          const totalTerbayar = Math.max(0, totalTagihan - sisaTagihan);
          // Format jatuh tempo: "YYYY-MM-DD" → "DD Mon YYYY"
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
            statusTagihan: t.Status_Tagihan,
            jatuhTempo,
          };
        });

      // Total tunggakan = jumlah sisa dari semua tagihan belum lunas
      const sumSisa = tagihanMenunggak.reduce((acc, curr) => {
        return acc + Math.max(0, curr.totalTagihan - curr.totalTerbayar);
      }, 0);

      setTotalTunggakanVal(sumSisa);
      setListTagihan(tagihanMenunggak);
    } catch (err) {
      console.error('Failed to fetch tunggakan data:', err);
      setError(err.message || 'Gagal memuat data tunggakan.');
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
        totalTunggakan: totalTunggakanVal,
        listTagihan: listTagihan
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="h-44" />
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center bg-red-50 border-red/20 flex flex-col items-center gap-3">
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
    <div data-slot="tunggakan-ar" className="page-fade-in flex flex-col gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Akumulasi Tunggakan
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Rincian sisa sewa bulan-bulan sebelumnya yang belum lunas.
        </p>
      </div>

      <div className="tunggakan-layout-grid mobile-stack grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card variant="elevated" className="flex flex-col gap-5 p-6 sm:p-7">
          <div>
            <h2 className="label-micro text-balance">Total Tagihan Kumulatif & Tunggakan</h2>
            <div className={cn('text-3xl sm:text-4xl font-extrabold font-tabular-nums tracking-tight mt-1.5', totalTunggakanVal > 0 ? 'text-orange' : 'text-green')}>
              Rp {totalTunggakanVal.toLocaleString('id-ID')}
            </div>
          </div>
          
          {/* Rincian Nominal Sebelum & Sesudah Ditambahkan Tarif Bulan Ini */}
          {totalTunggakanVal > 0 && listTagihan.length > 0 && (() => {
            const latestBill = listTagihan[0]; // Tagihan berjalan / bulan ini
            const tarifBulanIni = latestBill ? Math.max(0, latestBill.totalTagihan - latestBill.totalTerbayar) : 0;
            const tunggakanLalu = Math.max(0, totalTunggakanVal - tarifBulanIni);

            return (
              <div className="border-t border-border/80 pt-4 flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center text-text-2">
                  <span className="font-medium flex items-center gap-2">
                    <Icon icon="heroicons:clock-20-solid" className="size-4 text-orange" />
                    <span>Tunggakan Sebelum Bulan Ini:</span>
                  </span>
                  <span className="font-tabular-nums font-bold text-text">Rp {tunggakanLalu.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-text-2">
                  <span className="font-medium flex items-center gap-2">
                    <Icon icon="heroicons:plus-circle-20-solid" className="size-4 text-mono-400" />
                    <span>Tarif Sewa Bulan Ini ({latestBill?.periode || 'Berjalan'}):</span>
                  </span>
                  <span className="font-tabular-nums font-bold text-text">Rp {tarifBulanIni.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-border/60 pt-3 flex justify-between items-center font-extrabold text-text">
                  <span className="flex items-center gap-2">
                    <Icon icon="heroicons:document-text-20-solid" className="size-4 text-red" />
                    <span>Total Tagihan Kumulatif:</span>
                  </span>
                  <span className="font-tabular-nums text-orange text-base sm:text-lg">Rp {totalTunggakanVal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            );
          })()}

          <Button
            variant={totalTunggakanVal > 0 ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            disabled={totalTunggakanVal <= 0}
            onClick={handleBayar}
            aria-label={`Bayar cicilan atau pelunasan sebesar total Rp ${totalTunggakanVal.toLocaleString('id-ID')}`}
          >
            {totalTunggakanVal > 0 ? 'Bayar Tagihan Sekarang' : 'Tidak Ada Tagihan Menunggak'}
          </Button>
        </Card>

        <Card className="p-6 sm:p-7 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border/80 pb-3">
            <h2 className="text-base font-bold text-text">
              Daftar Tagihan Menunggak
            </h2>
            <span className="text-xs font-bold text-text-3 font-tabular-nums">
              {listTagihan.length} Periode
            </span>
          </div>

          {listTagihan.length === 0 ? (
            <EmptyState
              icon="heroicons:check-circle-20-solid"
              title="Semua Tagihan Lunas!"
              description="Hebat! Tidak ada tunggakan sewa kios untuk akun Anda saat ini."
            />
          ) : (
            <ul className="space-y-3 list-none p-0 m-0">
              {listTagihan.map((item, idx) => {
                const total = item.totalTagihan || item.tarifSewa || 0;
                const terbayar = item.totalTerbayar || item.terbayar || 0;
                const sisa = Math.max(0, total - terbayar);
                const percent = total > 0 ? Math.min(100, Math.round((terbayar / total) * 100)) : 0;

                return (
                  <li key={item.idTagihan || idx} className="bg-mono-100/50 border border-border/70 rounded-md p-4 sm:p-5 flex flex-col gap-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-text">
                          Periode Sewa: <span className="font-tabular-nums">{item.periode}</span>
                        </div>
                        <div className="text-xs text-text-3 font-medium mt-0.5">
                          Jatuh Tempo: <span className="font-tabular-nums text-text-2">{item.jatuhTempo}</span>
                        </div>
                      </div>
                      <Badge status={item.statusTagihan} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-tabular-nums text-text-2">
                        <span>Terbayar: <strong>Rp {terbayar.toLocaleString('id-ID')}</strong> dari Rp {total.toLocaleString('id-ID')}</span>
                        <span className="font-bold text-text">{percent}%</span>
                      </div>
                      <div 
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`Progres pelunasan tagihan periode ${item.periode}: ${percent}% terbayar`}
                        className="h-2 bg-mono-200 rounded-sm overflow-hidden"
                      >
                        <div 
                          className={cn('h-full transition-all duration-300 rounded-sm', percent >= 100 ? 'bg-green' : percent > 0 ? 'bg-orange' : 'bg-red')} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      {sisa > 0 && (
                        <div className="text-xs text-orange font-bold font-tabular-nums pt-0.5">
                          Sisa Tunggakan: Rp {sisa.toLocaleString('id-ID')}
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
