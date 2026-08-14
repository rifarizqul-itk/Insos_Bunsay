import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, EmptyState, SkeletonCard, SkeletonText } from '@bunsay/shared-ui';
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
      const totalTunggakan = tagihanMenunggak.reduce((sum, t) => {
        return sum + Math.max(0, t.totalTagihan - t.totalTerbayar);
      }, 0);

      setListTagihan(tagihanMenunggak);
      setTotalTunggakanVal(totalTunggakan);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat data tunggakan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTunggakanData();
  }, []);

  const handleBayar = () => {
    navigate('/tenant/pembayaran');
  };

  if (loading) {
    return (
      <div className="page-fade-in flex flex-col gap-8 font-sans" role="status" aria-live="polite">
        <div className="flex flex-col gap-2">
          <SkeletonText className="h-8 w-52" />
          <SkeletonText className="h-5 w-72 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-48" />
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
          <h3 className="text-xl font-extrabold text-text tracking-tight">Gagal Memuat Tunggakan</h3>
          <p className="text-text-2 text-sm font-semibold mt-1.5 leading-relaxed text-balance">{error}</p>
        </div>
        <Button variant="primary" size="md" onClick={fetchTunggakanData} className="px-6 h-11 font-bold shadow-sm mt-2">
          Coba Muat Ulang
        </Button>
      </div>
    );
  }

  return (
    <div className="page-fade-in flex flex-col gap-8 font-sans">
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
            <div className={`text-3xl sm:text-4xl font-extrabold font-tabular-nums tracking-tight mt-1.5 ${totalTunggakanVal > 0 ? 'text-orange' : 'text-green'}`}>
              Rp {totalTunggakanVal.toLocaleString('id-ID')}
            </div>
          </div>
          
          {/* Box Rincian Nominal Sebelum & Sesudah Ditambahkan Tarif Bulan Ini */}
          {totalTunggakanVal > 0 && listTagihan.length > 0 && (() => {
            const latestBill = listTagihan[0]; // Tagihan berjalan / bulan ini
            const tarifBulanIni = latestBill ? Math.max(0, latestBill.totalTagihan - latestBill.totalTerbayar) : 0;
            const tunggakanLalu = Math.max(0, totalTunggakanVal - tarifBulanIni);

            return (
              <div className="bg-warm-gray/60 border border-border rounded-xl p-4 flex flex-col gap-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-text-2">
                  <span className="font-semibold">📌 Tunggakan Sebelum Bulan Ini:</span>
                  <span className="font-tabular-nums font-bold text-text">Rp {tunggakanLalu.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-text-2">
                  <span className="font-semibold">➕ Tarif Sewa Bulan Ini ({latestBill?.periode || 'Berjalan'}):</span>
                  <span className="font-tabular-nums font-bold text-text">Rp {tarifBulanIni.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-center font-extrabold text-text text-sm">
                  <span>🧾 Total Tagihan Kumulatif:</span>
                  <span className="font-tabular-nums text-orange text-base">Rp {totalTunggakanVal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            );
          })()}

          <div className="text-xs sm:text-sm text-text-2 leading-relaxed border-t border-border/80 pt-3">
            <p className="margin-0 font-medium text-pretty">
              Nominal pembayaran bebas. Pembayaran Anda otomatis memotong tagihan bulan paling lama yang belum lunas.
            </p>
          </div>

          <Button
            variant={totalTunggakanVal > 0 ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            disabled={totalTunggakanVal <= 0}
            onClick={handleBayar}
            aria-label={`Bayar cicilan atau pelunasan sebesar total Rp ${totalTunggakanVal.toLocaleString('id-ID')}`}
            className="h-12 text-base font-extrabold gap-2 shadow-md mt-1"
          >
            {totalTunggakanVal > 0 ? (
              <>
                <span>Bayar Cicilan</span>
                <Icon icon="heroicons:arrow-right-20-solid" width="20" height="20" />
              </>
            ) : (
              <>
                <Icon icon="heroicons:check-circle-20-solid" width="20" height="20" className="text-green" />
                <span>Tidak Ada Tunggakan</span>
              </>
            )}
          </Button>
        </Card>

        <Card variant="elevated" className="flex flex-col gap-4 p-6 sm:p-7">
          <h2 className="text-lg font-extrabold text-text tracking-tight border-b border-border pb-3 text-balance">
            Daftar Tagihan Berjalan & Tunggakan
          </h2>
          
          {listTagihan.length === 0 ? (
            <EmptyState
              icon="heroicons:check-badge-20-solid"
              title="Semua Tagihan Lunas"
              description="Selamat! Anda tidak memiliki catatan sewa yang menunggak saat ini."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {listTagihan.map((item, idx) => {
                const total = item.totalTagihan || item.tarifSewa || 0;
                const terbayar = item.totalTerbayar || item.terbayar || 0;
                const sisa = Math.max(0, total - terbayar);
                const percent = total > 0 ? Math.min(100, Math.round((terbayar / total) * 100)) : 0;

                return (
                  <li key={item.idTagihan || idx} className="bg-warm-gray/40 border border-border/80 rounded-xl p-4 flex flex-col gap-3">
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
                        className="h-2 bg-border/80 rounded-full overflow-hidden"
                      >
                        <div 
                          className={`h-full transition-all duration-300 ${percent >= 100 ? 'bg-green' : percent > 0 ? 'bg-orange' : 'bg-red'}`} 
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
