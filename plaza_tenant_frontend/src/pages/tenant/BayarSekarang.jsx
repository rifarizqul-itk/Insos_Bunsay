import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useTransactionDomain } from '../../context/TransactionContext';
import { tenantPort } from '../../api/tenant';
import Icon from '../../components/ui/Icon';
import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import FIFOPreview from '../../components/ui/FIFOPreview';
import { allocatePaymentFIFO } from '../../utils/fifoAllocator';
import { getMidtransSnapToken } from '../../api/transactions';

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function BayarSekarang() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bayarProps, setBayar, addToast } = useUI();
  const { submitTenantPayment } = useTransactionDomain();

  const [metode, setMetode] = useState('transfer_manual'); // 'transfer_manual' | 'midtrans_gateway'
  const [jenisTagihan, setJenisTagihan] = useState(bayarProps.jenis || 'Pelunasan Masa Sewa & Akumulasi Tunggakan');
  const [nominal, setNominal] = useState(bayarProps.nominal || '');
  const [nominalError, setNominalError] = useState(null);
  const [buktiTransfer, setBuktiTransfer] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [fifoAllocations, setFifoAllocations] = useState([]);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    tenantPort.getTunggakan(user?.idPemilik || 1).then(res => {
      if (res && res.tagihanMenunggak) {
        setUnpaidBills(res.tagihanMenunggak);
      }
    }).catch(() => {});

    if (!bayarProps.nominal) {
      tenantPort.getDashboard().then(data => {
        const total = data?.tagihanBerjalan?.totalTagihan;
        if (total && !nominal) {
          setNominal(String(total));
        }
      }).catch(() => {});
    }
  }, [bayarProps.nominal, user?.idPemilik]);

  // Update live FIFO allocation preview whenever nominal or unpaidBills change
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
    const scriptId = 'midtrans-snap-script';
    let scriptSnap = document.getElementById(scriptId);
    if (!scriptSnap) {
      scriptSnap = document.createElement('script');
      scriptSnap.id = scriptId;
      scriptSnap.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      if (MIDTRANS_CLIENT_KEY) {
        scriptSnap.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
      }
      scriptSnap.async = true;
      document.body.appendChild(scriptSnap);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewBukti && previewBukti.startsWith('blob:')) {
        URL.revokeObjectURL(previewBukti);
      }
    };
  }, [previewBukti]);

  // Cleanup preview image when switching payment method
  useEffect(() => {
    if (metode === 'midtrans_gateway' && previewBukti) {
      if (previewBukti.startsWith('blob:')) {
        URL.revokeObjectURL(previewBukti);
      }
      setPreviewBukti(null);
      setBuktiTransfer(null);
    }
  }, [metode, previewBukti]);

  const handleRadioKeyDown = (e, targetMetode) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setMetode(prev => (prev === 'transfer_manual' ? 'midtrans_gateway' : 'transfer_manual'));
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (targetMetode) setMetode(targetMetode);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      addToast('Format file tidak didukung. Mohon unggah foto berformat JPG, PNG, atau WEBP.', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      addToast('Ukuran berkas terlalu besar. Maksimal ukuran foto bukti transfer adalah 5 MB.', 'error');
      e.target.value = '';
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

  const handleProsesPembayaran = async () => {
    const nominalAngka = parseInt(nominal, 10);

    if (metode === 'midtrans_gateway') {
      setIsLoading(true);
      try {
        const orderId = `BUNSAY-${Date.now().toString().slice(-6)}`;
        const snapToken = await getMidtransSnapToken({
          orderId,
          nominal: nominalAngka,
          customerName: user?.name || user?.Username || 'Tenant',
          customerEmail: user?.email || 'tenant@bunsay.id'
        });

        if (window.snap && typeof window.snap.pay === 'function') {
          window.snap.pay(snapToken, {
            onSuccess: async function(result) {
              await submitTenantPayment({
                tenantId: user?.idPemilik || 1,
                jenisTagihan,
                nominal: nominalAngka,
                metode: 'Midtrans'
              });
              setIsLoading(false);
              addToast('Pembayaran Midtrans berhasil! Status Anda langsung Lunas.', 'success');
              navigate('/tenant/histori');
            },
            onPending: async function(result) {
              await submitTenantPayment({
                tenantId: user?.idPemilik || 1,
                jenisTagihan,
                nominal: nominalAngka,
                metode: 'Midtrans'
              });
              setIsLoading(false);
              addToast('Pembayaran Midtrans diproses (Menunggu Pembayaran).', 'info');
              navigate('/tenant/histori');
            },
            onError: function() {
              setIsLoading(false);
              addToast('Pembayaran Midtrans dibatalkan atau gagal.', 'error');
            },
            onClose: function() {
              setIsLoading(false);
            }
          });
        } else {
          await submitTenantPayment({
            tenantId: user?.idPemilik || 1,
            jenisTagihan,
            nominal: nominalAngka,
            metode: 'Midtrans'
          });
          setIsLoading(false);
          addToast('Pembayaran Midtrans instan berhasil! Status Anda langsung Lunas.', 'success');
          navigate('/tenant/histori');
        }
      } catch (err) {
        setIsLoading(false);
        addToast(err?.message || 'Gagal menghasilkan token pembayaran Midtrans.', 'error');
      }
      return;
    }

    // Transfer Bank manual
    setIsLoading(true);
    try {
      const result = await submitTenantPayment({
        tenantId: user?.idPemilik || 1,
        jenisTagihan,
        nominal: nominalAngka,
        metode: 'Transfer',
        berkas: buktiTransfer?.name || 'bukti_transfer.jpg'
      });
      setIsLoading(false);
      if (result && result.success) {
        addToast(result.message || 'Bukti terkirim! Menunggu verifikasi admin.', 'success');
        setBayar('', 'Pelunasan Masa Sewa & Tunggakan');
        setBuktiTransfer(null);
        if (previewBukti && previewBukti.startsWith('blob:')) {
          URL.revokeObjectURL(previewBukti);
        }
        setPreviewBukti(null);
        navigate('/tenant/histori');
      } else {
        addToast(result?.message || 'Gagal mengirimkan bukti transfer.', 'error');
      }
    } catch (_) {
      setIsLoading(false);
      addToast('Gagal memproses pembayaran.', 'error');
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
        {/* Form Pembayaran / Tinjauan */}
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

              {/* Live FIFO Allocation Breakdown */}
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

                {/* Live FIFO Allocation Preview */}
                <FIFOPreview allocations={fifoAllocations} nominal={Number(nominal) || 0} />

                <div className="flex flex-col gap-2 pt-2">
                  <span id="label-metode-pembayaran" className="text-sm font-bold text-text-2">
                    Pilih Metode Pembayaran
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="label-metode-pembayaran"
                    className="flex flex-col gap-2.5"
                  >
                    <button
                      type="button"
                      role="radio"
                      tabIndex={metode === 'transfer_manual' ? 0 : -1}
                      aria-checked={metode === 'transfer_manual'}
                      onClick={() => setMetode('transfer_manual')}
                      onKeyDown={(e) => handleRadioKeyDown(e, 'transfer_manual')}
                      className={`
                        w-full min-h-[48px] px-4 py-3 rounded-xl font-bold text-sm text-left flex items-center justify-between border transition-all cursor-pointer
                        ${metode === 'transfer_manual' 
                          ? 'bg-red-50 text-red border-red shadow-sm' 
                          : 'bg-warm-gray/60 text-text border-border hover:bg-warm-gray'}
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
                        ${metode === 'midtrans_gateway' 
                          ? 'bg-red-50 text-red border-red shadow-sm' 
                          : 'bg-warm-gray/60 text-text border-border hover:bg-warm-gray'}
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
                          alt={buktiTransfer ? `Preview foto bukti transfer: ${buktiTransfer.name}` : 'Preview foto bukti transfer'} 
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

        {/* Panduan Pembayaran */}
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
                  <li>Mendukung QRIS (GoPay, OVO, ShopeePay, Dana, LinkAja) & Virtual Account Bank.</li>
                  <li>Verifikasi otomatis tanpa perlu mengunggah foto bukti transfer manual.</li>
                  <li>Status pembayaran langsung diperbarui secara instan.</li>
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
