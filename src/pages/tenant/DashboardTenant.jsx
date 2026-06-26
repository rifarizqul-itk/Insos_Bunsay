import React from 'react';

function DashboardTenant({ onPemicuBayar }) {
  // Data rekap status tagihan riil penyewa berjalan tanpa rancu sewa gedung
  const dataTagihan = {
    serviceCharge: { status: 'Lunas', nominal: '350.000' },
    tunggakanPiutang: { status: 'Belum Lunas', nominal: '13.219.998', label: 'Tunggakan (Piutang) Historis s/d Sept 2024' }
  };

  const memilikiTagihan = parseInt(dataTagihan.tunggakanPiutang.nominal.replace(/\./g, '')) > 0;

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      
      {/* Sapaan Utama - Hierarki Font Besar & Kontras Tinggi */}
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1A1410', letterSpacing: '-0.5px' }}>
          Halo, Hj. Yuliana
        </h2>
        <p style={{ color: '#4A3F35', fontSize: '16px', fontWeight: '600', marginTop: '6px' }}>
          Pemilik Sah Kios Blok B-1001 — Selamat datang di panel administrasi mandiri Anda.
        </p>
      </div>

      {/* BANNER NOTIFIKASI PEMBAYARAN */}
      {memilikiTagihan && (
        <div style={{ 
          backgroundColor: '#FFF5F5', 
          border: '2px solid #D32F2F', 
          padding: '28px', 
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#D32F2F', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pemberitahuan Tagihan Belum Lunas
            </h3>
            <p style={{ fontSize: '16px', color: '#1A1410', fontWeight: '700', margin: '8px 0 0 0', lineHeight: '1.6' }}>
              Sistem mendeteksi Anda masih memiliki kewajiban {dataTagihan.tunggakanPiutang.label} sebesar Rp {dataTagihan.tunggakanPiutang.nominal}. Silakan klik tombol untuk melangsungkan pelaporan bayar.
            </p>
          </div>
          <div>
            <button 
              onClick={() => onPemicuBayar(dataTagihan.tunggakanPiutang.nominal.replace(/\./g, ''), 'Cicilan Tunggakan (Piutang)')}
              style={{ 
                backgroundColor: '#8B1A1A', 
                color: '#ffffff', 
                padding: '0 32px', 
                fontSize: '16px', 
                fontWeight: '800', 
                border: '2px solid #6B1414', 
                height: '52px', 
                cursor: 'pointer',
                borderRadius: '8px',
              }}
              onFocus={(e) => e.target.style.outline = '3px solid #1A1410'}
              onBlur={(e) => e.target.style.outline = 'none'}
            >
              Bayar Tagihan Sekarang
            </button>
          </div>
        </div>
      )}

      {/* STAT CARDS - Layout Sederhana Sesuai Permintaan Mitra */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        
        {/* Kartu 1: Masa Service Charge Terintegrasi */}
        <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #000000' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#4A3F35', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Masa Aktif Service Charge</span>
          <div style={{ fontSize: '26px', fontWeight: '800', lineHeight: '1.4', margin: '12px 0 8px 0', color: '#1A1410' }}>10 Juni 2026</div>
          <span style={{ fontSize: '14px', color: '#1A1410', fontWeight: '700' }}>Tenggat biaya fasilitas & pengelolaan kios</span>
        </div>

        {/* Kartu 2: Status Tagihan Bulanan Service Charge */}
        <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #000000' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#4A3F35', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Charge Bulan Ini</span>
          <div style={{ margin: '12px 0 8px 0', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ backgroundColor: '#E8F5EE', color: '#1A6B3A', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '14px', border: '2px solid #1A6B3A', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ✓ Lunas
            </span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#1A1410', lineHeight: '1.2' }}>Rp 350.000</div>
          </div>
          <span style={{ fontSize: '14px', color: '#1A1410', fontWeight: '700' }}>Fasilitas & utilitas pasar</span>
        </div>

        {/* Kartu 3: Tunggakan (Piutang) Historis */}
        <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #000000' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#4A3F35', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tunggakan (Piutang) Historis</span>
          <div style={{ fontSize: '26px', fontWeight: '800', lineHeight: '1.4', margin: '12px 0 8px 0', color: '#C05C00' }}>Rp 13.219.998</div>
          <span style={{ fontSize: '14px', color: '#1A1410', fontWeight: '700' }}>Data terarsip s/d Sept 2024</span>
        </div>

      </div>

    </div>
  );
}

export default DashboardTenant;