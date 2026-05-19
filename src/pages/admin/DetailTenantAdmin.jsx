import React, { useState } from 'react';

function DetailTenantAdmin({ tenantName, onBack }) {
  const [nominalTunai, setNominalTunai] = useState('');
  const [jenisTagihan, setJenisTagihan] = useState('Sewa Gedung');

  const handleSimpanTunai = (e) => {
    e.preventDefault();
    alert(`Berhasil mencatat pembayaran tunai manual untuk ${jenisTagihan} sebesar Rp ${nominalTunai}`);
    setNominalTunai('');
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Navigasi Kembali */}
      <div>
        <button onClick={onBack} style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '8px 16px', fontSize: '14px', marginBottom: '16px' }}>
          ← Kembali ke Daftar Utama
        </button>
        <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Profil Legalitas: {tenantName}</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Informasi arsip fisik Surat Perjanjian (SP) dan penanganan transaksi langsung kantor.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Kolom Kiri: Arsip Arsip Riil Data Excel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Dokumen Kepemilikan Kios</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: '14px' }}>
              <div><span style={{ color: 'var(--text-3)' }}>Nama Pemilik Berkas:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantName}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Nomor KTP Terarsip:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>175102.460772.0005</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Alamat Surat:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>Jl. Adil Makmur No. 42 Balikpapan</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Nomor Kontak:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>0812-5564-593</div></div>
              
              {/* Hasil Konversi Data Serial Angka Menjadi Format Tanggal Manusia */}
              <div><span style={{ color: 'var(--text-3)' }}>No. SP / Tanggal SP:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>423 / 5 Mei 2008</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>No. PPJB / Tanggal PPJB:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>423 / 5 Mei 2008</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Tanggal Serah Terima (BAST):</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>1 Januari 2010</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Ukuran Unit Properti:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>6 Meter Persegi</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Status Sertifikat / Tgl Ambil:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>422 / 12 April 2012</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Keterangan Tambahan:</span> <div style={{ fontWeight: '600', marginTop: '2px', color: 'var(--text-2)' }}>Sertifikat diambil BPD Syariah</div></div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Input Pembayaran Tunai Manual Kantor */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>Loket Pembayaran Tunai</h3>
          <form onSubmit={handleSimpanTunai} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Jenis Tagihan</label>
              <select value={jenisTagihan} onChange={(e) => setJenisTagihan(e.target.value)}>
                <option value="Sewa Gedung">Sewa Gedung</option>
                <option value="Service Charge">Service Charge</option>
                <option value="Tunggakan AR">Tunggakan Historis (AR)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Nominal Tunai (Rupiah)</label>
              <input 
                type="number" 
                placeholder="Contoh: 1500000" 
                value={nominalTunai} 
                onChange={(e) => setNominalTunai(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" style={{ backgroundColor: 'var(--red)', color: '#ffffff', padding: '12px', fontSize: '14px', fontWeight: '700', width: '100%' }}>
              Simpan Setoran Tunai
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default DetailTenantAdmin;