import React, { useState, useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import { useTransactionDomain } from '../../context/TransactionContext';
import Icon from '../../components/ui/Icon';
import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import FIFOPreview from '../../components/ui/FIFOPreview';
import { allocatePaymentFIFO } from '../../utils/fifoAllocator';
import { getTunggakan } from '../../api/tenant';

function SetoranTunai() {
  const { addToast } = useUI();
  const { recordCashPayment, error: domainError } = useTransactionDomain();
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [jenisTagihan, setJenisTagihan] = useState('Setoran Tunai Loket Pengelola');
  const [nominalTunai, setNominalTunai] = useState('');
  const [buktiTunai, setBuktiTunai] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fifoAllocations, setFifoAllocations] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);

  const tenantData = [
    { id: 1, nama: 'Hj. Yuliana', kios: 'B-1001, B-1002' },
    { id: 2, nama: 'Eva Tauresea', kios: 'B-1004' },
    { id: 3, nama: 'H. Ahmad', kios: 'B-1013' },
    { id: 4, nama: 'Toko Kalimantan', kios: 'A-1002' }
  ];

  useEffect(() => {
    if (selectedTenantId) {
      getTunggakan(selectedTenantId).then(res => {
        if (res && res.tagihanMenunggak) {
          setUnpaidBills(res.tagihanMenunggak);
        } else {
          setUnpaidBills([]);
        }
      }).catch(() => setUnpaidBills([]));
    } else {
      setUnpaidBills([]);
    }
  }, [selectedTenantId]);

  useEffect(() => {
    const nominalNum = Number(nominalTunai) || 0;
    if (selectedTenantId && nominalNum > 0) {
      const activeUnpaid = unpaidBills.filter(b => b.statusTagihan !== 'Lunas');
      const fifo = allocatePaymentFIFO(activeUnpaid, nominalNum);
      setFifoAllocations(fifo.allocations);
    } else {
      setFifoAllocations([]);
    }
  }, [nominalTunai, selectedTenantId, unpaidBills]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiTunai(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewBukti(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const [tenantError, setTenantError] = useState(null);
  const [nominalError, setNominalError] = useState(null);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let hasErr = false;
    setTenantError(null);
    setNominalError(null);

    if (!selectedTenantId) {
      setTenantError('Silakan pilih tenant terlebih dahulu.');
      addToast('Silakan pilih tenant terlebih dahulu.', 'error');
      hasErr = true;
    }

    const nominalNum = parseInt(nominalTunai, 10);
    if (!nominalNum || nominalNum <= 0) {
      setNominalError('Masukkan nominal tunai yang valid.');
      addToast('Masukkan nominal tunai yang valid.', 'error');
      hasErr = true;
    }

    if (!buktiTunai) {
      addToast('Mohon unggah foto bukti pembayaran tunai.', 'error');
      hasErr = true;
    }

    if (hasErr) return;
    setShowKonfirmasi(true);
  };

  const handleSimpanTunaiFinal = async () => {
    setIsSubmitting(true);
    const tenant = tenantData.find(t => String(t.id) === selectedTenantId);
    try {
      const result = await recordCashPayment({
        tenantId: Number(selectedTenantId),
        jenisTagihan,
        nominal: parseInt(nominalTunai),
        bukti: buktiTunai.name
      });

      if (result && result.success) {
        addToast(result.message || `Setoran tunai untuk ${tenant?.nama || 'tenant'} berhasil dicatat.`, 'success');
        setNominalTunai('');
        setSelectedTenantId('');
        setBuktiTunai(null);
        setPreviewBukti(null);
        setShowKonfirmasi(false);
        const fileInput = document.getElementById('upload-bukti-tunai');
        if (fileInput) fileInput.value = '';
      } else {
        addToast(result?.message || 'Gagal menyimpan setoran.', 'error');
      }
    } catch (err) {
      addToast(domainError?.message || 'Gagal menyimpan setoran. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Loket Setoran Tunai Admin
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Pencatatan resmi pembayaran sewa kios secara tunai di kantor pengelola.
        </p>
      </div>

      <Card variant="elevated" className="max-w-[640px] p-6 sm:p-8 flex flex-col gap-6">
        {showKonfirmasi ? (
          <div className="flex flex-col gap-5 page-fade-in" role="region" aria-label="Tinjauan Konfirmasi Setoran Tunai">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Icon icon="heroicons:shield-check-20-solid" width="24" height="24" className="text-green" />
              <h2 className="text-lg font-extrabold text-text tracking-tight text-balance">
                Konfirmasi Setoran Tunai Loket
              </h2>
            </div>
            <p className="text-sm text-text-2 text-pretty">
              Mohon periksa kembali rincian setoran tunai sebelum menyimpan pencatatan transaksi secara permanen.
            </p>

            <Card variant="inset" className="p-4 flex flex-col gap-2.5 text-sm">
              <div><span className="text-text-3 font-semibold">Tenant:</span> <strong className="text-text font-bold">{tenantData.find(t => String(t.id) === selectedTenantId)?.nama} ({tenantData.find(t => String(t.id) === selectedTenantId)?.kios})</strong></div>
              <div><span className="text-text-3 font-semibold">Nominal Tunai:</span> <strong className="text-text font-bold font-tabular-nums text-base text-red">Rp {parseInt(nominalTunai, 10).toLocaleString('id-ID')}</strong></div>
              {buktiTunai && <div><span className="text-text-3 font-semibold">Bukti:</span> <strong className="text-text font-bold">{buktiTunai.name}</strong></div>}
            </Card>

            <FIFOPreview allocations={fifoAllocations} nominal={Number(nominalTunai) || 0} />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setShowKonfirmasi(false)}
                className="flex-1 h-12 text-sm font-extrabold"
              >
                Ubah Data
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                onClick={handleSimpanTunaiFinal}
                className="flex-1 h-12 text-sm font-extrabold shadow-md bg-green hover:bg-green/90"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin" width="20" height="20" />
                    <span>Menyimpan...</span>
                  </span>
                ) : (
                  'Konfirmasi & Simpan Setoran'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
            <FormField label="Pilih Tenant Kios" id="setoran-tenant" required error={tenantError}>
              <select
                value={selectedTenantId}
                onChange={(e) => { setSelectedTenantId(e.target.value); if (tenantError) setTenantError(null); }}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold font-tabular-nums text-text focus:bg-white transition-colors"
              >
                <option value="">-- Pilih Tenant Kios --</option>
                {tenantData.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.kios} - {t.nama}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Nominal Tunai (Rp)" id="setoran-nominal" required error={nominalError}>
              <input
                type="number"
                placeholder="Contoh: 1500000"
                value={nominalTunai}
                onChange={(e) => { setNominalTunai(e.target.value); if (nominalError) setNominalError(null); }}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-extrabold font-tabular-nums text-text focus:bg-white transition-colors"
              />
            </FormField>

            {/* FIFO Preview */}
            <FIFOPreview allocations={fifoAllocations} nominal={Number(nominalTunai) || 0} />

            <FormField label="Unggah Foto Bukti Setoran" id="upload-bukti-tunai" required={!previewBukti}>
              <input
                id="upload-bukti-tunai"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <label
                htmlFor="upload-bukti-tunai"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    document.getElementById('upload-bukti-tunai')?.click();
                  }
                }}
                className="flex flex-col items-center justify-center gap-2 bg-warm-gray/50 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer text-center min-h-[120px] hover:border-red hover:bg-red-50/20 transition-all active:scale-[0.99]"
              >
                <Icon icon="heroicons:arrow-up-tray-20-solid" width="28" height="28" className="text-red" />
                <span className="text-sm font-bold text-text">
                  {buktiTunai ? buktiTunai.name : 'Upload Foto Bukti Setoran'}
                </span>
                <span className="text-xs text-text-3 font-medium">
                  Ketuk untuk memilih foto bukti dari komputer/HP
                </span>
              </label>
              {previewBukti && (
                <div className="mt-2 border border-border rounded-lg p-2 bg-warm-gray/30 flex justify-center">
                  <img src={previewBukti} alt={buktiTunai ? `Preview foto bukti: ${buktiTunai.name}` : 'Preview foto bukti'} className="max-h-48 rounded object-contain" />
                </div>
              )}
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              className="mt-2 h-13 text-base font-extrabold shadow-md"
            >
              Tinjau & Konfirmasi Setoran Tunai
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default SetoranTunai;
