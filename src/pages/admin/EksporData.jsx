import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { useTransactionDomain } from '../../context/TransactionContext';
import FormField from '../../components/ui/FormField';

function EksporData() {
  const { addToast } = useUI();
  const { exportReport } = useTransactionDomain();
  const [bulanFilter, setBulanFilter] = useState('Mei');
  const [tahunFilter, setTahunFilter] = useState('2026');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadExcel = async (e) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      const result = await exportReport({ bulan: bulanFilter, tahun: tahunFilter });
      if (result && result.success) {
        addToast(result.message || `Berkas rekap ${bulanFilter} ${tahunFilter} berhasil diunduh.`, 'success');
      } else {
        addToast(result?.message || 'Gagal mengunduh berkas. Coba lagi.', 'error');
      }
    } catch (_) {
      addToast('Gagal mengunduh berkas. Coba lagi.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Ekspor Rekapitulasi Keuangan</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Unduh seluruh data transaksi berjalan, status sewa, service charge, dan rincian tunggakan ke format Excel (.xlsx).
        </p>
      </div>

      <div className="ekspor-layout-grid mobile-stack" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '32px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', color: 'var(--text)' }}>Pilih Periode Laporan</h3>
          <form onSubmit={handleDownloadExcel} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormField label="Bulan" id="ekspor-bulan">
                <select value={bulanFilter} onChange={(e) => setBulanFilter(e.target.value)} style={{ height: '44px', borderRadius: '8px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}>
                  {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </FormField>

              <FormField label="Tahun" id="ekspor-tahun">
                <select value={tahunFilter} onChange={(e) => setTahunFilter(e.target.value)} style={{ height: '44px', borderRadius: '8px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}>
                  {['2024','2025','2026'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
            </div>

            <button
              type="submit"
              disabled={isDownloading}
              aria-live="polite"
              style={{ backgroundColor: isDownloading ? 'var(--disabled-bg)' : 'var(--red)', color: '#ffffff', padding: '0 32px', fontSize: '15px', fontWeight: '700', height: '44px', border: 'none', borderRadius: 'var(--radius-md)', cursor: isDownloading ? 'not-allowed' : 'pointer', width: 'auto' }}
            >
              {isDownloading ? (
                <span role="status">Memproses Rekap...</span>
              ) : (
                'Unduh Excel (.xlsx)'
              )}
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>Komponen Lembar Excel</h4>
          <ul style={{ fontSize: '13px', color: 'var(--text-2)', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
            <li><strong>Sheet 1:</strong> Rekap Setoran Sewa Unit Gedung bulanan.</li>
            <li><strong>Sheet 2:</strong> Rekap Pembayaran Service Charge & Kebersihan.</li>
            <li><strong>Sheet 3:</strong> Sisa saldo akumulasi Tunggakan AR historis per tenant.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EksporData;
