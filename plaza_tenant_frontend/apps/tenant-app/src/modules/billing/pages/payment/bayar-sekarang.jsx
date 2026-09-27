import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, FormField, Button, Card, useToast, cn } from '@bunsay/shared-ui';
import { allocatePaymentFIFO, calculateCustomAllocations, validateCustomAllocationSum } from '@bunsay/shared-core';
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

const BANK_OPTIONS = [
  {
    id: 'bni',
    code: 'BNI',
    name: 'Bank Negara Indonesia (BNI)',
    rekDisplay: '7878 007 803',
    rekNumber: '7878007803',
    an: 'UPTD PASAR KEBUN SAYUR',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200/80',
    dotColor: 'bg-orange-500',
  },
  {
    id: 'bca',
    code: 'BCA',
    name: 'Bank Central Asia (BCA)',
    rekDisplay: '781 031 2828',
    rekNumber: '7810312828',
    an: 'UPTD PASAR KEBUN SAYUR',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dotColor: 'bg-blue-600',
  },
  {
    id: 'bsi',
    code: 'BSI',
    name: 'Bank Syariah Indonesia (BSI)',
    rekDisplay: '822 888 2808',
    rekNumber: '8228882808',
    an: 'UPTD PASAR KEBUN SAYUR',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dotColor: 'bg-emerald-600',
  },
];

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
  const [hasTunggakan, setHasTunggakan] = useState(false);
  const [totalDenda, setTotalDenda] = useState(0);
  const [processError, setProcessError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCopiedRekening, setIsCopiedRekening] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState('bni');
  const selectedBank = useMemo(
    () => BANK_OPTIONS.find((b) => b.id === selectedBankId) || BANK_OPTIONS[0],
    [selectedBankId]
  );
  const [isLockedClickAnim, setIsLockedClickAnim] = useState(false);
  const [isQrisZoomed, setIsQrisZoomed] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [step, setStep] = useState(1); // 1: Rencana Alokasi, 2: Metode & Bukti Bayar

  const handleDownloadQris = async () => {
    const qrisUrl = '/assets/QRIS_PLACEHOLDER.jpg';
    const fileName = 'QRIS_UPTD_Plaza_Kebun_Sayur.jpg';
    try {
      const res = await fetch(qrisUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      addToast('Gambar QRIS berhasil diunduh.', 'success');
    } catch {
      const link = document.createElement('a');
      link.href = qrisUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Gambar QRIS berhasil diunduh.', 'success');
    }
  };

  useEffect(() => {
    const fetchUnpaidBills = async () => {
      try {
        const dashRes = await httpClient.get('/api/v1/tenant/dashboard');
        const idPemilik = dashRes.data?.idPemilik;
        const isAllowedCicil = Boolean(dashRes.data?.izinkanCicilan);
        const isOverdue = Boolean(dashRes.data?.hasTunggakan);
        const denda = Number(dashRes.data?.totalDenda || 0);

        setIzinkanCicilan(isAllowedCicil);
        setHasTunggakan(isOverdue);
        setTotalDenda(denda);

        if (idPemilik) {
          const [tagihanRes, pendingRes] = await Promise.all([
            httpClient.get('/api/v1/tenant/tagihan'),
            httpClient.get('/api/v1/tenant/pembayaran?page=1&page_size=20&status=Menunggu').catch(() => null)
          ]);

          const tagihan = Array.isArray(tagihanRes.data) ? tagihanRes.data : [];
          const pendingItems = pendingRes?.data?.data || (Array.isArray(pendingRes?.data) ? pendingRes.data : []);

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
                denda: parseFloat(t.denda || 0),
                totalTerbayar: Math.max(0, totalTagihan - sisaTagihan),
                statusTagihan: t.Status_Tagihan,
                isOverdue: Boolean(t.is_overdue),
              };
            });
          setUnpaidBills(activeUnpaid);

          const isPending = pendingItems.length > 0 || activeUnpaid.some(
            t => t.statusTagihan === 'Menunggu Verifikasi' || t.statusTagihan === 'Menunggu'
          );
          setHasPendingPayment(isPending);

          if (activeUnpaid.length > 0) {
            const targetBills = initialKiosFilter === 'semua'
              ? activeUnpaid
              : activeUnpaid.filter(b => b.noKios === initialKiosFilter);

            const billsToUse = targetBills.length > 0 ? targetBills : activeUnpaid;
            const fullInit = {};
            let sumTarget = 0;
            billsToUse.forEach(b => {
              const sisa = b.sisaTagihan ?? b.totalTagihan;
              fullInit[b.idTagihan] = String(sisa);
              sumTarget += sisa;
            });
            setCustomNominals(fullInit);

            if (location.state?.nominal) {
              const incomingNominal = Number(location.state.nominal);
              setNominal(String(incomingNominal));
              if (incomingNominal < sumTarget) {
                setModePelunasan('cicil');
                const fifoResult = allocatePaymentFIFO(billsToUse, incomingNominal);
                const partialMap = {};
                billsToUse.forEach(b => {
                  const allocItem = fifoResult.allocations.find(a => a.idTagihan === b.idTagihan);
                  partialMap[b.idTagihan] = String(allocItem ? allocItem.nominalTeralokasi : 0);
                });
                setCustomNominals(partialMap);
              }
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
  }, [httpClient, initialKiosFilter, location.state]);

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
    const billsToUse = targetBills.length > 0 ? targetBills : unpaidBills;

    if (modePelunasan === 'lunas') {
      const full = {};
      let total = 0;
      billsToUse.forEach(b => {
        const sisa = b.sisaTagihan ?? b.totalTagihan;
        full[b.idTagihan] = String(sisa);
        total += sisa;
      });
      setCustomNominals(full);
      setNominal(String(total));
    } else {
      const empty = {};
      billsToUse.forEach(b => {
        empty[b.idTagihan] = '0';
      });
      setCustomNominals(empty);
      setNominal('0');
    }
    setNominalError(null);
  };

  const [modePelunasan, setModePelunasan] = useState('lunas'); // 'lunas' | 'cicil'
  const [customNominals, setCustomNominals] = useState({});

  const handleCustomNominalChange = (tagihanId, val, maxNominal) => {
    const cleanDigits = String(val).replace(/\D/g, '');
    let numVal = Number(cleanDigits) || 0;
    if (maxNominal !== undefined && numVal > maxNominal) {
      numVal = maxNominal;
    }
    const updated = {
      ...customNominals,
      [tagihanId]: String(numVal)
    };
    setCustomNominals(updated);

    let totalSum = 0;
    for (const v of Object.values(updated)) {
      totalSum += Number(v) || 0;
    }
    setNominal(String(totalSum));
    if (nominalError) setNominalError(null);

    // Sinkronkan mode Lunas vs Cicil secara otomatis saat nilai diubah
    const isAllFull = displayedUnpaidBills.every(b => {
      const sisa = b.sisaTagihan ?? b.totalTagihan;
      return Number(updated[b.idTagihan] || 0) === sisa;
    });
    if (!isAllFull && modePelunasan === 'lunas') {
      setModePelunasan('cicil');
    } else if (isAllFull && modePelunasan === 'cicil') {
      setModePelunasan('lunas');
    }
  };

  const handleSetFullForTagihan = (tagihanId, maxNominal) => {
    handleCustomNominalChange(tagihanId, String(maxNominal), maxNominal);
  };

  const handleClearForTagihan = (tagihanId) => {
    handleCustomNominalChange(tagihanId, '0');
  };

  const fifoAllocations = useMemo(() => {
    const nominalNum = Number(nominal) || 0;
    if (nominalNum > 0 && displayedUnpaidBills.length > 0) {
      const activeUnpaid = displayedUnpaidBills.filter(b => b.statusTagihan !== 'Lunas');
      return calculateCustomAllocations(activeUnpaid, customNominals).allocations;
    }
    return [];
  }, [nominal, displayedUnpaidBills, customNominals]);

  const handleSwitchToLunas = () => {
    setModePelunasan('lunas');
    const full = {};
    let total = 0;
    displayedUnpaidBills.forEach(b => {
      const sisa = b.sisaTagihan ?? b.totalTagihan;
      full[b.idTagihan] = String(sisa);
      total += sisa;
    });
    setCustomNominals(full);
    setNominal(String(total));
    setNominalError(null);
  };

  const handleSwitchToCicil = () => {
    if (!izinkanCicilan) {
      addToast('Sesuai aturan mitra, cicilan hanya diperkenankan untuk tagihan yang menunggak (melewati jatuh tempo). Tagihan berjalan wajib dibayar lunas.', 'info');
      return;
    }
    setModePelunasan('cicil');
    // Memulai tiap periode nominalnya dari 0 saat memilih opsi cicil
    const empty = {};
    displayedUnpaidBills.forEach(b => {
      empty[b.idTagihan] = '0';
    });
    setCustomNominals(empty);
    setNominal('0');
    setNominalError(null);
  };


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

  const handleKonfirmasiAlokasi = () => {
    const nominalAngka = Number(nominal) || 0;
    if (!nominalAngka || nominalAngka <= 0) {
      setNominalError('Silakan tentukan nominal alokasi pembayaran terlebih dahulu.');
      addToast('Silakan tentukan nominal alokasi pembayaran terlebih dahulu.', 'error');
      return;
    }

    const alokasiList = Object.entries(customNominals)
      .filter(([_, val]) => Number(val) > 0);

    if (alokasiList.length === 0) {
      addToast('Silakan tentukan nominal pembayaran pada minimal satu periode tagihan.', 'error');
      return;
    }

    const sumAlokasi = alokasiList.reduce((sum, [_, val]) => sum + Number(val), 0);
    if (sumAlokasi !== nominalAngka) {
      addToast(`Total alokasi (Rp ${sumAlokasi.toLocaleString('id-ID')}) harus sama dengan Total Pembayaran.`, 'error');
      return;
    }

    setNominalError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProsesPembayaran = async (e) => {
    if (e) e.preventDefault();

    const nominalAngka = parseInt(nominal, 10);
    if (!nominalAngka || nominalAngka <= 0) {
      setNominalError('Masukkan nominal pembayaran yang valid.');
      addToast('Masukkan nominal pembayaran yang valid.', 'error');
      return;
    }

    if (metode !== 'tunai' && !buktiTransfer) {
      addToast(
        metode === 'qris'
          ? 'Mohon unggah tangkapan layar bukti pembayaran QRIS terlebih dahulu.'
          : 'Mohon unggah foto bukti transfer terlebih dahulu.',
        'error'
      );
      return;
    }

    setIsLoading(true);
    setProcessError(null);

    try {
      const targetTagihanId = displayedUnpaidBills[0]?.idTagihan || unpaidBills[0]?.idTagihan || 1;
      const todayStr = new Date().toISOString().split('T')[0];

      const base64Bukti = buktiTransfer ? await fileToBase64(buktiTransfer) : null;
      const payload = {
        Id_Tagihan: targetTagihanId,
        Tanggal_Bayar: todayStr,
        Total_Bayar: Number(nominal),
        Metode_Bayar: metode === 'tunai' ? 'Tunai' : 'Transfer',
        Bukti_Pembayaran: base64Bukti || (buktiTransfer?.name ?? (metode === 'tunai' ? 'LOKET-CASH-CLAIM' : '-')),
        Verifikasi_Pembayaran: 'Menunggu',
        keterangan: metode === 'qris'
          ? 'Pembayaran via QRIS Bunsay Hub'
          : metode === 'tunai'
            ? 'Pembayaran Tunai di Loket Kasir'
            : `Transfer ${selectedBank.name} (${selectedBank.rekDisplay})`
      };

      const alokasiList = Object.entries(customNominals)
        .filter(([_, val]) => Number(val) > 0)
        .map(([tId, val]) => ({
          id_tagihan: Number(tId),
          nominal: Number(val)
        }));

      if (alokasiList.length === 0) {
        setIsLoading(false);
        addToast('Silakan tentukan nominal pembayaran pada minimal satu periode tagihan.', 'error');
        return;
      }

      const sumAlokasi = alokasiList.reduce((sum, item) => sum + item.nominal, 0);
      if (sumAlokasi !== Number(nominal)) {
        setIsLoading(false);
        addToast(`Total alokasi (Rp ${sumAlokasi.toLocaleString('id-ID')}) harus sama dengan Total Pembayaran.`, 'error');
        return;
      }

      payload.alokasi = alokasiList;
      payload.Id_Tagihan = alokasiList[0].id_tagihan;

      await httpClient.post('/api/v1/tenant/pembayaran', payload);
      setIsLoading(false);
      addToast(
        metode === 'tunai'
          ? 'Pengajuan pembayaran tunai berhasil dikirim! Menunggu konfirmasi admin loket.'
          : metode === 'qris'
            ? 'Bukti transaksi QRIS berhasil dikirim! Menunggu verifikasi admin.'
            : 'Bukti transfer berhasil dikirim! Menunggu verifikasi admin.',
        'success'
      );
      navigate('/tenant/histori');
    } catch (err) {
      setIsLoading(false);
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal mengirim bukti pembayaran.';
      setProcessError(errMsg);
      addToast(errMsg, 'error');
    }
  };

  return (
    <div data-slot="bayar-sekarang" className="page-fade-in flex flex-col gap-6 font-sans w-full">
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
      ) : step === 1 ? (
        /* ========================================================
           LANGKAH 1: RENCANA ALOKASI PEMBAYARAN
           ======================================================== */
        <div className="w-full flex flex-col gap-4 page-fade-in">
          <div className="bg-white rounded-2xl border border-border/80 p-4 sm:p-6 shadow-xs flex flex-col gap-4">
            
            {/* Multi-Kiosk Filter (Jika punya > 1 kios) */}
            {availableKiosks.length > 1 && (
              <div className="flex flex-col gap-1.5 pb-3 border-b border-border/80">
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
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1. SKEMA PEMBAYARAN TAGIHAN */}
            <div className="flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl bg-mono-50/70 border border-border/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-text flex items-center gap-1.5">
                  <Icon icon="heroicons:banknotes-20-solid" className="size-4 text-red" />
                  <span>Skema Pembayaran Tagihan</span>
                </span>
                {izinkanCicilan ? (
                  <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Cicilan Diizinkan
                  </span>
                ) : (
                  <span className="text-[10.5px] font-bold text-text-3 bg-mono-100 px-2 py-0.5 rounded border border-border">
                    Wajib Lunas
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Skema Pembayaran">
                {/* Option 1: Bayar Lunas */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={modePelunasan === 'lunas'}
                  onClick={handleSwitchToLunas}
                  className={cn(
                    "p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer",
                    modePelunasan === 'lunas'
                      ? "bg-white border-red text-red shadow-xs ring-1 ring-red/20"
                      : "bg-white/60 border-border/80 text-text-2 hover:bg-white hover:border-border"
                  )}
                >
                  <div className={cn(
                    "size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    modePelunasan === 'lunas' ? "bg-red text-white" : "bg-mono-100 text-mono-500"
                  )}>
                    <Icon icon="heroicons:check-badge-20-solid" className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-text">Bayar Lunas</div>
                    <div className="text-[11px] text-text-3 font-medium leading-tight mt-0.5">
                      Lunasi seluruh kewajiban sewa (Rp {totalKewajiban.toLocaleString('id-ID')})
                    </div>
                  </div>
                </button>

                {/* Option 2: Bayar Cicilan */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={modePelunasan === 'cicil'}
                  onClick={handleSwitchToCicil}
                  className={cn(
                    "p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer",
                    modePelunasan === 'cicil'
                      ? "bg-white border-red text-red shadow-xs ring-1 ring-red/20"
                      : "bg-white/60 border-border/80 text-text-2 hover:bg-white hover:border-border",
                    !izinkanCicilan && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    modePelunasan === 'cicil' ? "bg-red text-white" : "bg-mono-100 text-mono-500"
                  )}>
                    <Icon icon="heroicons:pencil-square-20-solid" className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-text flex items-center gap-1.5">
                      <span>Bayar Cicilan</span>
                      {!izinkanCicilan && (
                        <Icon icon="heroicons:lock-closed-20-solid" className="size-3 text-mono-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-text-3 font-medium leading-tight mt-0.5">
                      Tentukan nominal sendiri untuk tiap bulan sewa
                    </div>
                  </div>
                </button>
              </div>

              {/* Bantuan / Izin Cicilan via WhatsApp (Dipindah ke bawah skema pembayaran tagihan) */}
              <div className="pt-2 border-t border-border/70 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
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

            {/* SUB: RINCIAN ALOKASI PER TAGIHAN */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-text">
                  Rincian Alokasi Per Tagihan
                </span>
                <span className="text-[11px] font-bold text-text-3 font-tabular-nums">
                  {displayedUnpaidBills.length} Tagihan
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {displayedUnpaidBills.map((bill) => {
                  const sisa = bill.sisaTagihan ?? bill.totalTagihan;
                  const currentInput = customNominals[bill.idTagihan] ?? '';
                  const currentNum = Number(currentInput) || 0;
                  const willBeLunas = currentNum >= sisa && sisa > 0;
                  const willBeDicicil = currentNum > 0 && currentNum < sisa;

                  return (
                    <div
                      key={bill.idTagihan}
                      className={cn(
                        "p-3 rounded-xl border transition-all flex flex-col gap-2",
                        currentNum > 0 ? "border-red/40 bg-red-50/15" : "border-border/80 bg-mono-50/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-text">
                              Sewa {formatPeriodeIndo(bill.periode)}
                            </span>
                            {bill.isOverdue ? (
                              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                Tunggakan
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                                Berjalan
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-text-3 font-medium mt-0.5">
                            Jumlah Tagihan: <strong className="text-text font-tabular-nums">Rp {sisa.toLocaleString('id-ID')}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Baris Nominal Field + Keterangan Status (Rata Kanan) */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-[220px] sm:max-w-xs">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-3 font-black text-xs">
                            Rp
                          </div>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={formatRibuanDot(currentInput)}
                            onChange={(e) => handleCustomNominalChange(bill.idTagihan, e.target.value, sisa)}
                            className="w-full h-9 rounded-lg border border-border pl-8 pr-3 text-xs font-extrabold font-tabular-nums focus:border-red bg-white transition-colors"
                          />
                        </div>

                        <div className="text-[11px] text-right shrink-0">
                          {willBeLunas ? (
                            <span className="text-green font-bold flex items-center justify-end gap-1">
                              <Icon icon="heroicons:check-circle-20-solid" className="size-3.5" />
                              <span>Akan lunas</span>
                            </span>
                          ) : willBeDicicil ? (
                            <span className="text-orange font-bold flex items-center justify-end gap-1">
                              <Icon icon="heroicons:clock-20-solid" className="size-3.5" />
                              <span>Sisa: Rp {Math.max(0, sisa - currentNum).toLocaleString('id-ID')}</span>
                            </span>
                          ) : (
                            <span className="text-mono-400 font-medium">Belum dialokasikan</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Alokasi */}
              <div className="p-3.5 rounded-xl bg-mono-100/70 border border-border/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-2 block">Total Pembayaran</span>
                </div>
                <span className="text-xl font-black font-tabular-nums text-red">
                  Rp {Number(nominal || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Error Message jika belum ada alokasi */}
            {nominalError && (
              <div className="bg-red-50 border border-red/30 rounded-xl p-3 flex items-start gap-2 text-xs text-red font-medium">
                <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-4 shrink-0 mt-0.5 text-red" />
                <span>{nominalError}</span>
              </div>
            )}

            {/* Tombol: Konfirmasi dan Lanjutkan Pembayaran */}
            <div className="pt-1">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleKonfirmasiAlokasi}
                disabled={Number(nominal || 0) <= 0}
                className="w-full h-11 text-sm font-bold shadow-xs rounded-xl cursor-pointer flex items-center justify-center"
              >
                <span>Konfirmasi dan Lanjutkan Pembayaran</span>
              </Button>
            </div>

          </div>
        </div>
      ) : (
        /* ========================================================
           LANGKAH 2: PEMILIHAN METODE, UNGGAH BUKTI & RENCANA PELUNASAN
           ======================================================== */
        <div className="flex flex-col gap-4 w-full page-fade-in">
          {/* Bar Navigasi Kembali */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-text-2 hover:text-red transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-border/80 shadow-2xs w-fit"
            >
              <Icon icon="heroicons:arrow-left-20-solid" className="size-4 text-red" />
              <span>Ubah Rencana Alokasi</span>
            </button>

            <span className="text-xs text-text-3 font-semibold hidden sm:inline">
              Total Pembayaran: <strong className="text-red font-extrabold font-tabular-nums">Rp {Number(nominal || 0).toLocaleString('id-ID')}</strong>
            </span>
          </div>

          <form onSubmit={handleProsesPembayaran} className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            
            {/* KOLOM KIRI: FORMULIR PEMBAYARAN */}
            <div className="lg:col-span-7 flex flex-col gap-3.5">
              <div className="bg-white rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
                
                {/* 2. METODE PEMBAYARAN */}
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-text">
                    Metode Pembayaran
                  </span>

                  <div className="grid grid-cols-3 p-0.5 bg-mono-100 rounded-xl border border-border/80 gap-1" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={metode === 'transfer_manual'}
                      onClick={() => setMetode('transfer_manual')}
                      className={cn(
                        "py-1.5 px-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
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
                      aria-selected={metode === 'qris'}
                      onClick={() => setMetode('qris')}
                      className={cn(
                        "py-1.5 px-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                        metode === 'qris'
                          ? "bg-white text-emerald-700 shadow-xs border border-border/80"
                          : "text-text-2 hover:text-text"
                      )}
                    >
                      <Icon icon="heroicons:qr-code-20-solid" className="size-4 shrink-0" />
                      <span>QRIS</span>
                    </button>

                    <button
                      type="button"
                      role="tab"
                      aria-selected={metode === 'tunai'}
                      onClick={() => setMetode('tunai')}
                      className={cn(
                        "py-1.5 px-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                        metode === 'tunai'
                          ? "bg-white text-amber-700 shadow-xs border border-border/80"
                          : "text-text-2 hover:text-text"
                      )}
                    >
                      <Icon icon="heroicons:banknotes-20-solid" className="size-4 shrink-0" />
                      <span>Tunai</span>
                    </button>
                  </div>
                </div>

                {/* Konten Detail Metode Terpilih */}
                {metode === 'transfer_manual' && (
                  <div className="flex flex-col gap-3 page-fade-in">
                    {/* Pilihan 3 Rekening Bank Tujuan Transfer */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-text-2 flex items-center gap-1">
                          <Icon icon="heroicons:building-library-20-solid" className="size-3.5 text-text-3" />
                          Pilih Rekening Bank Tujuan:
                        </span>
                        <span className="text-[10px] text-text-3 font-semibold">
                          3 Bank Resmi
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-mono-100 rounded-xl border border-border/80" role="radiogroup" aria-label="Pilih Bank Transfer">
                        {BANK_OPTIONS.map((bank) => {
                          const isSelected = bank.id === selectedBankId;
                          return (
                            <button
                              key={bank.id}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setSelectedBankId(bank.id);
                                setIsCopiedRekening(false);
                              }}
                              className={cn(
                                "py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none",
                                isSelected
                                  ? "bg-white text-text shadow-xs border border-border/80 font-extrabold"
                                  : "text-text-2 hover:text-text hover:bg-white/60"
                              )}
                            >
                              <span className={cn("size-2 rounded-full shrink-0", isSelected ? bank.dotColor : "bg-mono-300")} />
                              <span>{bank.code}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Kartu Detail Rekening Bank Terpilih */}
                    <div className="p-3 bg-mono-50/80 border border-border/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn("text-[10px] font-extrabold px-1.5 py-0.5 rounded border leading-none tracking-wide", selectedBank.badgeColor)}>
                            {selectedBank.code}
                          </span>
                          <span className="text-[11px] text-text-3 font-medium truncate">
                            {selectedBank.name}
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-mono font-bold text-red font-tabular-nums mt-0.5 select-all tracking-wider">
                          {selectedBank.rekDisplay}
                        </div>
                        <span className="text-[11px] text-text-2 font-semibold block mt-0.5">
                          a.n. {selectedBank.an}
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
                          navigator.clipboard.writeText(selectedBank.rekNumber);
                          setIsCopiedRekening(true);
                          addToast(`Nomor rekening ${selectedBank.code} berhasil disalin`, 'success');
                          setTimeout(() => setIsCopiedRekening(false), 2000);
                        }}
                        aria-label={`Salin nomor rekening ${selectedBank.name}`}
                      >
                        <Icon
                          icon={isCopiedRekening ? "heroicons:check-20-solid" : "heroicons:document-duplicate-20-solid"}
                          className={cn("size-3.5", isCopiedRekening ? "text-green font-bold" : "text-red")}
                        />
                        <span>{isCopiedRekening ? 'Tersalin!' : 'Salin'}</span>
                      </Button>
                    </div>
                  </div>
                )}

                {metode === 'qris' && (
                  <div className="flex flex-col gap-3 page-fade-in">
                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex flex-col gap-3">
                      {/* Header Bar dengan Info & Tombol Aksi Perbesar / Unduh */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Icon icon="heroicons:qr-code-20-solid" className="size-4" />
                          </div>
                          <div className="text-left">
                            <strong className="text-emerald-950 font-bold text-xs sm:text-[13px] block">
                              QRIS UPTD Plaza Kebun Sayur
                            </strong>
                            <span className="text-[11px] text-emerald-800 font-medium block">
                              Scan via m-Banking atau E-Wallet apa saja
                            </span>
                          </div>
                        </div>

                        {/* Tombol Perbesar & Unduh */}
                        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setIsQrisZoomed(!isQrisZoomed)}
                            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition-colors"
                            aria-label={isQrisZoomed ? "Kecilkan tampilan QRIS" : "Perbesar tampilan QRIS"}
                          >
                            <Icon icon={isQrisZoomed ? "heroicons:magnifying-glass-minus-20-solid" : "heroicons:magnifying-glass-plus-20-solid"} className="size-3.5" />
                            <span>{isQrisZoomed ? 'Kecilkan' : 'Perbesar'}</span>
                          </button>
                          <span className="text-emerald-300 text-xs">|</span>
                          <button
                            type="button"
                            onClick={handleDownloadQris}
                            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                            aria-label="Unduh QRIS"
                          >
                            <Icon icon="heroicons:arrow-down-tray-20-solid" className="size-3.5" />
                            <span>Unduh</span>
                          </button>
                        </div>
                      </div>

                      {/* Gambar QRIS */}
                      <div className="flex items-center justify-center w-full overflow-hidden transition-all duration-200 py-1">
                        <button
                          type="button"
                          onClick={() => setIsQrisZoomed(!isQrisZoomed)}
                          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-2xl transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center max-w-full"
                          title={isQrisZoomed ? "Klik untuk mengecilkan" : "Klik untuk memperbesar"}
                        >
                          <img
                            src="/assets/QRIS_PLACEHOLDER.jpg"
                            alt="QRIS UPTD Plaza Kebun Sayur"
                            className={cn(
                              "object-contain rounded-2xl shadow-xs transition-all duration-200",
                              isQrisZoomed
                                ? "w-full max-w-md max-h-[36rem]"
                                : "w-64 sm:w-80 md:w-96 max-h-84 sm:max-h-96"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {metode === 'tunai' && (
                  <div className="flex flex-col gap-3 page-fade-in">
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="size-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          <Icon icon="heroicons:banknotes-20-solid" className="size-4" />
                        </div>
                        <div className="text-left">
                          <strong className="text-amber-950 font-bold text-xs sm:text-[13px] block">
                            Pembayaran Tunai di Loket Kasir
                          </strong>
                          <p className="text-xs text-amber-900 font-medium leading-relaxed mt-1 mb-0">
                            Silakan datang langsung ke <strong>Loket Pembayaran Plaza Kebun Sayur</strong> membawa uang tunai. Petugas loket akan memproses setoran Anda.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. UNGGAH BUKTI PEMBAYARAN */}
                <div className="flex flex-col gap-1.5 pt-1">
                  {metode === 'transfer_manual' && (
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
                  )}

                  {metode === 'qris' && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs sm:text-sm font-extrabold text-text">
                        Unggah Bukti Pembayaran QRIS <span className="text-red">*</span>
                      </span>

                      {!previewBukti ? (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={handleDrop}
                          className={cn(
                            "border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500",
                            isDragOver ? "border-emerald-500 bg-emerald-50/50" : "border-border/80 hover:border-emerald-500/60 bg-mono-50/40"
                          )}
                          onClick={() => document.getElementById('file-upload-input-qris')?.click()}
                        >
                          <input
                            id="file-upload-input-qris"
                            type="file"
                            accept="image/*"
                            aria-label="Unggah tangkapan layar bukti pembayaran QRIS"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                          <div className="size-9 rounded-lg bg-white border border-border/80 flex items-center justify-center text-text-3 group-hover:text-emerald-600 shadow-2xs">
                            <Icon icon="heroicons:arrow-up-tray-20-solid" className="size-4" />
                          </div>
                          <p className="text-xs font-bold text-text">
                            <span className="text-emerald-700 hover:underline">Pilih tangkapan layar bukti bayar</span> atau tarik ke sini
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
                              {buktiTransfer?.name || 'Bukti_QRIS.jpg'}
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
                  )}

                  {metode === 'tunai' && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-extrabold text-text">
                          Unggah Bukti / Struk Kasir <span className="text-text-3 font-normal text-xs">(Opsional)</span>
                        </span>
                        {previewBukti && (
                          <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Foto Terlampir
                          </span>
                        )}
                      </div>

                      {!previewBukti ? (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={handleDrop}
                          className={cn(
                            "border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500",
                            isDragOver ? "border-amber-500 bg-amber-50/50" : "border-border/80 hover:border-amber-500/60 bg-mono-50/40"
                          )}
                          onClick={() => document.getElementById('file-upload-input-tunai-tenant')?.click()}
                        >
                          <input
                            id="file-upload-input-tunai-tenant"
                            type="file"
                            accept="image/*"
                            aria-label="Unggah foto struk pembayaran tunai"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                          <div className="size-9 rounded-lg bg-white border border-border/80 flex items-center justify-center text-text-3 group-hover:text-amber-600 shadow-2xs">
                            <Icon icon="heroicons:camera-20-solid" className="size-4.5" />
                          </div>
                          <p className="text-xs font-bold text-text">
                            <span className="text-amber-700 hover:underline">Pilih foto struk / bukti loket</span> atau tarik ke sini
                          </p>
                          <p className="text-2xs text-text-3">JPG, PNG, WebP (Maks. 5MB) - Opsional jika belum menerima struk</p>
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
                              {buktiTransfer?.name || 'Bukti_Tunai.jpg'}
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
                  )}
                </div>

                {/* Error Box */}
                {processError && (
                  <div className="bg-red-50 border border-red/30 rounded-xl p-3 flex items-start gap-2 text-xs text-red font-medium">
                    <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-4 shrink-0 mt-0.5 text-red" />
                    <span>{processError}</span>
                  </div>
                )}

                {/* Case 3 Guard Banner */}
                {hasPendingPayment && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
                    <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <strong className="block font-bold text-amber-950 mb-0.5">Pembayaran Sedang Menunggu Verifikasi</strong>
                      <span>
                        Ada transaksi pembayaran Anda sebelumnya yang sedang menunggu verifikasi oleh admin loket. Mohon tunggu hingga verifikasi selesai sebelum melakukan pembayaran kembali. Hubungi admin jika terjadi kesalahan.
                      </span>
                    </div>
                  </div>
                )}

                {/* Tombol Bayar Sekarang */}
                <div className="pt-0.5">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || !isUnpaidLoaded || hasPendingPayment}
                    className="w-full h-10.5 text-sm font-bold shadow-xs rounded-xl cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin size-4" />
                        <span>Mengirim Bukti...</span>
                      </span>
                    ) : (
                      <span>{hasPendingPayment ? 'Menunggu Verifikasi Pembayaran' : 'Bayar Sekarang'}</span>
                    )}
                  </Button>
                </div>

              </div>
            </div>

            {/* KOLOM KANAN: KARTU RENCANA PELUNASAN */}
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

                {/* Detail Denda jika aktif */}
                {totalDenda > 0 && (
                  <div className="p-2.5 rounded-xl bg-red-50/60 border border-red/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-red font-bold">
                      <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-4" />
                      <span>Denda Keterlambatan:</span>
                    </div>
                    <span className="font-extrabold font-tabular-nums text-red">
                      + Rp {totalDenda.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {/* Total Pembayaran Terpilih */}
                <div className="flex flex-col gap-1 pb-3 border-b border-border/80">
                  <span className="text-xs sm:text-sm font-semibold text-text-2">
                    Total Pembayaran:
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-tabular-nums text-red">
                    Rp {Number(nominal || 0).toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Rincian Alokasi Live */}
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

              </div>

            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default BayarSekarang;
