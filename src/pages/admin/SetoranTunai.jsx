import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { recordCashPayment } from '../../api/transactions';
import { Icon } from '@iconify/react';

function SetoranTunai() {
  const { addToast } = useUI();
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [jenisTagihan, setJenisTagihan] = useState('Service Charge');
  const [nominalTunai, setNominalTunai] = useState('');
  const [buktiTunai, setBuktiTunai] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tenantData = [
    { id: 1, nama: 'Hj. Yuliana', kios: 'B-1001' },
    { id: 2, nama: 'Eva Tauresea', kios: 'B-1004' },
    { id: 3, nama: 'H. Ahmad', kios: 'B-1013' },
    { id: 4, nama: 'Toko Kalimantan', kios: 'A-1002' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiTunai(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewBukti(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSimpanTunai = async (e) => {
    e.preventDefault();
    if (!selectedTenantId) {
      addToast('Silakan pilih tenant terlebih dahulu.', 'error');
      return;
    }
    if (!buktiTunai) {
      addToast('Mohon unggah foto bukti pembayaran tunai.', 'error');
      return;
    }

    setIsSubmitting(true);
    const tenant = tenantData.find(t => String(t.id) === selectedTenantId);
    try {
      await recordCashPayment({
        tenantId: selectedTenantId,
        jenisTagihan,
        nominal: parseInt(nominalTunai),
        bukti: buktiTunai.name
      });
      addToast(`Setoran tunai untuk ${tenant.nama} (${tenant.kios}) berhasil dicatat.`, 'success');
      setNominalTunai('');
      setBuktiTunai(null);
      setPreviewBukti(null);
      const fileInput = document.getElementById('upload-bukti-tunai');
      if (fileInput) fileInput.value = '';
    } catch (_) {
      addToast('Gagal menyimpan setoran. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Loket Setoran Tunai</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Catat pembayaran tunai yang diterima langsung dari tenant di kantor pengelola.
        </p>
      </div>

      <div style={{ maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '32px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
        <form onSubmit={handleSimpanTunai} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="setoran-tenant" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Pilih Tenant</label>
            <select
              id="setoran-tenant"
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="font-tabular-nums"
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
              required
            >
              <option value="">-- Pilih Tenant --</option>
              {tenantData.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.kios} - {t.nama}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="setoran-jenis" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Jenis Tagihan</label>
            <select
              id="setoran-jenis"
              value={jenisTagihan}
              onChange={(e) => setJenisTagihan(e.target.value)}
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
            >
              <option value="Service Charge">Service Charge</option>
              <option value="Tunggakan AR">Tunggakan Historis (AR)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="setoran-nominal" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nominal Tunai (Rp)</label>
            <input
              id="setoran-nominal"
              type="number"
              placeholder="Contoh: 1500000"
              value={nominalTunai}
              onChange={(e) => setNominalTunai(e.target.value)}
              className="font-tabular-nums"
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="upload-bukti-tunai" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Unggah Foto Bukti</label>
            <input
              id="upload-bukti-tunai"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              required={!previewBukti}
            />
            <label
              htmlFor="upload-bukti-tunai"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--warm-gray)',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 16px',
                cursor: 'pointer',
                textAlign: 'center',
                minHeight: '110px',
                transition: 'border-color 0.2s ease',
              }}
              className="hover:border-red hover:bg-[#EBE3DB]/30 active-feedback"
            >
              <Icon icon="ic:baseline-cloud-upload" width="28" height="28" style={{ color: 'var(--red)' }} />
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                {buktiTunai ? buktiTunai.name : 'Pilih Foto Bukti Setoran'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                Ketuk untuk mengambil atau memilih gambar
              </span>
            </label>
            {previewBukti && (
              <div style={{ marginTop: '8px', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', backgroundColor: 'var(--warm-gray)' }}>
                <img src={previewBukti} alt="Bukti Tunai" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? 'var(--disabled-bg)' : 'var(--red)',
              color: '#ffffff',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '700',
              width: '100%',
              height: '48px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '8px'
            }}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Setoran Tunai'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetoranTunai;
