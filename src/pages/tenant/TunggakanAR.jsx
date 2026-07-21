import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useTunggakanAR } from '../../hooks/useTenant';
import { Icon } from '@iconify/react';

function TunggakanAR() {
  const navigate = useNavigate();
  const { setBayar, addToast } = useUI();
  const { data, loading, error, refetch } = useTunggakanAR();


  const handleBayar = () => {
    if (!data) return;
    setBayar(String(data.sisa), 'Cicilan Tunggakan (Piutang)');
    navigate('/tenant/pembayaran');
  };

  if (loading) {
    return (
      <div className="page-fade-in flex flex-col gap-8">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-warm-gray/70 animate-pulse rounded-md"></div>
          <div className="h-5 w-80 bg-warm-gray/50 animate-pulse rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
          <div className="h-28 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
          <div className="h-28 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
        </div>
        <div className="h-48 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--red)' }}>Gagal memuat data.</p>
        <button onClick={refetch} style={{ marginTop: '16px', backgroundColor: 'var(--red)', color: '#fff', padding: '0 24px', height: '44px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' }}>Muat Ulang</button>
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Data tidak tersedia.</div>;
  }

  const { totalAwal, totalTerbayar, sisa, riwayatCicilan } = data;

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)' }}>Informasi Tunggakan Historis</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Arsip pelacakan nilai tunggakan pembukuan lama hingga September 2024.</p>
      </div>

      <div className="tunggakan-layout-grid mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        <div 
          className="p-4 sm:p-5 md:p-6"
          style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)' 
          }}
        >
          <div>
            <span className="label-micro">Total Tunggakan Awal</span>
            <div 
              className="text-2xl sm:text-3xl md:text-[32px] overflow-hidden text-ellipsis whitespace-nowrap font-tabular-nums"
              style={{ fontWeight: '800', color: 'var(--orange)', marginTop: '4px' }}
            >
              Rp {totalAwal.toLocaleString('id-ID')}
            </div>
          </div>
          <div style={{ fontSize: '14px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-2)' }}>Total Terbayar Lewat Cicilan:</span>
              <strong className="font-tabular-nums" style={{ color: 'var(--green)' }}>Rp {totalTerbayar.toLocaleString('id-ID')}</strong>
            </div>
            <div 
              role="progressbar"
              aria-valuenow={Math.min(100, Math.round((totalTerbayar / (totalAwal || 1)) * 100))}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Progres Pelunasan Tunggakan AR"
              style={{ height: '10px', backgroundColor: 'var(--warm-gray)', borderRadius: '6px', overflow: 'hidden', margin: '4px 0 8px 0' }}
            >
              <div style={{ width: `${Math.min(100, Math.round((totalTerbayar / (totalAwal || 1)) * 100))}%`, backgroundColor: 'var(--green)', height: '100%', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px dashed var(--border)', paddingTop: '8px' }}>
              <span>Sisa Kewajiban Bersih:</span>
              <span className="font-tabular-nums font-bold">Rp {sisa.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <button
            onClick={handleBayar}
            disabled={sisa <= 0}
            style={{
              backgroundColor: sisa > 0 ? 'var(--red)' : 'var(--disabled-bg)',
              color: '#ffffff',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '700',
              marginTop: '8px',
              height: '48px',
              cursor: sisa > 0 ? 'pointer' : 'not-allowed',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {sisa > 0 ? (
              'Angsur Tunggakan Sekarang'
            ) : (
              <>
                <Icon icon="ph:check-circle-bold" width="18" height="18" />
                <span>Semua Lunas</span>
              </>
            )}
          </button>
        </div>

        <div 
          className="p-4 sm:p-5 md:p-6"
          style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)', 
            boxShadow: 'var(--shadow-card)' 
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>Riwayat Setoran Angsuran</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {riwayatCicilan.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px' }}>Belum ada cicilan.</div>
            ) : (
              riwayatCicilan.map((cicil) => (
                <div key={cicil.ke} className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: 'var(--warm-gray)' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>Angsuran Ke-<span className="font-tabular-nums">{cicil.ke}</span></div>
                    <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>Diterima: {cicil.tanggal}</div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-tabular-nums font-bold" style={{ color: 'var(--text)' }}>Rp {cicil.nominal.toLocaleString('id-ID')}</div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: cicil.status === 'Tervalidasi' ? 'var(--green)' : 'var(--orange)' }}>
                      {cicil.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TunggakanAR;
