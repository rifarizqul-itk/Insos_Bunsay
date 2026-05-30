import React, { useState, useEffect } from 'react';

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY; 
const MIDTRANS_SERVER_KEY = import.meta.env.VITE_MIDTRANS_SERVER_KEY;

function BayarSekarang({ nominalAwal = '', jenisAwal = 'Sewa Gedung', onSuksesKirim }) {
  const [metode, setMetode] = useState('qris_manual'); 
  const [jenisTagihan, setJenisTagihan] = useState(jenisAwal);
  const [nominal, setNominal] = useState(nominalAwal);
  const [berkasDipilih, setBerkasDipilih] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Memuat script Midtrans Snap secara dinamis saat komponen aktif
  useEffect(() => {
    const scriptSnap = document.createElement('script');
    scriptSnap.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    scriptSnap.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    scriptSnap.async = true;
    document.body.appendChild(scriptSnap);

    return () => {
      document.body.removeChild(scriptSnap);
    };
  }, []);

  const handleProsesPembayaran = async (e) => {
    e.preventDefault();
    if (!nominal || nominal <= 0) {
      alert('Mohon masukkan nominal pembayaran tagihan yang valid.');
      return;
    }

    if (metode === 'midtrans_gateway') {
      setIsLoading(true);
      const orderId = `BUNSAY-${Date.now()}`;

      const penampungPayload = {
        transaction_details: {
          order_id: orderId,
          gross_amount: parseInt(nominal)
        },
        credit_card: {
          secure: true
        },
        customer_details: {
          first_name: "Hj. Yuliana",
          email: "yuliana.tenant@plazabunsay.com",
          phone: "08115901119"
        }
      };

      try {
        const respon = await fetch('/v1/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${btoa(MIDTRANS_SERVER_KEY.trim() + ':')}`
          },
          body: JSON.stringify(penampungPayload)
        });

        const dataHasil = await respon.json();

        if (dataHasil.token) {
          setIsLoading(false);
          window.snap.pay(dataHasil.token, {
            onSuccess: function (result) {
              alert('Pembayaran Berhasil! Sistem otomatis memperbarui status Anda.');
              onSuksesKirim({
                id: result.order_id,
                nama: 'Hj. Yuliana',
                kios: 'B-1001',
                tagihan: jenisTagihan,
                nominal: `Rp ${parseInt(nominal).toLocaleString('id-ID')}`,
                metode: 'Midtrans (Otomatis)',
                waktu: new Date().toLocaleString('id-ID') + ' WITA',
                status: 'Lunas'
              });
            },
            onPending: function (result) {
              alert('Pembayaran Anda sedang ditangguhkan. Silakan selesaikan transaksi pada kanal terkait.');
            },
            onError: function (result) {
              alert('Terjadi kesalahan selama proses pemrosesan transaksi gateway.');
            },
            onClose: function () {
              alert('Anda telah menutup jendela pembayaran instan Midtrans.');
            }
          });
        } else {
          setIsLoading(false);
          alert('Gagal mendapatkan token transaksi. Pastikan Server Key Sandbox Anda sudah benar.');
        }
      } catch (error) {
        setIsLoading(false);
        alert('Gagal menghubungkan ke server payment gateway. Pastikan aturan proxy Vite sudah terpasang.');
      }

    } else {
      if (!berkasDipilih) {
        alert('Mohon unggah dokumen bukti transfer terlebih dahulu.');
        return;
      }
      
      alert('Bukti pembayaran berhasil dikirim. Mohon tunggu proses verifikasi oleh pihak pengelola.');
      onSuksesKirim({
        id: `TRX-${Math.floor(Math.random() * 9000) + 1000}`,
        nama: 'Hj. Yuliana',
        kios: 'B-1001',
        tagihan: jenisTagihan,
        nominal: `Rp ${parseInt(nominal).toLocaleString('id-ID')}`,
        metode: metode === 'qris_manual' ? 'QRIS Manual' : 'Transfer Bank Manual',
        waktu: new Date().toLocaleString('id-ID') + ' WITA',
        status: 'Pending'
      });
    }
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: 'Plus Jakarta Sans' }}>
      
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1A1410' }}>Formulir Pembayaran Tagihan Properti</h2>
        <p style={{ color: '#5C4F46', fontSize: '15px', marginTop: '4px', lineHeight: '1.6' }}>
          Silakan pilih metode pembayaran yang tersedia untuk menyelesaikan kewajiban sewa atau service charge kios Anda.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* PANEL KIRI: FORMULIR UTAMA */}
        <form onSubmit={handleProsesPembayaran} style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #E8E0D8', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 2px 12px rgba(139,26,26,0.04)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: '#1A1410' }}>Jenis Kewajiban Tagihan</label>
            <select value={jenisTagihan} onChange={(e) => setJenisTagihan(e.target.value)} style={{ height: '48px', borderRadius: '8px', border: '1px solid #E8E0D8', padding: '0 12px', fontSize: '15px', fontWeight: '600', color: '#1A1410', backgroundColor: '#F5F0EB' }}>
              <option value="Sewa Gedung">Sewa Gedung (Bulanan)</option>
              <option value="Service Charge">Service Charge Plaza</option>
              <option value="Cicilan Tunggakan (Piutang)">Cicilan Tunggakan (Piutang) Historis</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: '#1A1410' }}>Nominal Pembayaran (Rp)</label>
            <input type="number" placeholder="Contioh: 1500000" value={nominal} onChange={(e) => setNominal(e.target.value)} style={{ height: '48px', borderRadius: '8px', border: '1px solid #E8E0D8', padding: '0 14px', fontSize: '15px', fontWeight: '600', color: '#1A1410', backgroundColor: '#F5F0EB' }} required />
          </div>

          {/* BAGIAN UTAMA SELEKSI METODE: DESAIN DISERAGAMKAN SOURCING BERDASARKAN KRITIK */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: '#1A1410' }}>Pilih Metode Pembayaran</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setMetode('qris_manual')} style={{ flex: 1, height: '44px', backgroundColor: metode === 'qris_manual' ? '#FDF2F2' : '#F5F0EB', color: '#8B1A1A', border: metode === 'qris_manual' ? '2px solid #8B1A1A' : '1px solid #E8E0D8', borderRadius: '8px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  QRIS (Manual)
                </button>
                <button type="button" onClick={() => setMetode('transfer_manual')} style={{ flex: 1, height: '44px', backgroundColor: metode === 'transfer_manual' ? '#FDF2F2' : '#F5F0EB', color: '#8B1A1A', border: metode === 'transfer_manual' ? '2px solid #8B1A1A' : '1px solid #E8E0D8', borderRadius: '8px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  Transfer Bank (Manual)
                </button>
              </div>
              
              {/* Tombol Midtrans Sekaran Menggunakan Struktur CSS Outline yang Identik */}
              <button type="button" onClick={() => setMetode('midtrans_gateway')} style={{ width: '100%', height: '48px', backgroundColor: metode === 'midtrans_gateway' ? '#FDF2F2' : '#F5F0EB', color: '#8B1A1A', border: metode === 'midtrans_gateway' ? '2px solid #8B1A1A' : '1px solid #E8E0D8', borderRadius: '8px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                Pembayaran Instan Otomatis
              </button>

            </div>
          </div>

          {metode !== 'midtrans_gateway' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="page-fade-in">
              <label style={{ fontSize: '15px', fontWeight: '800', color: '#1A1410' }}>Unggah Bukti Transfer</label>
              <div onClick={() => setBerkasDipilih(true)} style={{ width: '100%', padding: '24px', border: '2px dashed #E8E0D8', borderRadius: '8px', backgroundColor: '#FBF7F2', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: berkasDipilih ? '#1A6B3A' : '#1A1410', fontWeight: '800' }}>
                  {berkasDipilih ? '✓ Dokumen Bukti Transaksi Berhasil Dilampirkan' : 'Klik untuk mengunggah foto struk transaksi Anda'}
                </span>
              </div>
            </div>
          )}

          {/* Tombol Submit Utama Eksklusif Menjadi Satu-satunya Elemen Berwarna Solid */}
          <button type="submit" disabled={isLoading} style={{ backgroundColor: '#8B1A1A', color: '#ffffff', height: '48px', fontSize: '15px', fontWeight: '800', border: 'none', borderRadius: '8px', marginTop: '6px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(139,26,26,0.15)' }}>
            {isLoading ? 'Menghubungkan ke Server...' : metode === 'midtrans_gateway' ? 'Bayar Sekarang' : 'Kirim Bukti Pembayaran'}
          </button>
        </form>

        {/* PANEL KANAN: PANDUAN PENGGUNA */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #E8E0D8', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 2px 12px rgba(139,26,26,0.04)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', borderBottom: '1px solid #E8E0D8', paddingBottom: '10px', color: '#1A1410' }}>Panduan Pembayaran</h3>
          
          {metode === 'qris_manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', color: '#5C4F46', fontWeight: '600', lineHeight: '1.6' }}>Silakan pindai kode QRIS resmi Pengelola Plaza Kebun Sayur di bawah ini, kemudian unggah struk sukses Anda.</p>
              <div style={{ width: '160px', height: '160px', backgroundColor: '#F5F0EB', border: '1px solid #E8E0D8', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#9E8E82', fontStyle: 'italic', fontWeight: '700' }}>[Barcode QRIS]</span>
              </div>
            </div>
          )}

          {metode === 'transfer_manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '15px', color: '#1A1410' }}>
              <p style={{ fontWeight: '600', color: '#5C4F46' }}>Kirimkan dana transfer Anda ke rekening penampungan resmi pihak pengelola:</p>
              <div style={{ backgroundColor: '#F5F0EB', padding: '16px', borderRadius: '8px', border: '1px solid #E8E0D8' }}>
                <div style={{ color: '#5C4F46', fontSize: '12px', fontWeight: '800' }}>BANK TUJUAN:</div>
                <div style={{ fontWeight: '800', fontSize: '16px', margin: '2px 0 10px 0', color: '#1A1410' }}>Bank Negara Indonesia (BNI)</div>
                <div style={{ color: '#5C4F46', fontSize: '12px', fontWeight: '800' }}>NOMOR REKENING RESMI:</div>
                <div style={{ fontWeight: '800', fontSize: '18px', color: '#8B1A1A', letterSpacing: '0.5px' }}>0811-5901-119</div>
              </div>
            </div>
          )}

          {metode === 'midtrans_gateway' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', color: '#5C4F46', lineHeight: '1.6' }}>
              <p style={{ fontWeight: '700', color: '#1A1410' }}>Sistem Verifikasi Otomatis Terintegrasi:</p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Anda tidak perlu mengunggah struk atau bukti foto transfer secara manual.</li>
                <li>Sistem admin akan langsung menerima konfirmasi pelunasan secara real-time dari sistem perbankan.</li>
                <li>Mendukung transaksi aman menggunakan jaringan Virtual Account bank besar nasional.</li>
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default BayarSekarang;