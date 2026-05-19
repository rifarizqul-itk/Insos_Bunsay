import React from 'react';

function TunggakanAR({ onPemicuBayar }) {
  const riwayatCicilan = [
    { ke: 1, tanggal: '05 April 2026', nominal: 'Rp 1.000.000', status: 'Tervalidasi Pengelola' },
    { ke: 2, tanggal: '19 Mei 2026', nominal: 'Rp 2.000.000', status: 'Menunggu Konfirmasi' }
  ];

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Informasi Tunggakan Historis (AR)</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Arsip pelacakan nilai tunggakan pembukuan lama masa gedung terhitung hingga September 2024.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Kotak Ringkasan Sisa Tagihan */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Tunggakan Awal</span>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--orange)', marginTop: '4px' }}>Rp 13.219.998</div>
          </div>
          
          <div style={{ fontSize: '14px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-2)' }}>Total Terbayar Lewat Cicilan:</span>
              <strong style={{ color: 'var(--green)' }}>Rp 3.000.000</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px dashed var(--border)', paddingTop: '8px' }}>
              <span>Sisa Kewajiban Bersih:</span>
              <span>Rp 10.219.998</span>
            </div>
          </div>

          <button 
            onClick={() => onPemicuBayar('10219998', 'Cicilan Tunggakan AR')}
            style={{ backgroundColor: 'var(--red)', color: '#ffffff', padding: '12px', fontSize: '15px', fontWeight: '700', marginTop: '8px' }}
          >
            Angsur Tunggakan Sekarang
          </button>
        </div>

        {/* Tabel Rekap Cicilan Sebelah Kanan */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Riwayat Setoran Angsuran</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {riwayatCicilan.map((cicil) => (
              <div key={cicil.ke} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: 'var(--warm-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>Angsuran Ke-{cicil.ke}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>Diterima: {cicil.tanggal}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text)' }}>{cicil.nominal}</div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: cicil.status.includes('Tervalidasi') ? 'var(--green)' : 'var(--orange)' }}>
                    {cicil.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TunggakanAR;