import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, EmptyState } from '@bunsay/shared-ui';

function TunggakanAR() {
  const navigate = useNavigate();

  const data = {
    totalHutangTunggakan: 3500000,
    tagihanMenunggak: [
      { idTagihan: 95, periode: '2026-04', tarifSewa: 4000000, totalTagihan: 4000000, totalTerbayar: 500000, statusTagihan: 'Dicicil', jatuhTempo: '10 Apr 2026' },
      { idTagihan: 101, periode: '2026-05', tarifSewa: 4000000, totalTagihan: 4000000, totalTerbayar: 0, statusTagihan: 'Belum Bayar', jatuhTempo: '10 Mei 2026' }
    ]
  };

  const { totalHutangTunggakan, tagihanMenunggak } = data || {};
  const totalTunggakanVal = totalHutangTunggakan ?? 0;
  const listTagihan = tagihanMenunggak || [];

  const handleBayar = () => {
    navigate('/tenant/pembayaran');
  };

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
            <h2 className="label-micro text-balance">Total Tunggakan Sewa</h2>
            <div className={`text-3xl sm:text-4xl font-extrabold font-tabular-nums tracking-tight mt-1.5 ${totalTunggakanVal > 0 ? 'text-orange' : 'text-green'}`}>
              Rp {totalTunggakanVal.toLocaleString('id-ID')}
            </div>
          </div>
          
          <div className="text-xs sm:text-sm text-text-2 leading-relaxed border-t border-border/80 pt-4">
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
            className="h-12 text-base font-extrabold gap-2 shadow-md mt-2"
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
