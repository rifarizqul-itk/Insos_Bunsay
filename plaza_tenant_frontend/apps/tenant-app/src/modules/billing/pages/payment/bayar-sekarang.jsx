import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, FormField, Button, Card, FIFOPreview, Badge, useToast, cn } from '@bunsay/shared-ui';
import { allocatePaymentFIFO } from '@bunsay/shared-core';
import { useTenantAuth } from '../../../public/useTenantAuth';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const formatRibuanDot = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const cleanDigits = String(val).replace(/\D/g, '');
  if (!cleanDigits) return '';
  return Number(cleanDigits).toLocaleString('id-ID');
};

const loadSnapScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.snap) {
      resolve(window.snap);
      return;
    }
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
    const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
    const scriptUrl = isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const existingScript = document.querySelector(`script[src*="snap/snap.js"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.snap));
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    if (clientKey) {
      script.setAttribute('data-client-key', clientKey);
    }
    script.async = true;
    script.onload = () => resolve(window.snap);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
};

function BayarSekarang() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { httpClient } = useTenantAuth();
  
  const [metode, setMetode] = useState('transfer_manual');
  const [nominal, setNominal] = useState(() => String(location.state?.nominal ?? location.state?.totalTunggakan ?? ''));
  const [nominalError, setNominalError] = useState(null);
  const [buktiTransfer, setBuktiTransfer] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [isUnpaidLoaded, setIsUnpaidLoaded] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [izinkanCicilan, setIzinkanCicilan] = useState(false);
  const [processError, setProcessError] = useState(null);

  useEffect(() => {
    const fetchUnpaidBills = async () => {
      try {
        const dashRes = await httpClient.get('/api/v1/tenant/dashboard');
        const idPemilik = dashRes.data?.idPemilik;
        const isAllowedCicil = Boolean(dashRes.data?.izinkanCicilan);
        setIzinkanCicilan(isAllowedCicil);

        if (idPemilik) {
          const tagihanRes = await httpClient.get('/api/v1/tenant/tagihan');
          const tagihan = Array.isArray(tagihanRes.data) ? tagihanRes.data : [];

          const activeUnpaid = tagihan
            .filter(t => t.Status_Tagihan !== 'Lunas')
            .map(t => {
              const totalTagihan = parseFloat(t.Total_Tagihan || 0);
              const sisaTagihan = parseFloat(t.Sisa_Tagihan ?? totalTagihan);
              return {
                idTagihan: t.Id_Tagihan,
                periode: t.Periode,
                tarifSewa: parseFloat(t.Tarif_Sewa || 0),
                totalTagihan,
                totalTerbayar: Math.max(0, totalTagihan - sisaTagihan),
                statusTagihan: t.Status_Tagihan
              };
            });
          setUnpaidBills(activeUnpaid);

          if (!isAllowedCicil && activeUnpaid.length > 0) {
            const sumUnpaid = activeUnpaid.reduce((sum, b) => sum + Math.max(0, b.totalTagihan - b.totalTerbayar), 0);
            if (sumUnpaid > 0) {
              setNominal(String(sumUnpaid));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching unpaid bills:', err);
      } finally {
        setIsUnpaidLoaded(true);
      }
    };

    fetchUnpaidBills();
  }, [httpClient]);

  const fifoAllocations = useMemo(() => {
    const nominalNum = Number(nominal) || 0;
    if (nominalNum > 0 && unpaidBills.length > 0) {
      const activeUnpaid = unpaidBills.filter(b => b.statusTagihan !== 'Lunas');
      return allocatePaymentFIFO(activeUnpaid, nominalNum).allocations;
    }
    return [];
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
    setProcessError(null);
    try {
      const targetTagihanId = unpaidBills[0]?.idTagihan || 1;
      const todayStr = new Date().toISOString().split('T')[0];

      if (metode === 'transfer_manual') {
        const base64Bukti = buktiTransfer ? await fileToBase64(buktiTransfer) : null;
        const payload = {
          Id_Tagihan: targetTagihanId,
          Tanggal_Bayar: todayStr,
          Total_Bayar: Number(nominal),
          Metode_Bayar: 'Transfer',
          Bukti_Pembayaran: base64Bukti || (buktiTransfer?.name ?? '-'),
          Verifikasi_Pembayaran: 'Menunggu'
        };

        await httpClient.post('/api/v1/tenant/pembayaran', payload);
        setIsLoading(false);
        addToast('Bukti pembayaran terkirim! Menunggu verifikasi admin.', 'success');
        navigate('/tenant/histori');
        return;
      }

      const tokenRes = await httpClient.post('/api/v1/tenant/midtrans/token', {
        Id_Tagihan: targetTagihanId,
        nominal: Number(nominal),
      });

      const snapToken = tokenRes.data?.token;
      if (!snapToken) {
        throw new Error(tokenRes.data?.message || 'Gagal memperoleh Snap Token dari Midtrans Gateway.');
      }

      setIsLoading(false);
      setShowReview(false);

      const snapInstance = window.snap || (await loadSnapScript());

      if (snapInstance && typeof snapInstance.pay === 'function') {
        snapInstance.pay(snapToken, {
          onSuccess: async (result) => {
            try {
              const confirmPayload = {
                Id_Tagihan: targetTagihanId,
                Tanggal_Bayar: todayStr,
                Total_Bayar: Number(nominal),
                Metode_Bayar: 'Midtrans',
                Bukti_Pembayaran: result?.transaction_id || result?.order_id || `MIDTRANS-${Date.now()}`,
                Verifikasi_Pembayaran: 'Diterima',
                payment_type: result?.payment_type,
                bank: result?.va_numbers?.[0]?.bank || (result?.permata_va_number ? 'permata' : (result?.payment_type === 'echannel' ? 'mandiri' : null)),
                issuer: result?.issuer || result?.acquirer,
                va_numbers: result?.va_numbers
              };

              await httpClient.post('/api/v1/tenant/pembayaran', confirmPayload);
              addToast('Pembayaran Midtrans Berhasil! Tagihan sewa kios telah diperbarui.', 'success');
              navigate('/tenant/histori');
            } catch (postErr) {
              console.error('Error confirming midtrans payment:', postErr);
              addToast('Pembayaran selesai. Mengalihkan ke halaman riwayat...', 'info');
              navigate('/tenant/histori');
            }
          },
          onPending: () => {
            addToast('Transaksi dibuat. Silakan selesaikan pembayaran sesuai panduan Midtrans.', 'info');
          },
          onError: () => {
            addToast('Pembayaran Midtrans gagal atau dibatalkan.', 'error');
          },
          onClose: () => {
            addToast('Popup pembayaran Midtrans ditutup.', 'info');
          }
        });
      } else {
        if (tokenRes.data?.redirect_url) {
          window.location.href = tokenRes.data.redirect_url;
        } else {
          throw new Error('Midtrans Snap SDK tidak termuat di browser. Periksa koneksi internet Anda.');
        }
      }

    } catch (err) {
      setIsLoading(false);
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal memproses pembayaran.';
      setProcessError(errMsg);
      addToast(errMsg, 'error');
    }
  };

  return (
    <div data-slot="bayar-sekarang" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
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
          {!isUnpaidLoaded ? (
            <Card variant="elevated" className="flex flex-col gap-4 p-6 sm:p-7 animate-pulse">
              <div className="h-5 w-40 bg-mono-200/60 rounded-md" />
              <div className="h-11 w-full bg-mono-200/40 rounded-md" />
              <div className="h-20 w-full bg-mono-200/40 rounded-xl" />
              <div className="h-12 w-full bg-mono-200/60 rounded-md mt-2" />
            </Card>
          ) : unpaidBills.length === 0 ? (
            <Card variant="elevated" className="flex flex-col items-center justify-center text-center p-8 sm:p-10 page-fade-in border-emerald-200 bg-emerald-50/40">
              <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600 shadow-inner">
                <Icon icon="heroicons:check-circle-20-solid" width="40" height="40" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight text-balance mb-2">
                Semua Tagihan Sewa Anda Sudah Lunas!
              </h2>
              <p className="text-text-2 text-sm sm:text-base font-medium max-w-md mb-6 leading-relaxed">
                Tidak ada tagihan atau tunggakan sewa kios yang perlu dibayar saat ini. Terima kasih telah melakukan pembayaran tepat waktu!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/tenant/dashboard')}
                  className="font-extrabold shadow-sm bg-green hover:bg-green/90 h-11"
                >
                  Kembali ke Dashboard
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/tenant/histori')}
                  className="font-extrabold h-11"
                >
                  Lihat Histori Pembayaran
                </Button>
              </div>
            </Card>
          ) : showReview ? (
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

              <div className="p-4 bg-mono-100/60 border border-border/80 rounded-lg flex flex-col gap-2.5 text-sm">
                <div><span className="text-text-3 font-semibold">Nominal Pembayaran:</span> <strong className="text-text font-bold font-tabular-nums text-base text-red">Rp {parseInt(nominal, 10).toLocaleString('id-ID')}</strong></div>
                <div><span className="text-text-3 font-semibold">Metode Pembayaran:</span> <strong className="text-text font-bold">{metode === 'transfer_manual' ? 'Transfer Bank (Manual)' : 'Pembayaran Otomatis Midtrans'}</strong></div>
                {metode === 'transfer_manual' && buktiTransfer && (
                  <div><span className="text-text-3 font-semibold">Lampiran Bukti:</span> <strong className="text-text font-bold">{buktiTransfer.name}</strong></div>
                )}
              </div>

              <FIFOPreview allocations={fifoAllocations} nominal={Number(nominal) || 0} />

              {processError && (
                <div className="bg-red-50 border border-red/30 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm text-red font-medium leading-relaxed">
                  <Icon icon="heroicons:exclamation-triangle" width="22" height="22" className="shrink-0 mt-0.5 text-red" />
                  <div className="flex flex-col gap-1.5">
                    <strong className="font-extrabold text-sm text-red">Gagal Menghubungi Midtrans Gateway:</strong>
                    <span className="text-text font-semibold">{processError}</span>
                    {processError.includes('Access denied') && (
                      <div className="mt-1 p-2.5 bg-white/80 border border-red/20 rounded-lg text-xs text-text-2 space-y-1">
                        <p className="font-bold text-red">⚠️ Kunci API Midtrans Sandbox Anda belum sesuai:</p>
                        <p>1. Buka <strong>dashboard.sandbox.midtrans.com</strong> &rarr; <em>Settings</em> &rarr; <em>Access Keys</em>.</p>
                        <p>2. Salin <strong>Server Key</strong> ke <code>plaza_tenant_backend/.env</code> (<code>MIDTRANS_SERVER_KEY=SB-Mid-server-...</code>).</p>
                        <p>3. Salin <strong>Client Key</strong> ke <code>plaza_tenant_frontend/.env</code> (<code>VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-...</code>).</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                {/* Banner Izin Cicil via WhatsApp */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 text-sm">
                  <div className="flex items-start gap-2.5">
                    <Icon icon="heroicons:information-circle-20-solid" width="22" height="22" className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-amber-900">Ingin Mengajukan Pembayaran Cicilan?</div>
                      <p className="text-xs text-amber-800 font-medium mt-0.5 leading-relaxed">
                        Pembayaran standar disarankan <strong>Lunas</strong>. Jika Anda ingin mencicil, Anda <strong>wajib berdiskusi &amp; meminta izin Pengelola Bunsay</strong> via WhatsApp sebelum mentransfer.
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent('Halo Pengelola Plaza Kebun Sayur, saya tenant ingin berkonsultasi dan mengajukan izin pembayaran cicilan sewa kios.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-sm transition-colors cursor-pointer"
                  >
                    <Icon icon="heroicons:chat-bubble-left-right-20-solid" width="16" height="16" />
                    <span>Hubungi Pengelola (WA)</span>
                  </a>
                </div>

                <FormField 
                  label={
                    <span className="flex items-center justify-between w-full">
                      <span className="inline-flex items-center gap-1 font-bold text-text-2">
                        <span>Nominal Pembayaran (Rp)</span>
                        <span className="text-red font-bold" aria-hidden="true">*</span>
                      </span>
                      {!izinkanCicilan ? (
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                          <Icon icon="heroicons:lock-closed-20-solid" className="size-3.5" />
                          <span>Wajib Pelunasan Full</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                          <Icon icon="heroicons:check-circle-20-solid" className="size-3.5" />
                          <span>Cicilan Diizinkan</span>
                        </span>
                      )}
                    </span>
                  } 
                  id="input-nominal-pembayaran" 
                  error={nominalError}
                >
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Contoh: 750.000" 
                    value={formatRibuanDot(nominal)} 
                    readOnly={!izinkanCicilan}
                    onChange={(e) => { 
                      if (izinkanCicilan) {
                        const cleanDigits = e.target.value.replace(/\D/g, '');
                        setNominal(cleanDigits); 
                        if (nominalError) setNominalError(null); 
                      }
                    }} 
                    className={cn(
                      'w-full h-11 rounded-md border border-border px-3.5 text-base font-bold font-tabular-nums transition-colors',
                      !izinkanCicilan ? 'bg-amber-50/40 cursor-not-allowed text-text-2' : 'bg-mono-100/50 text-text focus:bg-white'
                    )}
                  />
                  {!izinkanCicilan && (
                    <p className="text-xs text-text-3 font-medium mt-1">
                      Nominal otomatis dikunci pada tagihan lunas. Hubungi Pengelola via WA untuk membuka izin cicilan.
                    </p>
                  )}
                </FormField>

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
                      className={cn(
                        'w-full min-h-12 px-4 py-3 rounded-xl font-bold text-sm text-start flex items-center justify-between border transition-all cursor-pointer',
                        metode === 'transfer_manual' ? 'bg-red-50 text-red border-red shadow-sm' : 'bg-mono-100/60 text-text border-border hover:bg-mono-100'
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon icon="heroicons:building-library-20-solid" className="size-5" />
                        <span>Transfer Bank (Manual)</span>
                      </span>
                      {metode === 'transfer_manual' && <Icon icon="heroicons:check-circle-20-solid" className="size-5 text-red" />}
                    </button>

                    <button
                      type="button"
                      role="radio"
                      tabIndex={metode === 'midtrans_gateway' ? 0 : -1}
                      aria-checked={metode === 'midtrans_gateway'}
                      onClick={() => setMetode('midtrans_gateway')}
                      onKeyDown={(e) => handleRadioKeyDown(e, 'midtrans_gateway')}
                      className={cn(
                        'w-full min-h-12 px-4 py-3 rounded-xl font-bold text-sm text-start flex items-center justify-between border transition-all cursor-pointer',
                        metode === 'midtrans_gateway' ? 'bg-red-50 text-red border-red shadow-sm' : 'bg-mono-100/60 text-text border-border hover:bg-mono-100'
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon icon="heroicons:qr-code-20-solid" className="size-5" />
                        <span>Pembayaran Otomatis</span>
                      </span>
                      {metode === 'midtrans_gateway' && <Icon icon="heroicons:check-circle-20-solid" className="size-5 text-red" />}
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
                      className="flex flex-col items-center justify-center gap-2 bg-mono-100/50 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer text-center min-h-28 hover:border-red hover:bg-red-50/20 transition-all active:scale-[0.99]"
                    >
                      <Icon icon="heroicons:arrow-up-tray-20-solid" className="size-7 text-red" />
                      <span className="text-sm font-bold text-text">
                        {buktiTransfer ? buktiTransfer.name : 'Upload / Ambil Foto Bukti Transfer'}
                      </span>
                      <span className="text-xs text-text-3 font-medium">
                        Format: JPG, PNG, WEBP (Maks 5 MB)
                      </span>
                    </label>
                    {previewBukti && (
                      <div className="mt-2 border border-border rounded-lg p-2 bg-mono-100/30 flex justify-center">
                        <img 
                          src={previewBukti} 
                          alt="Preview foto bukti transfer" 
                          loading="lazy"
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
                  disabled={isLoading || !isUnpaidLoaded}
                  className="w-full h-12 text-base font-extrabold shadow-md mt-2"
                >
                  Tinjau & Lanjutkan Pembayaran
                </Button>
              </Card>
            </form>
          )}
        </div>

        {/* Kolom Kanan: Panduan & Info Rekening */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card variant="elevated" className="p-6 sm:p-7 flex flex-col gap-5 bg-white border border-border shadow-sm rounded-2xl">
            <div className="flex items-center gap-2.5 border-b border-border/80 pb-3.5">
              <div className="size-8 rounded-lg bg-red/10 text-red flex items-center justify-center shrink-0">
                <Icon icon="heroicons:information-circle-20-solid" className="size-5" />
              </div>
              <h2 className="text-base font-extrabold text-text tracking-tight">
                Panduan Pembayaran
              </h2>
            </div>

            {metode === 'transfer_manual' && (
              <div className="flex flex-col gap-4 text-sm text-text-2">
                <p className="font-medium text-pretty leading-relaxed text-text">
                  Silakan transfer sesuai nominal yang Anda tentukan ke nomor rekening resmi pengelola di bawah ini:
                </p>

                {/* Box Rekening BPD Kaltimtara */}
                <div className="p-4 bg-mono-50 border border-border rounded-xl flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="label-micro text-text-3 font-bold">BANK BPD KALTIMTARA</span>
                    <Badge status="Terisi" customText="Rekening Resmi" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[11px] text-text-3 font-medium block">Nomor Rekening Tujuan:</span>
                      <div className="text-xl font-mono font-black text-text tracking-wider mt-0.5">
                        08115901119
                      </div>
                      <div className="text-xs text-text-2 font-bold mt-0.5">a.n. UPTD PASAR KEBUN SAYUR</div>
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 px-3.5 font-bold shadow-2xs border-border hover:border-red hover:text-red"
                        onClick={() => {
                          navigator.clipboard.writeText('08115901119');
                          addToast('Nomor rekening berhasil disalin!', 'success');
                        }}
                      >
                        <Icon icon="heroicons:document-duplicate-20-solid" className="size-3.5 text-red" />
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Langkah-langkah Singkat */}
                <div className="p-3.5 bg-mono-100/50 border border-border/70 rounded-lg flex flex-col gap-2 text-xs">
                  <span className="font-bold text-text flex items-center gap-1.5">
                    <Icon icon="heroicons:check-circle-20-solid" className="size-4 text-emerald-700" />
                    <span>Langkah Pembayaran Manual:</span>
                  </span>
                  <ol className="list-decimal ps-4 space-y-1 text-text-2 font-medium">
                    <li>Lakukan transfer ke rekening di atas via ATM / M-Banking.</li>
                    <li>Simpan atau <i>screenshot</i> bukti transfer yang sah.</li>
                    <li>Unggah foto bukti pada formulir dan klik tombol kirim.</li>
                  </ol>
                </div>
              </div>
            )}

            {metode === 'midtrans_gateway' && (
              <div className="flex flex-col gap-4 text-sm text-text-2 leading-relaxed">
                <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-orange-100 text-orange flex items-center justify-center shrink-0">
                    <Icon icon="heroicons:bolt-20-solid" className="size-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-orange-950 block">Verifikasi Instan 24/7</strong>
                    <span className="text-[11px] text-orange-900 font-medium">Lunas otomatis tanpa perlu menunggu konfirmasi admin.</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <p className="font-bold text-text text-xs">Saluran Pembayaran yang Didukung:</p>
                  <ul className="space-y-2 ps-4 list-disc text-xs text-text-2 font-medium">
                    <li>
                      <strong className="text-text font-bold">QRIS</strong> (GoPay, ShopeePay, DANA, OVO, LinkAja, BCA Mobile, Livin' by Mandiri, BRImo, BNI Mobile).
                    </li>
                    <li>
                      <strong className="text-text font-bold">Virtual Account (Bank Transfer)</strong> (BCA, BNI, BRI, Mandiri Bill Payment, CIMB Niaga, Permata).
                    </li>
                    <li>
                      <strong className="text-text font-bold">E-Wallet Langsung</strong> (GoPay, GoPayLater, ShopeePay, DANA).
                    </li>
                    <li>
                      <strong className="text-text font-bold">Gerai Retail Tunai</strong> (Alfamart, Indomaret).
                    </li>
                    <li>
                      <strong className="text-text font-bold">Kartu Debit & Kredit</strong> (Visa, Mastercard, JCB berlisensi 3-D Secure).
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BayarSekarang;
