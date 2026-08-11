import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, FormField, Button, Card, FIFOPreview, useToast } from '@bunsay/shared-ui';
import { allocatePaymentFIFO, MockTransactionAdapter } from '@bunsay/shared-core';
import { useTenantAuth } from '../../../public/useTenantAuth';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function BayarSekarang() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { httpClient } = useTenantAuth();
  
  const [metode, setMetode] = useState('transfer_manual');
  const [jenisTagihan] = useState('Pelunasan Masa Sewa & Akumulasi Tunggakan');
  const [nominal, setNominal] = useState(() => String(location.state?.nominal ?? '7500000'));
  const [nominalError, setNominalError] = useState(null);
  const [buktiTransfer, setBuktiTransfer] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [fifoAllocations, setFifoAllocations] = useState([]);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchUnpaidBills = async () => {
      try {
        const dashRes = await httpClient.get('/api/v1/tenant/dashboard');
        const idPemilik = dashRes.data?.idPemilik;
        if (idPemilik) {
          const tagihanRes = await httpClient.get(`/api/v1/admin/tagihan?Id_Pemilik=${idPemilik}`);
          const tagihan = Array.isArray(tagihanRes.data) ? tagihanRes.data : [];
          
          const activeUnpaid = tagihan
            .filter(t => t.Status_Tagihan !== 'Lunas')
            .map(t => ({
              idTagihan: t.Id_Tagihan,
              periode: t.Periode,
              tarifSewa: parseFloat(t.Tarif_Sewa || 0),
              totalTagihan: parseFloat(t.Total_Tagihan || 0),
              totalTerbayar: 0,
              statusTagihan: t.Status_Tagihan
            }));
          setUnpaidBills(activeUnpaid);
        }
      } catch (err) {
        console.error('Error fetching unpaid bills:', err);
      }
    };

    fetchUnpaidBills();
  }, [httpClient]);

  useEffect(() => {
    const nominalNum = Number(nominal) || 0;
    if (nominalNum > 0 && unpaidBills.length > 0) {
      const activeUnpaid = unpaidBills.filter(b => b.statusTagihan !== 'Lunas');
      const fifo = allocatePaymentFIFO(activeUnpaid, nominalNum);
      setFifoAllocations(fifo.allocations);
    } else {
      setFifoAllocations([]);
    }
  }, [nominal, unpaidBills]);

  useEffect(() => {
    return () => {
      if (previewBukti && previewBukti.startsWith('blob:')) {
        URL.revokeObjectURL(previewBukti);
      }
    };
  }, [previewBukti]);

  const handleRadioKeyDown = (e, targetRole) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const nextMetode = metode === 'transfer_manual' ? 'midtrans_gateway' : 'transfer_manual';
      setMetode(nextMetode);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (targetRole) setMetode(targetRole);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      addToast('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      addToast('Ukuran berkas terlalu besar. Maksimal 5 MB.', 'error');
      return;
    }

    if (previewBukti && previewBukti.startsWith('blob:')) {
      URL.revokeObjectURL(previewBukti);
    }
    setBuktiTransfer(file);
    setPreviewBukti(URL.createObjectURL(file));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const nominalAngka = parseInt(nominal, 10);
    if (!nominalAngka || nominalAngka <= 0) {
      setNominalError('Masukkan nominal pembayaran yang valid.');
      addToast('Masukkan nominal pembayaran yang valid.', 'error');
      return;
    }

    if (metode === 'transfer_manual' && !buktiTransfer) {
      addToast('Mohon unggah foto bukti transfer terlebih dahulu.', 'error');
      return;
    }

    setNominalError(null);
    setShowReview(true);
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleProsesPembayaran = async () => {
    setIsLoading(true);
    try {
      const base64Bukti = buktiTransfer ? await fileToBase64(buktiTransfer) : null;
      const targetTagihanId = unpaidBills[0]?.idTagihan || 1;
      const metodeBayar = metode === 'transfer_manual' ? 'Transfer' : 'Midtrans';
      const todayStr = new Date().toISOString().split('T')[0];

      const payload = {
        Id_Tagihan: targetTagihanId,
        Tanggal_Bayar: todayStr,
        Total_Bayar: Number(nominal),
        Metode_Bayar: metodeBayar,
        Bukti_Pembayaran: base64Bukti || (buktiTransfer?.name ?? '-'),
        Verifikasi_Pembayaran: metode === 'transfer_manual' ? 'Menunggu' : 'Diterima'
      };

      await httpClient.post('/api/v1/pembayaran', payload);
      setIsLoading(false);
      addToast(
        metode === 'transfer_manual'
          ? 'Bukti pembayaran terkirim! Menunggu verifikasi admin.'
          : 'Pembayaran berhasil dikonfirmasi!',
        'success'
      );
      navigate('/tenant/histori');
    } catch (err) {
      setIsLoading(false);
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal memproses pembayaran.';
      addToast(errMsg, 'error');
    }
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 gap-2 font-bold"
        >
          <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
          <span>Kembali</span>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Formulir Pembayaran Tagihan
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Masukkan nominal bebas dan pilih metode pembayaran sewa kios Anda.
        </p>
      </div>

      <div className="bayar-layout-grid mobile-stack grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          {showReview ? (
            <Card variant="glow" className="flex flex-col gap-5 p-6 sm:p-7 page-fade-in" role="region" aria-label="Tinjauan Konfirmasi Pembayaran">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Icon icon="heroicons:shield-check-20-solid" width="24" height="24" className="text-green" />
                <h2 className="text-lg font-extrabold text-text tracking-tight text-balance">
                  Konfirmasi Review Pembayaran
                </h2>
              </div>
              <p className="text-sm text-text-2 text-pretty">
                Mohon periksa kembali detail transaksi pembayaran Anda sebelum memproses secara permanen.
              </p>

              <Card variant="inset" className="p-4 flex flex-col gap-2.5 text-sm">
                <div><span className="text-text-3 font-semibold">Nominal Pembayaran:</span> <strong className="text-text font-bold font-tabular-nums text-base text-red">Rp {parseInt(nominal, 10).toLocaleString('id-ID')}</strong></div>
                <div><span className="text-text-3 font-semibold">Metode Pembayaran:</span> <strong className="text-text font-bold">{metode === 'transfer_manual' ? 'Transfer Bank (Manual)' : 'Pembayaran Otomatis Midtrans'}</strong></div>
                {metode === 'transfer_manual' && buktiTransfer && (
                  <div><span className="text-text-3 font-semibold">Lampiran Bukti:</span> <strong className="text-text font-bold">{buktiTransfer.name}</strong></div>
                )}
              </Card>

              <FIFOPreview allocations={fifoAllocations} nominal={Number(nominal) || 0} />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowReview(false)}
                  className="flex-1 h-12 text-sm font-extrabold"
                >
                  Ubah Data
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  onClick={handleProsesPembayaran}
                  className="flex-1 h-12 text-sm font-extrabold shadow-md bg-green hover:bg-green/90"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin" width="20" height="20" />
                      <span>Memproses...</span>
                    </span>
                  ) : (
                    'Konfirmasi & Bayar Sekarang'
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
              <Card variant="elevated" className="flex flex-col gap-5 p-6 sm:p-7">
                <FormField label="Nominal Pembayaran" id="input-nominal-pembayaran" required error={nominalError}>
                  <input 
                    type="number" 
                    placeholder="Contoh: 2000000" 
                    value={nominal} 
                    onChange={(e) => { setNominal(e.target.value); if (nominalError) setNominalError(null); }} 
                    className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold font-tabular-nums text-text focus:bg-white transition-colors"
                  />
                </FormField>

                <FIFOPreview allocations={fifoAllocations} nominal={Number(nominal) || 0} />

                <div className="flex flex-col gap-2 pt-2">
                  <span id="label-metode-pembayaran" className="text-sm font-bold text-text-2">
                    Pilih Metode Pembayaran
                  </span>
                  <div role="radiogroup" aria-labelledby="label-metode-pembayaran" className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      role="radio"
                      tabIndex={metode === 'transfer_manual' ? 0 : -1}
                      aria-checked={metode === 'transfer_manual'}
                      onClick={() => setMetode('transfer_manual')}
                      onKeyDown={(e) => handleRadioKeyDown(e, 'transfer_manual')}
                      className={`
                        w-full min-h-[48px] px-4 py-3 rounded-xl font-bold text-sm text-left flex items-center justify-between border transition-all cursor-pointer
                        ${metode === 'transfer_manual' ? 'bg-red-50 text-red border-red shadow-sm' : 'bg-warm-gray/60 text-text border-border hover:bg-warm-gray'}
                      `}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon icon="heroicons:building-library-20-solid" width="20" height="20" />
                        <span>Transfer Bank (Manual)</span>
                      </span>
                      {metode === 'transfer_manual' && <Icon icon="heroicons:check-circle-20-solid" width="20" height="20" className="text-red" />}
                    </button>

                    <button
                      type="button"
                      role="radio"
                      tabIndex={metode === 'midtrans_gateway' ? 0 : -1}
                      aria-checked={metode === 'midtrans_gateway'}
                      onClick={() => setMetode('midtrans_gateway')}
                      onKeyDown={(e) => handleRadioKeyDown(e, 'midtrans_gateway')}
                      className={`
                        w-full min-h-[48px] px-4 py-3 rounded-xl font-bold text-sm text-left flex items-center justify-between border transition-all cursor-pointer
                        ${metode === 'midtrans_gateway' ? 'bg-red-50 text-red border-red shadow-sm' : 'bg-warm-gray/60 text-text border-border hover:bg-warm-gray'}
                      `}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon icon="heroicons:qr-code-20-solid" width="20" height="20" />
                        <span>Pembayaran Otomatis</span>
                      </span>
                      {metode === 'midtrans_gateway' && <Icon icon="heroicons:check-circle-20-solid" width="20" height="20" className="text-red" />}
                    </button>
                  </div>
                </div>

                {metode === 'transfer_manual' && (
                  <FormField label="Unggah Foto Bukti Transfer" id="upload-bukti-transfer-field" required={!previewBukti}>
                    <input
                      id="upload-bukti-transfer-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="upload-bukti-transfer-input"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          document.getElementById('upload-bukti-transfer-input')?.click();
                        }
                      }}
                      className="flex flex-col items-center justify-center gap-2 bg-warm-gray/50 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer text-center min-h-[120px] hover:border-red hover:bg-red-50/20 transition-all active:scale-[0.99]"
                    >
                      <Icon icon="heroicons:arrow-up-tray-20-solid" width="28" height="28" className="text-red" />
                      <span className="text-sm font-bold text-text">
                        {buktiTransfer ? buktiTransfer.name : 'Upload / Ambil Foto Bukti Transfer'}
                      </span>
                      <span className="text-xs text-text-3 font-medium">
                        Format: JPG, PNG, WEBP (Maks 5 MB)
                      </span>
                    </label>
                    {previewBukti && (
                      <div className="mt-2 border border-border rounded-lg p-2 bg-warm-gray/30 flex justify-center">
                        <img 
                          src={previewBukti} 
                          alt="Preview foto bukti transfer" 
                          className="max-h-48 rounded object-contain" 
                        />
                      </div>
                    )}
                  </FormField>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-3 h-13 text-base font-extrabold shadow-md"
                >
                  Tinjau & Konfirmasi Pembayaran
                </Button>
              </Card>
            </form>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card variant="elevated" className="flex flex-col gap-5 p-6 sm:p-7">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <Icon icon="heroicons:information-circle-20-solid" width="24" height="24" className="text-red" />
              <h3 className="text-lg font-extrabold text-text tracking-tight text-balance">Panduan Pembayaran</h3>
            </div>

            {metode === 'transfer_manual' && (
              <div className="flex flex-col gap-4 text-sm text-text">
                <p className="font-semibold text-text-2 text-pretty">Kirimkan dana transfer Anda ke rekening resmi pengelola:</p>
                <Card variant="inset" className="p-4 flex flex-col gap-3">
                  <div>
                    <span className="label-micro text-text-3">Bank Tujuan</span>
                    <div className="font-extrabold text-base text-text mt-0.5">Bank Negara Indonesia (BNI)</div>
                  </div>
                  <div>
                    <span className="label-micro text-text-3">Nomor Rekening Resmi</span>
                    <div className="flex items-center justify-between mt-1 bg-white p-2.5 px-3 rounded-lg border border-border gap-2">
                      <span className="font-tabular-nums font-extrabold text-lg text-red tracking-wider">0811-5901-119</span>
                      <Button
                        variant="primary"
                        size="sm"
                        className="h-9 px-3 text-xs gap-1"
                        onClick={() => {
                          navigator.clipboard.writeText('08115901119');
                          addToast('Nomor rekening berhasil disalin!', 'success');
                        }}
                      >
                        <Icon icon="heroicons:document-duplicate-20-solid" width="14" height="14" />
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {metode === 'midtrans_gateway' && (
              <div className="flex flex-col gap-3 text-sm text-text-2 leading-relaxed">
                <p className="font-bold text-text text-pretty">Keuntungan Pembayaran Otomatis Midtrans:</p>
                <ul className="space-y-2 pl-4 list-disc text-sm">
                  <li>Mendukung QRIS & Virtual Account.</li>
                  <li>Verifikasi otomatis tanpa perlu upload manual.</li>
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BayarSekarang;
