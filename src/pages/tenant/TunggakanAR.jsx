import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useApi } from '../../hooks/useApi';
import { getTunggakan } from '../../api/tenant';

function TunggakanAR() {
  const navigate = useNavigate();
  const { setBayar, addToast } = useUI();
  const { data, loading, error, refetch } = useApi(getTunggakan, [], true);

  const handleBayar = () => {
    if (!data) return;
    setBayar(String(data.sisa), 'Cicilan Tunggakan (Piutang)');
    navigate('/tenant/pembayaran');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>Memuat data tunggakan...</div>;
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
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Tunggakan Awal</span>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--orange)', marginTop: '4px', fontFamily: 'monospace' }}>Rp {totalAwal.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ fontSize: '14px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-2)' }}>Total Terbayar Lewat Cicilan:</span>
              <strong style={{ color: 'var(--green)', fontFamily: 'monospace' }}>Rp {totalTerbayar.toLocaleString('id-ID')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px dashed var(--border)', paddingTop: '8px' }}>
              <span>Sisa Kewajiban Bersih:</span>
              <span style={{ fontFamily: 'monospace' }}>Rp {sisa.toLocaleString('id-ID')}</span>
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {sisa > 0 ? 'Angsur Tunggakan Sekarang' : '✅ Semua Lunas'}
          </button>
        </div>

        <div 
          className="p-4 sm:p-5 md:p-6"
          style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)', 
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)' 
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>Riwayat Setoran Angsuran</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {riwayatCicilan.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px' }}>Belum ada cicilan.</div>
            ) : (
              riwayatCicilan.map((cicil) => (
                <div key={cicil.ke} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: 'var(--warm-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>Angsuran Ke-<span style={{ fontFamily: 'monospace' }}>{cicil.ke}</span></div>
                    <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>Diterima: {cicil.tanggal}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text)', fontFamily: 'monospace' }}>Rp {cicil.nominal.toLocaleString('id-ID')}</div>
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
