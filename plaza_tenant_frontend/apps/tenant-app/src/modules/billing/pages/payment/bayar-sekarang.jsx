import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, FormField, Button, Card, useToast, cn } from '@bunsay/shared-ui';
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

const formatPeriodeIndo = (periodeStr) => {
  if (!periodeStr) return 'Periode Berjalan';
  if (/^\d{4}-\d{2}$/.test(periodeStr)) {
    const [year, monthNum] = periodeStr.split('-');
    const monthIdx = parseInt(monthNum, 10) - 1;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${months[monthIdx] || monthNum} ${year}`;
  }
  return periodeStr;
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
  const initialKiosFilter = location.state?.selectedKios || 'semua';
  const [selectedKiosFilter, setSelectedKiosFilter] = useState(initialKiosFilter);
  const [nominal, setNominal] = useState(() => String(location.state?.nominal ?? location.state?.totalTunggakan ?? ''));
  const [nominalError, setNominalError] = useState(null);
  const [buktiTransfer, setBuktiTransfer] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [isUnpaidLoaded, setIsUnpaidLoaded] = useState(false);
  const [izinkanCicilan, setIzinkanCicilan] = useState(false);
  const [processError, setProcessError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCopiedRekening, setIsCopiedRekening] = useState(false);
  const [isLockedClickAnim, setIsLockedClickAnim] = useState(false);

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
                noKios: t.sewa?.kios?.No_Kios || t.sewa?.No_Kios || '—',
                jenisUsaha: t.sewa?.Jenis_Usaha || '—',
                lantai: t.sewa?.kios?.Lantai ? `Lantai ${t.sewa.kios.Lantai}` : 'Lantai 1',
                tarifSewa: parseFloat(t.Tarif_Sewa || 0),
                totalTagihan,
                sisaTagihan,
                totalTerbayar: Math.max(0, totalTagihan - sisaTagihan),
                statusTagihan: t.Status_Tagihan
              };
            });
          setUnpaidBills(activeUnpaid);

          if (activeUnpaid.length > 0) {
            const targetBills = initialKiosFilter === 'semua'
              ? activeUnpaid
              : activeUnpaid.filter(b => b.noKios === initialKiosFilter);

            const sumTarget = (targetBills.length > 0 ? targetBills : activeUnpaid)
              .reduce((sum, b) => sum + (b.sisaTagihan ?? b.totalTagihan), 0);

            if (location.state?.nominal) {
              setNominal(String(location.state.nominal));
            } else if (sumTarget > 0) {
              setNominal(String(sumTarget));
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
  }, [httpClient, initialKiosFilter]);

  const availableKiosks = useMemo(() => {
    const map = new Map();
    unpaidBills.forEach(b => {
      if (b.noKios && b.noKios !== '—') {
        const existing = map.get(b.noKios) || { noKios: b.noKios, jenisUsaha: b.jenisUsaha, totalUnpaid: 0, count: 0 };
        existing.totalUnpaid += (b.sisaTagihan ?? b.totalTagihan);
        existing.count += 1;
        map.set(b.noKios, existing);
      }
    });
    return Array.from(map.values());
  }, [unpaidBills]);

  const displayedUnpaidBills = useMemo(() => {
    if (selectedKiosFilter === 'semua') return unpaidBills;
    const filtered = unpaidBills.filter(b => b.noKios === selectedKiosFilter);
    return filtered.length > 0 ? filtered : unpaidBills;
  }, [unpaidBills, selectedKiosFilter]);

  const totalKewajiban = useMemo(() => {
    return displayedUnpaidBills.reduce((sum, b) => sum + (b.sisaTagihan ?? b.totalTagihan), 0);
  }, [displayedUnpaidBills]);

  const handleSelectKiosFilter = (kiosKey) => {
    setSelectedKiosFilter(kiosKey);
    const targetBills = kiosKey === 'semua' ? unpaidBills : unpaidBills.filter(b => b.noKios === kiosKey);
    const total = (targetBills.length > 0 ? targetBills : unpaidBills)
      .reduce((sum, b) => sum + (b.sisaTagihan ?? b.totalTagihan), 0);
    setNominal(String(total));
    setNominalError(null);
  };

  const fifoAllocations = useMemo(() => {
    const nominalNum = Number(nominal) || 0;
    if (nominalNum > 0 && displayedUnpaidBills.length > 0) {
      const activeUnpaid = displayedUnpaidBills.filter(b => b.statusTagihan !== 'Lunas');
      return allocatePaymentFIFO(activeUnpaid, nominalNum).allocations;
    }
    return [];
  }, [nominal, displayedUnpaidBills]);

  useEffect(() => {
    return () => {
      if (previewBukti && previewBukti.startsWith('blob:')) {
        URL.revokeObjectURL(previewBukti);
      }
    };
  }, [previewBukti]);

  const processFile = (file) => {
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

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewBukti && previewBukti.startsWith('blob:')) {
      URL.revokeObjectURL(previewBukti);
    }
    setBuktiTransfer(null);
    setPreviewBukti(null);
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleProsesPembayaran = async (e) => {
    if (e) e.preventDefault();

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

    setIsLoading(true);
    setProcessError(null);

    try {
      const targetTagihanId = displayedUnpaidBills[0]?.idTagihan || unpaidBills[0]?.idTagihan || 1;
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
        addToast('Bukti transfer berhasil dikirim! Menunggu verifikasi admin.', 'success');
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
              addToast('Pembayaran Midtrans Berhasil! Status tagihan telah lunas.', 'success');
              navigate('/tenant/histori');
            } catch (postErr) {
              console.error('Error confirming midtrans payment:', postErr);
              addToast('Pembayaran selesai. Mengalihkan ke riwayat...', 'info');
              navigate('/tenant/histori');
            }
          },
          onPending: () => {
            addToast('Transaksi dibuat. Silakan selesaikan pembayaran sesuai instruksi Midtrans.', 'info');
          },
          onError: () => {
            addToast('Pembayaran Midtrans dibatalkan atau gagal.', 'error');
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
    <div data-slot="bayar-sekarang" className="page-fade-in flex flex-col gap-6 font-sans max-w-6xl mx-auto w-full">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1 border-b border-border/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
          Pembayaran Sewa Kios
        </h1>
      </div>

      {/* Main Content */}
      {!isUnpaidLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-pulse">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-border/80 h-96" />
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-border/80 h-80" />
        </div>
      ) : unpaidBills.length === 0 ? (
        <Card variant="elevated" className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border-emerald-200 bg-emerald-50/40 rounded-3xl max-w-xl mx-auto w-full my-6">
          <div className="size-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600 shadow-inner">
            <Icon icon="heroicons:check-circle-20-solid" className="size-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight mb-2">
            Semua Tagihan Lunas
          </h2>
          <p className="text-text-2 text-xs sm:text-sm font-medium max-w-sm mb-6 leading-relaxed">
            Tidak ada tagihan sewa kios yang perlu dibayar saat ini. Terima kasih telah membayar tepat waktu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/tenant/dashboard')}
              className="w-full sm:w-auto font-extrabold shadow-sm bg-emerald-600 hover:bg-emerald-700 h-10 text-xs px-6 whitespace-nowrap"
            >
              Buka Dashboard
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/tenant/histori')}
              className="w-full sm:w-auto font-extrabold h-10 text-xs px-6 whitespace-nowrap"
            >
              Lihat Riwayat
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleProsesPembayaran} className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          
          {/* KOLOM KIRI: FORMULIR PEMBAYARAN */}
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            <div className="bg-white rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
              
              {/* Multi-Kiosk Filter (Jika punya > 1 kios) */}
              {availableKiosks.length > 1 && (
                <div className="flex flex-col gap-1.5 pb-2.5 border-b border-border/80">
                  <span className="text-[11px] font-bold text-text-3 uppercase">
                    Pilih Unit Kios:
                  </span>
                  
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectKiosFilter('semua')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                        selectedKiosFilter === 'semua'
                          ? "bg-red text-white shadow-xs"
                          : "bg-mono-100 text-text-2 hover:bg-mono-200/80"
                      )}
                    >
                      Semua Kios ({availableKiosks.length})
                    </button>
                    {availableKiosks.map((k) => (
                      <button
                        key={k.noKios}
                        type="button"
                        onClick={() => handleSelectKiosFilter(k.noKios)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1",
                          selectedKiosFilter === k.noKios
                            ? "bg-red text-white shadow-xs"
                            : "bg-mono-100 text-text-2 hover:bg-mono-200/80"
                        )}
                      >
                        <span>Kios {k.noKios}</span>
                        <span className="text-[11px] opacity-80">({k.jenisUsaha})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pilihan Metode Bayar (Segmented Tabs) */}
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-bold text-text">
                  Metode Pembayaran
                </span>

                <div className="grid grid-cols-2 p-0.5 bg-mono-100 rounded-xl border border-border/80 gap-1" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={metode === 'transfer_manual'}
                    onClick={() => setMetode('transfer_manual')}
                    className={cn(
                      "py-1.5 px-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                      metode === 'transfer_manual'
                        ? "bg-white text-red shadow-xs border border-border/80"
                        : "text-text-2 hover:text-text"
                    )}
                  >
                    <Icon icon="heroicons:building-library-20-solid" className="size-4 shrink-0" />
                    <span>Transfer Bank</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={metode === 'midtrans_gateway'}
                    onClick={() => setMetode('midtrans_gateway')}
                    className={cn(
                      "py-1.5 px-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                      metode === 'midtrans_gateway'
                        ? "bg-white text-red shadow-xs border border-border/80"
                        : "text-text-2 hover:text-text"
                    )}
                  >
                    <Icon icon="heroicons:qr-code-20-solid" className="size-4 shrink-0" />
                    <span>Pembayaran Online</span>
                  </button>
                </div>
              </div>

              {/* Konten Sesuai Metode */}
              {metode === 'transfer_manual' ? (
                <div className="flex flex-col gap-3 page-fade-in">
                  {/* Kartu Rekening Bersih (1x Saja) */}
                  <div className="p-3 bg-mono-50/80 border border-border/80 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-text-3 font-medium block">Transfer ke Bank BPD Kaltimtara:</span>
                      <div className="text-base sm:text-lg font-mono font-bold text-red font-tabular-nums mt-0.5 select-all">
                        08115901119
                      </div>
                      <span className="text-[11px] text-text-2 font-semibold block mt-0.5">
                        a.n. UPTD PASAR KEBUN SAYUR
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className={cn(
                        "gap-1 px-2.5 py-1 text-xs font-semibold shadow-xs border-border shrink-0 transition-all",
                        isCopiedRekening ? "border-green bg-green-50 text-green" : "hover:border-red hover:text-red"
                      )}
                      onClick={() => {
                        navigator.clipboard.writeText('08115901119');
                        setIsCopiedRekening(true);
                        addToast('Nomor rekening berhasil disalin', 'success');
                        setTimeout(() => setIsCopiedRekening(false), 2000);
                      }}
                      aria-label="Salin nomor rekening Bankaltimtara"
                    >
                      <Icon
                        icon={isCopiedRekening ? "heroicons:check-20-solid" : "heroicons:document-duplicate-20-solid"}
                        className={cn("size-3.5", isCopiedRekening ? "text-green font-bold" : "text-red")}
                      />
                      <span>{isCopiedRekening ? 'Tersalin!' : 'Salin'}</span>
                    </Button>
                  </div>

                  {/* Dropzone Bukti Transfer */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs sm:text-sm font-extrabold text-text">
                      Unggah Bukti Transfer <span className="text-red">*</span>
                    </span>

                    {!previewBukti ? (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-red focus-within:border-red",
                          isDragOver ? "border-red bg-red-50/50" : "border-border/80 hover:border-red/60 bg-mono-50/40"
                        )}
                        onClick={() => document.getElementById('file-upload-input')?.click()}
                      >
                        <input
                          id="file-upload-input"
                          type="file"
                          accept="image/*"
                          aria-label="Unggah foto bukti transfer bank"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        <div className="size-9 rounded-lg bg-white border border-border/80 flex items-center justify-center text-text-3 group-hover:text-red shadow-2xs">
                          <Icon icon="heroicons:arrow-up-tray-20-solid" className="size-4" />
                        </div>
                        <p className="text-xs font-bold text-text">
                          <span className="text-red hover:underline">Pilih foto</span> atau tarik file ke sini
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-mono-50 border border-border/80 rounded-xl flex items-center gap-3 shadow-2xs">
                        <img
                          src={previewBukti}
                          alt="Preview Bukti"
                          className="size-12 rounded-lg object-cover border border-border/80 shrink-0 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-text truncate">
                            {buktiTransfer?.name || 'Bukti_Transfer.jpg'}
                          </p>
                          <p className="text-2xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                            <Icon icon="heroicons:check-circle-20-solid" className="size-3.5" />
                            <span>Foto siap dikirim</span>
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-text-3 hover:text-red p-1.5 shrink-0 rounded-lg"
                          aria-label="Hapus file"
                        >
                          <Icon icon="heroicons:trash-20-solid" className="size-4.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex flex-col gap-2.5 page-fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Icon icon="heroicons:bolt-20-solid" className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="text-emerald-950 font-bold text-xs sm:text-[13px] block">
                        Pembayaran Instan
                      </strong>
                      <span className="text-[11.5px] text-emerald-800 font-medium block mt-0.5">
                        Otomatis lunas 24 jam &bull; Tanpa perlu unggah struk
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-lg font-semibold shadow-2xs">
                      <Icon icon="heroicons:qr-code-20-solid" className="size-3.5 text-emerald-600 shrink-0" />
                      <span>QRIS (GoPay, OVO, ShopeePay, DANA)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-lg font-semibold shadow-2xs">
                      <Icon icon="heroicons:building-library-20-solid" className="size-3.5 text-emerald-600 shrink-0" />
                      <span>Virtual Account Bank</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-lg font-semibold shadow-2xs">
                      <Icon icon="heroicons:building-storefront-20-solid" className="size-3.5 text-emerald-600 shrink-0" />
                      <span>Alfamart / Indomaret</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Input Nominal */}
              <div className="flex flex-col gap-1">
                <FormField 
                  label={
                    <span className="font-extrabold text-xs sm:text-sm text-text">
                      Nominal yang Dibayar (Rp)
                    </span>
                  } 
                  id="input-nominal-pembayaran" 
                  error={nominalError}
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-3 font-black text-sm">
                      Rp
                    </div>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="750.000" 
                      value={formatRibuanDot(nominal)} 
                      readOnly={!izinkanCicilan}
                      onClick={() => {
                        if (!izinkanCicilan) {
                          setIsLockedClickAnim(true);
                          addToast('Nominal terkunci sesuai tagihan penuh. Izin cicilan belum aktif.', 'info');
                          setTimeout(() => setIsLockedClickAnim(false), 1200);
                        }
                      }}
                      onChange={(e) => { 
                        if (izinkanCicilan) {
                          const cleanDigits = e.target.value.replace(/\D/g, '');
                          setNominal(cleanDigits); 
                          if (nominalError) setNominalError(null); 
                        }
                      }} 
                      className={cn(
                        'w-full h-10.5 rounded-xl border pl-10 text-base font-extrabold font-tabular-nums transition-[border-color,box-shadow,background-color] duration-150 ease-out',
                        !izinkanCicilan 
                          ? 'bg-mono-100/70 text-text pr-10 cursor-not-allowed select-none' 
                          : 'bg-white text-text pr-4 focus:border-red',
                        isLockedClickAnim ? 'border-amber-400 ring-2 ring-amber-200/60 bg-amber-50/40' : 'border-border'
                      )}
                    />
                    {!izinkanCicilan && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-mono-400" title="Nominal terkunci (Wajib lunas penuh)">
                        <Icon icon="heroicons:lock-closed-20-solid" className="size-4.5" />
                      </div>
                    )}
                  </div>
                  {!izinkanCicilan && (
                    <p className="text-[11.5px] text-text-3 font-medium flex items-center gap-1 mt-1">
                      <span>Nominal terkunci otomatis sesuai total kewajiban</span>
                    </p>
                  )}
                </FormField>
              </div>

              {/* Error Box */}
              {processError && (
                <div className="bg-red-50 border border-red/30 rounded-xl p-3 flex items-start gap-2 text-xs text-red font-medium">
                  <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-4 shrink-0 mt-0.5 text-red" />
                  <span>{processError}</span>
                </div>
              )}

              {/* Tombol Bayar Sekarang */}
              <div className="pt-0.5">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading || !isUnpaidLoaded}
                  className="w-full h-10.5 text-sm font-bold shadow-xs rounded-xl cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin size-4" />
                      <span>Memproses...</span>
                    </span>
                  ) : (
                    <span>Bayar Sekarang</span>
                  )}
                </Button>
              </div>

            </div>
          </div>

          {/* KOLOM KANAN: KARTU ALOKASI PEMBAYARAN */}
          <div className="lg:col-span-5 flex flex-col gap-3 order-first lg:order-last lg:sticky lg:top-24">
            
            <div className="bg-white rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-text text-balance">
                    Rencana Pelunasan
                  </h2>
                  <span className="text-xs text-text-3">
                    Total Tagihan: <strong className="text-text font-tabular-nums">Rp {totalKewajiban.toLocaleString('id-ID')}</strong>
                  </span>
                </div>
                {displayedUnpaidBills.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-mono-100 text-text-2 font-tabular-nums shrink-0">
                    {displayedUnpaidBills.length} Periode
                  </span>
                )}
              </div>

              {/* Total yang Sedang Diinput (Nominal di Bawah Teks) */}
              <div className="flex flex-col gap-1 pb-3 border-b border-border/80">
                <span className="text-xs sm:text-sm font-semibold text-text-2">
                  Nominal Disetor:
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-tabular-nums text-red">
                  Rp {Number(nominal || 0).toLocaleString('id-ID')}
                </div>
              </div>

              {/* Rincian Alokasi Live (List dengan Divider Rapi, Tanpa Kotak-Kotak Bertumpuk) */}
              {fifoAllocations.length > 0 ? (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-3">
                      Alokasi Pembayaran:
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/tenant/tagihan')}
                      className="text-xs font-bold text-red hover:underline inline-flex items-center gap-1 cursor-pointer min-h-0 h-auto py-0"
                    >
                      <span>Lihat Rincian</span>
                      <Icon icon="heroicons:arrow-top-right-on-square-20-solid" className="size-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-border/80">
                    {fifoAllocations.map((alloc) => {
                      const status = alloc.statusAkhir || alloc.status || 'Belum Lunas';
                      const amount = Number(alloc.nominalTeralokasi ?? alloc.allocated ?? 0);
                      const isLunas = status === 'Lunas';
                      const sisaBulan = Number(alloc.sisaTagihan ?? 0);
                      return (
                        <div 
                          key={alloc.idTagihan || alloc.periode} 
                          className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between text-xs gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-text block truncate">
                              Sewa {formatPeriodeIndo(alloc.periode)}
                            </span>
                            <div className="text-[11.5px] text-text-3 flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span>Alokasi: <strong className="text-text font-tabular-nums">Rp {amount.toLocaleString('id-ID')}</strong></span>
                              {sisaBulan > 0 && (
                                <>
                                  <span className="text-mono-300">•</span>
                                  <span>Sisa: <strong className="text-red font-tabular-nums">Rp {sisaBulan.toLocaleString('id-ID')}</strong></span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className={cn(
                            "font-bold text-xs px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0",
                            isLunas ? 'bg-green-bg/85 border-green/25 text-green' : 'bg-orange-bg/85 border-orange/25 text-orange'
                          )}>
                            {isLunas ? 'Lunas' : 'Dicicil'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sisa Kewajiban Setelah Bayar */}
                  <div className="pt-2.5 border-t border-dashed border-border/80 flex justify-between items-center text-xs">
                    <span className="text-text-3 font-medium">Sisa utang setelah pembayaran:</span>
                    <span className="font-extrabold font-tabular-nums text-text text-sm">
                      Rp {Math.max(0, totalKewajiban - (Number(nominal) || 0)).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-4 px-3 text-center flex flex-col items-center gap-2 text-xs text-text-3">
                  <Icon icon="heroicons:calculator-20-solid" className="size-5 text-mono-400" />
                  <span>Ketik nominal pembayaran di samping untuk melihat simulasi pelunasan bulan sewa.</span>
                </div>
              )}

              {/* Bantuan / Izin Cicilan via WhatsApp (Responsive Micro Footer) */}
              <div className="pt-2.5 border-t border-border/80 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
                <span className="text-text-3 font-medium">
                  Izin cicilan sewa?
                </span>
                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent('Halo Pengelola Plaza Kebun Sayur, saya tenant ingin berkonsultasi mengenai pengajuan pembayaran cicilan sewa kios.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
                >
                  <Icon icon="heroicons:chat-bubble-left-right-20-solid" className="size-4 shrink-0" />
                  <span>Hubungi Pengelola (WA)</span>
                </a>
              </div>

            </div>

          </div>
        </form>
      )}
    </div>
  );
}

export default BayarSekarang;
