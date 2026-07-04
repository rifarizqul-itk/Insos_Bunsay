import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useTransactions } from '../../context/TransactionContext';
import { createPayment } from '../../api/tenant';

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

function BayarSekarang() {
  const navigate = useNavigate();
  const { bayarProps, setBayar, addToast } = useUI();
  const { tambahAntrean, tambahRiwayat } = useTransactions();

  const [metode, setMetode] = useState('transfer_manual');
  const [jenisTagihan, setJenisTagihan] = useState(bayarProps.jenis || 'Service Charge');
  const [nominal, setNominal] = useState(bayarProps.nominal || '');
  const [buktiTransfer, setBuktiTransfer] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const scriptSnap = document.createElement('script');
    scriptSnap.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    scriptSnap.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    scriptSnap.async = true;
    document.body.appendChild(scriptSnap);
    return () => document.body.removeChild(scriptSnap);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiTransfer(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewBukti(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProsesPembayaran = async (e) => {
    e.preventDefault();
    const nominalAngka = parseInt(nominal);
    if (!nominalAngka || nominalAngka <= 0) {
      addToast('Masukkan nominal pembayaran yang valid.', 'error');
      return;
    }

    if (metode === 'midtrans_gateway') {
      setIsLoading(true);
      try {
        const result = await createPayment({
          jenisTagihan,
          nominal: nominalAngka,
          metode: 'midtrans_gateway'
        });
        setIsLoading(false);
        if (result.success) {
          tambahRiwayat({
            id: result.id,
            nama: 'Hj. Yuliana',
            kios: 'B-1001',
            tagihan: jenisTagihan,
            nominal: `Rp ${nominalAngka.toLocaleString('id-ID')}`,
            metode: 'Midtrans (Otomatis)',
            waktu: new Date().toLocaleString('id-ID') + ' WITA',
            status: 'Lunas'
          });
          addToast('Pembayaran berhasil! Status Anda langsung lunas.', 'success');
          navigate('/tenant/histori');
        }
      } catch (_) {
        setIsLoading(false);
        addToast('Gagal memproses pembayaran. Coba lagi.', 'error');
      }
      return;
    }

    // Transfer manual
    if (!buktiTransfer) {
      addToast('Mohon unggah bukti transfer terlebih dahulu.', 'error');
      return;
    }

    const newTransaksi = {
      id: `TRX-${Math.floor(Math.random() * 9000) + 1000}`,
      nama: 'Hj. Yuliana',
      kios: 'B-1001',
      tagihan: jenisTagihan,
      nominal: `Rp ${nominalAngka.toLocaleString('id-ID')}`,
      metode: 'Transfer Bank Manual',
      waktu: new Date().toLocaleString('id-ID') + ' WITA',
      status: 'Pending',
      bukti: buktiTransfer.name
    };

    tambahAntrean(newTransaksi);
    addToast('Bukti terkirim! Menunggu verifikasi admin.', 'success');
    setBayar('', 'Service Charge');
    setBuktiTransfer(null);
    setPreviewBukti(null);
    navigate('/tenant/histori');
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: 'var(--warm-gray)',
            color: 'var(--text)',
            padding: '0 20px',
            fontSize: '14px',
            marginBottom: '16px',
            height: '44px',
            fontWeight: '600',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          ← Kembali
        </button>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)' }}>Formulir Pembayaran Tagihan</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Silakan pilih metode pembayaran untuk menyelesaikan kewajiban Anda.
        </p>
      </div>

      <div className="bayar-layout-grid mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px', alignItems: 'flex-start' }}>
        <form onSubmit={handleProsesPembayaran} style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-2)' }}>Jenis Tagihan</label>
            <select value={jenisTagihan} onChange={(e) => setJenisTagihan(e.target.value)} style={{ height: '48px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px', fontWeight: '600', color: 'var(--text)', backgroundColor: 'var(--warm-gray)' }}>
              <option value="Service Charge">Service Charge Plaza</option>
              <option value="Cicilan Tunggakan (Piutang)">Cicilan Tunggakan (Piutang) Historis</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-2)' }}>Nominal (Rp)</label>
            <input type="number" placeholder="Contoh: 350000" value={nominal} onChange={(e) => setNominal(e.target.value)} style={{ height: '48px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '0 14px', fontSize: '15px', fontWeight: '600', color: 'var(--text)', backgroundColor: 'var(--warm-gray)' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-2)' }}>Metode Pembayaran</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="button" onClick={() => { setMetode('transfer_manual'); setBerkasDipilih(false); }} style={{ width: '100%', height: '48px', backgroundColor: metode === 'transfer_manual' ? 'var(--red-50)' : 'var(--warm-gray)', color: 'var(--red)', border: metode === 'transfer_manual' ? '2px solid var(--red)' : '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>
                Transfer Bank (Manual) + Unggah Bukti
              </button>
              <button type="button" onClick={() => setMetode('midtrans_gateway')} style={{ width: '100%', height: '48px', backgroundColor: metode === 'midtrans_gateway' ? 'var(--red-50)' : 'var(--warm-gray)', color: 'var(--red)', border: metode === 'midtrans_gateway' ? '2px solid var(--red)' : '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>
                Pembayaran Instan Otomatis
              </button>
            </div>
          </div>

          {metode === 'transfer_manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="page-fade-in">
              <label style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-2)' }}>Unggah Bukti Transfer</label>
              <input
                id="upload-bukti-transfer"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ padding: '8px 0', border: 'none', background: 'transparent' }}
                required
              />
              {previewBukti && (
                <div style={{ marginTop: '8px', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', backgroundColor: 'var(--warm-gray)' }}>
                  <img src={previewBukti} alt="Bukti Transfer" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={isLoading} style={{ backgroundColor: 'var(--red)', color: '#ffffff', height: '48px', fontSize: '15px', fontWeight: '800', border: 'none', borderRadius: 'var(--radius-md)', marginTop: '6px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Menghubungkan...' : metode === 'midtrans_gateway' ? 'Bayar Sekarang' : 'Kirim Bukti Pembayaran'}
          </button>
        </form>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '10px', color: 'var(--text)' }}>Panduan Pembayaran</h3>
          {metode === 'transfer_manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '15px', color: 'var(--text)' }}>
              <p style={{ fontWeight: '600', color: 'var(--text-2)' }}>Kirimkan dana transfer Anda ke rekening resmi pengelola:</p>
              <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-2)', fontSize: '12px', fontWeight: '800' }}>BANK TUJUAN:</div>
                <div style={{ fontWeight: '800', fontSize: '16px', margin: '2px 0 10px 0', color: 'var(--text)' }}>Bank Negara Indonesia (BNI)</div>
                <div style={{ color: 'var(--text-2)', fontSize: '12px', fontWeight: '800' }}>NOMOR REKENING RESMI:</div>
                <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--red)', letterSpacing: '0.5px' }}>0811-5901-119</div>
              </div>
            </div>
          )}
          {metode === 'midtrans_gateway' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', color: 'var(--text-2)', lineHeight: '1.6' }}>
              <p style={{ fontWeight: '700', color: 'var(--text)' }}>Sistem Verifikasi Otomatis Terintegrasi:</p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Anda mengunggah foto bukti transfer secara manual untuk diverifikasi admin.</li>
                <li>Sistem admin akan langsung menerima konfirmasi pelunasan secara real-time.</li>
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
