import React, { useState } from 'react';

function BayarSekarang({ nominalAwal = '', jenisAwal = 'Sewa Gedung', onSuksesKirim }) {
  const [metode, setMetode] = useState('qris');
  const [jenisTagihan, setJenisTagihan] = useState(jenisAwal);
  const [nominal, setNominal] = useState(nominalAwal);
  const [berkasDipilih, setBerkasDipilih] = useState(false);

  const handleKirimBukti = (e) => {
    e.preventDefault();
    if (!berkasDipilih) {
      alert('Mohon lampirkan file bukti transfer terlebih dahulu.');
      return;
    }
    alert('Bukti pembayaran Anda berhasil dikirimkan ke pihak pengelola.');
    if (onSuksesKirim) onSuksesKirim();
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Formulir Pembayaran Mandiri</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Selesaikan kewajiban tagihan kios Anda secara aman melalui kanal digital resmi.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
        {/* Sisi Kiri: Detail Pengisian Tagihan */}
        <form onSubmit={handleKirimBukti} style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Jenis Kewajiban Tagihan</label>
            <select value={jenisTagihan} onChange={(e) => setJenisTagihan(e.target.value)}>
              <option value="Sewa Gedung">Sewa Gedung (Bulanan)</option>
              <option value="Service Charge">Service Charge Plaza</option>
              <option value="Cicilan Tunggakan AR">Cicilan Tunggakan Historis (AR)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nominal Pembayaran (Rp)</label>
            <input 
              type="number" 
              placeholder="Contoh: 1500000" 
              value={nominal} 
              onChange={(e) => setNominal(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Pilih Metode Transaksi</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setMetode('qris')}
                style={{ flex: 1, backgroundColor: metode === 'qris' ? 'var(--red-50)' : 'var(--warm-gray)', color: metode === 'qris' ? 'var(--red)' : 'var(--text)', border: metode === 'qris' ? '1px solid var(--red)' : '1px solid transparent' }}
              >
                Metode QRIS
              </button>
              <button 
                type="button" 
                onClick={() => setMetode('transfer')}
                style={{ flex: 1, backgroundColor: metode === 'transfer' ? 'var(--red-50)' : 'var(--warm-gray)', color: metode === 'transfer' ? 'var(--red)' : 'var(--text)', border: metode === 'transfer' ? '1px solid var(--red)' : '1px solid transparent' }}
              >
                Transfer Bank
              </button>
            </div>
          </div>

          {/* Area Unggah Bukti dengan Dashed Border */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Unggah Dokumen Bukti Bayar</label>
            <div 
              onClick={() => setBerkasDipilih(true)}
              style={{ width: '100%', padding: '24px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--cream)', textAlign: 'center', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '14px', color: berkasDipilih ? 'var(--green)' : 'var(--text-3)', fontWeight: '600' }}>
                {berkasDipilih ? '✓ Berkas Bukti_Bayar.jpg Berhasil Dipilih' : 'Klik di Sini untuk Melampirkan Foto Bukti Transfer'}
              </span>
            </div>
          </div>

          <button type="submit" style={{ backgroundColor: 'var(--red)', color: '#ffffff', padding: '12px', fontSize: '15px', fontWeight: '700', width: '100%', marginTop: '8px' }}>
            Kirim Bukti untuk Verifikasi Pengelola
          </button>
        </form>

        {/* Sisi Kanan: Panduan Instruksi Pembayaran */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Panduan Instruksi Pembayaran
          </h3>

          {metode === 'qris' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-2)' }}>Silakan pindai kode QRIS resmi pengelola plaza di bawah ini menggunakan aplikasi perbankan atau dompet digital pilihan Anda.</p>
              <div style={{ width: '180px', height: '180px', backgroundColor: 'var(--warm-gray)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>[Gambar Simulasi QRIS]</span>
              </div>
              <strong style={{ fontSize: '14px', color: 'var(--red)' }}>PLAZA KEBUN SAYUR BALIKPAPAN</strong>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <p style={{ color: 'var(--text-2)' }}>Lakukan transfer antar-bank secara presisi menuju ke nomor rekening resmi pengelola plaza berikut:</p>
              <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-3)', fontSize: '12px', fontWeight: '700' }}>NAMA BANK:</div>
                <div style={{ fontWeight: '700', fontSize: '16px', margin: '2px 0 8px 0' }}>Bank Negara Indonesia (BNI)</div>
                <div style={{ color: 'var(--text-3)', fontSize: '12px', fontWeight: '700' }}>NOMOR REKENING:</div>
                <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--red)' }}>0811-5901-119</div>
                <div style={{ color: 'var(--text-3)', fontSize: '12px', fontWeight: '700', marginTop: '8px' }}>ATAS NAMA:</div>
                <div style={{ fontWeight: '700' }}>Pengelola Pengalihan Plaza Kebun Sayur</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BayarSekarang;