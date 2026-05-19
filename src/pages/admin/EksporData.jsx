import React, { useState } from 'react';

function EksporData() {
  const [bulanFilter, setBulanFilter] = useState('Mei');
  const [tahunFilter, setTahunFilter] = useState('2026');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadExcel = (e) => {
    e.preventDefault();
    setIsDownloading(true);
    
    // Simulasi jeda loading state pengunduhan dokumen server
    setTimeout(() => {
      setIsDownloading(false);
      alert(`Berkas rekapitulasi "Rekap_Pembayaran_Bunsay_${bulanFilter}_${tahunFilter}.xlsx" berhasil dibuat dan diunduh secara lokal.`);
    }, 1500);
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Judul Panel Ekspor */}
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Ekspor Rekapitulasi Keuangan</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Unduh seluruh data transaksi berjalan, status sewa gedung, service charge, serta rincian tunggakan 250 tenant aktif ke format Excel (.xlsx).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* Sisi Kiri: Panel Pengaturan Filter Periode */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border)', 
          padding: '32px',
          boxShadow: '0 2px 12px rgba(139,26,26,0.08)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', color: 'var(--text)' }}>
            Pilih Periode Laporan Keuangan
          </h3>

          <form onSubmit={handleDownloadExcel} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Dropdown Pilihan Bulan */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Bulan Pembukuan</label>
                <select 
                  value={bulanFilter} 
                  onChange={(e) => setBulanFilter(e.target.value)}
                  style={{ height: '44px', borderRadius: '8px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
                >
                  <option value="Januari">Januari</option>
                  <option value="Februari">Februari</option>
                  <option value="Maret">Maret</option>
                  <option value="April">April</option>
                  <option value="Mei">Mei</option>
                  <option value="Juni">Juni</option>
                  <option value="Juli">Juli</option>
                  <option value="Agustus">Agustus</option>
                  <option value="September">September</option>
                  <option value="Oktober">Oktober</option>
                  <option value="November">November</option>
                  <option value="Desember">Desember</option>
                </select>
              </div>

              {/* Dropdown Pilihan Tahun */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Tahun Anggaran</label>
                <select 
                  value={tahunFilter} 
                  onChange={(e) => setTahunFilter(e.target.value)}
                  style={{ height: '44px', borderRadius: '8px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

            </div>

            {/* Tombol Ekspor Berkas - Target Tinggi Minimal 44px */}
            <div style={{ marginTop: '12px' }}>
              <button 
                type="submit" 
                disabled={isDownloading}
                style={{ 
                  backgroundColor: isDownloading ? 'var(--text-3)' : 'var(--red)', 
                  color: '#ffffff', 
                  padding: '0 32px', 
                  fontSize: '15px', 
                  fontWeight: '700', 
                  height: '44px', 
                  border: 'none',
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  width: 'auto'
                }}
              >
                {isDownloading ? 'Memproses Kompilasi Baris Excel...' : 'Unduh Rekapitulasi Excel (.xlsx)'}
              </button>
            </div>
          </form>
        </div>

        {/* Sisi Kanan: Panduan Informasi Struktur Output Excel */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border)', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          boxShadow: '0 2px 12px rgba(139,26,26,0.08)' 
        }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>
            Komponen Lembar Kerja Excel (`.xlsx`)
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.6' }}>
            Berkas keluaran otomatis dikompilasi ke dalam tiga sheet utama berdasarkan pemetaan berkas fisik pengelola pasar:
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--text-2)', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
            <li><strong>Sheet 1:</strong> Data Rekapitulasi Setoran Sewa Unit Gedung bulanan.</li>
            <li><strong>Sheet 2:</strong> Data Rekapitulasi Pembayaran Service Charge & Kebersihan.</li>
            <li><strong>Sheet 3:</strong> Sisa saldo akumulasi Nilai Tunggakan AR historis per tenant.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default EksporData;