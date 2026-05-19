import React, { useState } from 'react';

function BayarSekarang({ nominalAwal = '', jenisAwal = 'Sewa Gedung', onSuksesKirim }) {
  const [metode, setMetode] = useState('qris');
  const [jenisTagihan, setJenisTagihan] = useState(jenisAwal);
  const [nominal, setNominal] = useState(nominalAwal);
  const [berkasDipilih, setBerkasDipilih] = useState(false);

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1A1410' }}>Formulir Pembayaran Mandiri</h2>
        <p style={{ color: '#4A3F35', fontSize: '15px', fontWeight: '600', marginTop: '4px' }}>Selesaikan kewajiban tagihan kios Anda secara aman melalui kanal digital resmi.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
        <form style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #D6C8BC', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: '#1A1410' }}>Jenis Kewajiban Tagihan</label>
            <select value={jenisTagihan} onChange={(e) => setJenisTagihan(e.target.value)} style={{ height: '48px', borderRadius: '8px', border: '1px solid #D6C8BC', padding: '0 12px', fontSize: '16px', fontWeight: '600', color: '#1A1410' }}>
              <option value="Sewa Gedung">Sewa Gedung (Bulanan)</option>
              <option value="Service Charge">Service Charge Plaza</option>
              <option value="Cicilan Tunggakan (Piutang)">Cicilan Tunggakan (Piutang) Historis</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: '#1A1410' }}>Nominal Pembayaran (Rp)</label>
            <input type="number" placeholder="Contoh: 1500000" value={nominal} onChange={(e) => setNominal(e.target.value)} style={{ height: '48px', borderRadius: '8px', border: '1px solid #D6C8BC', padding: '0 14px', fontSize: '16px', fontWeight: '600', color: '#1A1410' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: '#1A1410' }}>Pilih Metode Transaksi</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setMetode('qris')} style={{ flex: 1, height: '48px', backgroundColor: metode === 'qris' ? '#FDF2F2' : '#F5F0EB', color: '#8B1A1A', border: metode === 'qris' ? '2px solid #8B1A1A' : '1px solid #D6C8BC', borderRadius: '8px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
                Metode QRIS
              </button>
              <button type="button" onClick={() => setMetode('transfer')} style={{ flex: 1, height: '48px', backgroundColor: metode === 'transfer' ? '#FDF2F2' : '#F5F0EB', color: '#8B1A1A', border: metode === 'transfer' ? '2px solid #8B1A1A' : '1px solid #D6C8BC', borderRadius: '8px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
                Transfer Bank
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: '#1A1410' }}>Unggah Dokumen Bukti Bayar</label>
            <div onClick={() => setBerkasDipilih(true)} style={{ width: '100%', padding: '28px', border: '2px dashed #C4B9AF', borderRadius: '8px', backgroundColor: '#FFFDFB', textAlign: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '15px', color: berkasDipilih ? '#1A6B3A' : '#1A1410', fontWeight: '800' }}>
                {berkasDipilih ? '✓ Berkas Bukti_Bayar.jpg Berhasil Dipilih' : 'Klik di Sini untuk Melampirkan Foto Bukti Transfer'}
              </span>
            </div>
          </div>

          <button type="submit" style={{ backgroundColor: '#8B1A1A', color: '#ffffff', height: '52px', fontSize: '16px', fontWeight: '800', border: 'none', borderRadius: '8px', marginTop: '8px', cursor: 'pointer' }}>
            Kirim Bukti untuk Verifikasi Pengelola
          </button>
        </form>

        {/* Kotak Panduan Kanan */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #D6C8BC', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', borderBottom: '1px solid #D6C8BC', paddingBottom: '10px', color: '#1A1410' }}>Panduan Instruksi Pembayaran</h3>
          {metode === 'qris' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', color: '#1A1410', fontWeight: '600' }}>Silakan pindai kode QRIS resmi pengelola plaza di bawah ini menggunakan aplikasi perbankan Anda.</p>
              <div style={{ width: '180px', height: '180px', backgroundColor: '#F5F0EB', border: '1px solid #D6C8BC', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#4A3F35', fontStyle: 'italic', fontWeight: '700' }}>[Gambar Barcode QRIS]</span>
              </div>
              <strong style={{ fontSize: '16px', color: '#8B1A1A', fontWeight: '800' }}>PLAZA KEBUN SAYUR BALIKPAPAN</strong>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '15px', color: '#1A1410' }}>
              <p style={{ fontWeight: '600' }}>Lakukan transfer antar-bank secara presisi menuju ke nomor rekening resmi pengelola plaza berikut:</p>
              <div style={{ backgroundColor: '#F5F0EB', padding: '20px', borderRadius: '8px', border: '1px solid #D6C8BC' }}>
                <div style={{ color: '#4A3F35', fontSize: '13px', fontWeight: '800' }}>NAMA BANK:</div>
                <div style={{ fontWeight: '800', fontSize: '18px', margin: '4px 0 12px 0', color: '#1A1410' }}>Bank Negara Indonesia (BNI)</div>
                <div style={{ color: '#4A3F35', fontSize: '13px', fontWeight: '800' }}>NOMOR REKENING:</div>
                <div style={{ fontWeight: '800', fontSize: '22px', color: '#8B1A1A', letterSpacing: '0.5px' }}>0811-5901-119</div>
                <div style={{ color: '#4A3F35', fontSize: '13px', fontWeight: '800', marginTop: '12px' }}>ATAS NAMA:</div>
                <div style={{ fontWeight: '800', color: '#1A1410' }}>Pengelola Pengalihan Plaza Kebun Sayur</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BayarSekarang;