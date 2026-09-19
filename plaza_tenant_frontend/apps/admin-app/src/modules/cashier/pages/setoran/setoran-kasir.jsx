import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, FormField, Button, Card, Badge, FIFOPreview, BuktiPembayaranModal, useToast, cn } from '@bunsay/shared-ui';
import { allocatePaymentFIFO } from '@bunsay/shared-core';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function SetoranKasir() {
  const navigate = useNavigate();
  const { httpClient } = useAdminAuth();
  const { addToast } = useToast();

  // Selected tenant & bills state
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [tenantData, setTenantData] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [isBillsLoading, setIsBillsLoading] = useState(false);
  const [targetTagihanId, setTargetTagihanId] = useState(null);

  // Method state: 'tunai' | 'transfer' | 'qris'
  const [metode, setMetode] = useState('tunai');

  // Form input state
  const [nominal, setNominal] = useState('');
  const [buktiFoto, setBuktiFoto] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [tenantError, setTenantError] = useState(null);
  const [nominalError, setNominalError] = useState(null);
  const [buktiError, setBuktiError] = useState(null);

  // Confirmation modal state
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  // Receipt modal state for post-payment SSRD view/print
  const [savedReceiptData, setSavedReceiptData] = useState(null);

  // Search & Filter state for Tenant Selection
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState('Semua');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch tenant list from /api/v1/admin/kios
  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await httpClient.get('/api/v1/admin/kios');
        const rawKios = Array.isArray(response.data) ? response.data : (response.data?.data || []);

        const mapped = rawKios.map((k, idx) => {
          const sewaObj = Array.isArray(k.sewa) ? (k.sewa.find(s => s.Status === 'Aktif') || k.sewa[0]) : k.sewa;
          const pemilikObj = sewaObj?.pemilik || k.pemilik;
          const namaPemilik = pemilikObj?.Nama || (k.Status === 'Terisi' ? (sewaObj?.Nama_Penyewa || 'Penyewa Kios') : 'Kios Kosong');
          const idPemilik = pemilikObj?.Id_Pemilik || sewaObj?.Id_Pemilik || null;
          const statusKios = (namaPemilik !== 'Kios Kosong' && k.Status === 'Terisi') ? 'Terisi' : 'Kosong';

          return {
            id: k.Id_Kios || idx + 1,
            idPemilik: idPemilik,
            kios: k.No_Kios || `Kios #${k.Id_Kios}`,
            nama: namaPemilik,
            usaha: sewaObj?.Jenis_Usaha || k.Jenis_Usaha || (statusKios === 'Kosong' ? 'Tersedia' : 'Perdagangan Umum'),
            status: statusKios,
            lantai: k.Lantai || 1,
          };
        });

        setTenantData(mapped);
      } catch (err) {
        console.error('Gagal mengambil daftar tenant:', err);
        addToast('Gagal memuat daftar tenant. Muat ulang halaman.', 'error');
      }
    }
    fetchTenants();
  }, [httpClient, addToast]);

  // Filtered tenants for search dropdown
  const filteredTenants = useMemo(() => {
    return tenantData.filter(t => {
      const matchSearch =
        t.nama.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        t.kios.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        t.usaha.toLowerCase().includes(tenantSearchQuery.toLowerCase());

      if (floorFilter === 'Semua') return matchSearch;
      if (floorFilter === 'Lantai 1') return matchSearch && t.lantai === 1;
      if (floorFilter === 'Lantai 2') return matchSearch && t.lantai === 2;
      if (floorFilter === 'Terisi') return matchSearch && t.status === 'Terisi';
      return matchSearch;
    });
  }, [tenantData, tenantSearchQuery, floorFilter]);

  const selectedTenantObj = useMemo(() => {
    return tenantData.find(t => String(t.id) === String(selectedTenantId));
  }, [tenantData, selectedTenantId]);

  // Fetch unpaid bills when tenant is selected
  useEffect(() => {
    if (!selectedTenantId) {
      setUnpaidBills([]);
      setTargetTagihanId(null);
      return;
    }

    async function fetchUnpaidBills() {
      setIsBillsLoading(true);
      try {
        const response = await httpClient.get('/api/v1/admin/tagihan');
        const rawTagihan = Array.isArray(response.data) ? response.data : (response.data?.data || []);

        const billsForTenant = rawTagihan
          .filter(t => {
            const sewaKiosId = t.sewa?.Id_Kios;
            const isMatchKios = sewaKiosId && String(sewaKiosId) === String(selectedTenantId);
            const isMatchPemilik = selectedTenantObj?.idPemilik && t.sewa?.Id_Pemilik === selectedTenantObj.idPemilik;
            return (isMatchKios || isMatchPemilik) && t.Status_Tagihan !== 'Lunas';
          })
          .map(t => {
            const totalTagihan = parseFloat(t.Total_Tagihan || 0);
            const sisaTagihan = parseFloat(t.Sisa_Tagihan ?? totalTagihan);
            return {
              idTagihan: t.Id_Tagihan,
              periode: t.Periode,
              noKios: t.sewa?.kios?.No_Kios || selectedTenantObj?.kios || '',
              jenisUsaha: t.sewa?.Jenis_Usaha || selectedTenantObj?.usaha || '',
              jatuhTempo: t.Jatuh_Tempo,
              tarifSewa: parseFloat(t.Tarif_Sewa || 0),
              totalTagihan,
              sisaTagihan,
              totalTerbayar: Math.max(0, totalTagihan - sisaTagihan),
              statusTagihan: t.Status_Tagihan,
              isOverdue: Boolean(t.is_overdue),
            };
          });

        setUnpaidBills(billsForTenant);
        if (billsForTenant.length > 0) {
          setTargetTagihanId(billsForTenant[0].idTagihan);
        } else {
          setTargetTagihanId(null);
        }
      } catch (err) {
        console.error('Gagal mengambil tagihan tenant:', err);
        addToast('Gagal memuat tagihan tenant terpilih.', 'error');
      } finally {
        setIsBillsLoading(false);
      }
    }

    fetchUnpaidBills();
  }, [selectedTenantId, selectedTenantObj, httpClient, addToast]);

  const handleSelectTenant = (tenant) => {
    if (tenant.status === 'Kosong') {
      addToast(`Kios ${tenant.kios} saat ini kosong / belum memiliki penyewa aktif.`, 'warning');
      return;
    }
    setSelectedTenantId(String(tenant.id));
    setIsDropdownOpen(false);
    setTenantError(null);
  };

  const handleClearSelectedTenant = () => {
    setSelectedTenantId('');
    setUnpaidBills([]);
    setTargetTagihanId(null);
    setTenantSearchQuery('');
  };

  // FIFO Allocation preview
  const numericNominal = useMemo(() => {
    const parsed = parseInt(nominal, 10);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [nominal]);

  const fifoAllocations = useMemo(() => {
    if (!unpaidBills.length || numericNominal <= 0) return [];
    const result = allocatePaymentFIFO(unpaidBills, numericNominal);
    return result?.allocations || [];
  }, [numericNominal, unpaidBills]);

  // File upload handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setBuktiError('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setBuktiError('Ukuran file maksimal adalah 5MB.');
      return;
    }

    setBuktiError(null);
    setBuktiFoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewBukti(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleRemoveFile = () => {
    setBuktiFoto(null);
    setPreviewBukti(null);
    setBuktiError(null);
  };

  // Method switch handler
  const handleMethodChange = (newMethod) => {
    setMetode(newMethod);
    setBuktiError(null);
  };

  // Form submission validate
  const handleFormSubmit = (e) => {
    e.preventDefault();
    let hasErr = false;
    setTenantError(null);
    setNominalError(null);
    setBuktiError(null);

    if (!selectedTenantId) {
      setTenantError('Silakan pilih tenant & unit kios terlebih dahulu.');
      hasErr = true;
    } else if (unpaidBills.length === 0) {
      setTenantError('Tenant ini tidak memiliki tagihan sewa tertunggak / aktif.');
      hasErr = true;
    }

    const nominalNum = parseInt(nominal, 10);
    if (!nominalNum || nominalNum <= 0) {
      setNominalError('Masukkan nominal pembayaran yang valid (minimal Rp 1).');
      hasErr = true;
    }

    // Bukti wajib untuk Transfer dan QRIS
    if (metode !== 'tunai' && !previewBukti) {
      setBuktiError(`Wajib mengunggah foto bukti pembayaran untuk metode ${metode === 'qris' ? 'QRIS' : 'Transfer Bank'}.`);
      hasErr = true;
    }

    if (hasErr) return;
    setShowKonfirmasi(true);
  };

  // Final execution
  const handleSimpanPembayaranFinal = async () => {
    setIsSubmitting(true);
    const nominalNum = parseInt(nominal, 10);
    const dateNow = new Date().toISOString().split('T')[0];
    const refCode = `LOKET-${metode.toUpperCase()}-${Date.now()}`;

    const payload = {
      Id_Tagihan: targetTagihanId || unpaidBills[0]?.idTagihan || 1,
      Tanggal_Bayar: dateNow,
      Total_Bayar: nominalNum,
      Metode_Bayar: metode === 'tunai' ? 'Tunai' : 'Transfer',
      Bukti_Pembayaran: previewBukti || refCode,
      Verifikasi_Pembayaran: 'Diterima'
    };

    try {
      const response = await httpClient.post('/api/v1/admin/pembayaran', payload);

      const methodLabel = metode === 'tunai' ? 'Setoran tunai' : metode === 'qris' ? 'Pembayaran QRIS' : 'Pembayaran transfer bank';
      addToast(`${methodLabel} berhasil dicatat dan disahkan lunas.`, 'success');

      const resData = response?.data?.data || response?.data || {};
      setSavedReceiptData({
        id: resData.Id_Pembayaran || Date.now(),
        trxCode: `TRX-${resData.Id_Pembayaran || 'LOKET'}`,
        nama: selectedTenantObj?.nama || 'Tenant',
        kios: selectedTenantObj?.kios || '-',
        nominal: nominalNum,
        nominalRaw: nominalNum,
        metode: metode === 'tunai' ? 'Tunai' : (metode === 'qris' ? 'QRIS' : 'Transfer'),
        periode: unpaidBills[0]?.periode || '-',
        status: 'Diterima',
        tanggal: dateNow,
        bukti: previewBukti || refCode,
        keterangan: 'Pembayaran disahkan lunas oleh kasir loket pasar.'
      });

      // Reset form
      setNominal('');
      setSelectedTenantId('');
      setBuktiFoto(null);
      setPreviewBukti(null);
      setShowKonfirmasi(false);
      handleClearSelectedTenant();
    } catch (err) {
      console.error('Gagal mencatat pembayaran:', err);
      addToast(err?.response?.data?.message || 'Gagal menyimpan pembayaran. Silakan coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-slot="loket-pembayaran-kasir" className="page-fade-in flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">
          Loket Pembayaran Kasir
        </h1>
        <p className="text-xs sm:text-sm text-text-3 mt-1">
          Pencatatan setoran tunai loket pasar maupun input bukti transfer bank & QRIS yang dikirim tenant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Form Card (7 Cols) */}
        <Card variant="elevated" className="lg:col-span-7 p-4 sm:p-6 flex flex-col gap-5">
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
            {/* Step 1: Pilih Tenant & Kios */}
            <div className="flex flex-col gap-2">
              <label htmlFor="select-tenant-search" className="text-xs font-bold text-text uppercase tracking-wider flex items-center justify-between">
                <span>1. Pilih Tenant & Kios</span>
                {selectedTenantObj && (
                  <button
                    type="button"
                    onClick={handleClearSelectedTenant}
                    className="text-2xs font-extrabold text-red hover:underline cursor-pointer"
                  >
                    Ganti Kios
                  </button>
                )}
              </label>

              {!selectedTenantObj ? (
                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); } }}
                    className={cn(
                      "w-full px-3.5 py-2.5 bg-mono-50 border rounded-lg text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors shadow-2xs",
                      tenantError ? "border-red ring-1 ring-red" : "border-border hover:border-red/40"
                    )}
                  >
                    <span className="text-text-3">-- Cari nama penyewa atau nomor kios --</span>
                    <Icon icon="heroicons:chevron-down-20-solid" className="size-4 text-mono-400" />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-border/90 rounded-xl shadow-xl p-2 flex flex-col gap-2 animate-scale-in">
                      <div className="relative">
                        <Icon icon="heroicons:magnifying-glass-20-solid" className="size-4 text-mono-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="select-tenant-search"
                          type="text"
                          autoFocus
                          placeholder="Ketik nama tenant atau no kios (contoh: A1-02)..."
                          value={tenantSearchQuery}
                          onChange={(e) => setTenantSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-mono-50 border border-border/80 rounded-md focus:outline-none focus:border-red focus:bg-white"
                        />
                      </div>

                      {/* Floor Filter pills */}
                      <div className="flex items-center gap-1.5 border-b border-border/50 pb-2">
                        {['Semua', 'Lantai 1', 'Lantai 2', 'Terisi'].map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setFloorFilter(f)}
                            className={cn(
                              "text-2xs font-bold px-2 py-1 rounded-md transition-colors",
                              floorFilter === f ? "bg-red text-white" : "bg-mono-100 text-text-2 hover:bg-mono-200"
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      {/* Tenant list */}
                      <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                        {filteredTenants.length === 0 ? (
                          <div className="p-4 text-center text-xs text-text-3">
                            Tenant / Kios tidak ditemukan.
                          </div>
                        ) : (
                          filteredTenants.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleSelectTenant(t)}
                              className={cn(
                                "w-full text-start p-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                                t.status === 'Kosong' ? "opacity-40 cursor-not-allowed" : "hover:bg-red-50/50 cursor-pointer"
                              )}
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="font-extrabold text-text truncate">{t.nama}</span>
                                <span className="text-2xs text-text-3 truncate">{t.usaha}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ms-2">
                                <span className="font-black font-tabular-nums text-red text-2xs px-1.5 py-0.5 bg-red-50 border border-red/20 rounded">
                                  Kios {t.kios}
                                </span>
                                <span className="text-2xs text-mono-400">Lt. {t.lantai}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Selected Tenant Card */
                <div className="p-3.5 bg-mono-50 border border-border/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-red-50 text-red flex items-center justify-center shrink-0 border border-red/20">
                      <Icon icon="heroicons:user-20-solid" className="size-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-text text-sm truncate">{selectedTenantObj.nama}</span>
                        <Badge status="Terisi" size="xs" />
                      </div>
                      <span className="text-2xs text-text-3 truncate">
                        Kios <strong className="text-text font-bold">{selectedTenantObj.kios}</strong> (Lt. {selectedTenantObj.lantai}) • {selectedTenantObj.usaha}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleClearSelectedTenant}
                    className="text-text-3 hover:text-red shrink-0"
                  >
                    Ganti
                  </Button>
                </div>
              )}

              {tenantError && (
                <span className="text-2xs font-bold text-red flex items-center gap-1">
                  <Icon icon="heroicons:exclamation-circle-20-solid" className="size-3.5" />
                  <span>{tenantError}</span>
                </span>
              )}
            </div>

            {/* Step 2: Pilih Metode Pembayaran (Segmented Control) */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                2. Metode Pembayaran
              </span>
              <div className="grid grid-cols-3 gap-2 p-1 bg-mono-100/70 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => handleMethodChange('tunai')}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer",
                    metode === 'tunai'
                      ? "bg-white text-amber-800 shadow-xs border border-amber-200/80 font-black"
                      : "text-text-2 hover:text-text hover:bg-white/50"
                  )}
                >
                  <Icon icon="heroicons:banknotes-20-solid" className="size-4 text-amber-700" />
                  <span>Tunai (Loket)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange('transfer')}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer",
                    metode === 'transfer'
                      ? "bg-white text-red shadow-xs border border-red/30 font-black"
                      : "text-text-2 hover:text-text hover:bg-white/50"
                  )}
                >
                  <Icon icon="heroicons:building-library-20-solid" className="size-4 text-red" />
                  <span>Transfer Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange('qris')}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer",
                    metode === 'qris'
                      ? "bg-white text-orange shadow-xs border border-orange/40 font-black"
                      : "text-text-2 hover:text-text hover:bg-white/50"
                  )}
                >
                  <Icon icon="heroicons:qr-code-20-solid" className="size-4 text-orange" />
                  <span>QRIS Barcode</span>
                </button>
              </div>

              {/* Informational Guidance Box */}
              <div className="p-3 bg-mono-50 border border-border/60 rounded-lg text-xs text-text-2 flex items-start gap-2.5">
                <Icon icon="heroicons:information-circle-20-solid" className="size-4 text-red shrink-0 mt-0.5" />
                <span>
                  {metode === 'tunai' && (
                    <>Uang tunai diterima langsung di loket kasir UPTD. Foto struk kasir / Batavia bersifat <strong className="text-text font-bold">opsional</strong> dan dapat disusulkan sewaktu-waktu.</>
                  )}
                  {metode === 'transfer' && (
                    <>Pencatatan bukti transfer bank yang dikirim tenant via WhatsApp / mutasi rekening. Foto struk/screenshot transfer <strong className="text-text font-bold">wajib dilampirkan</strong>.</>
                  )}
                  {metode === 'qris' && (
                    <>Pencatatan bukti transaksi scan QRIS yang dikirim tenant via WhatsApp. Foto bukti QRIS <strong className="text-text font-bold">wajib dilampirkan</strong>.</>
                  )}
                </span>
              </div>
            </div>

            {/* Step 3: Nominal Pembayaran */}
            <div className="flex flex-col gap-2">
              <FormField
                label="3. Nominal Pembayaran (Rp)"
                id="setoran-nominal"
                required
                error={nominalError}
              >
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-text-3 text-xs">
                    Rp
                  </span>
                  <input
                    id="setoran-nominal"
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="Contoh: 1200000"
                    value={nominal}
                    onChange={(e) => {
                      setNominal(e.target.value);
                      setNominalError(null);
                    }}
                    className={cn(
                      "w-full pl-10 pr-3.5 py-2.5 bg-mono-50 border rounded-lg text-sm font-extrabold font-tabular-nums text-text focus:outline-none focus:bg-white transition-colors shadow-2xs",
                      nominalError ? "border-red ring-1 ring-red" : "border-border focus:border-red"
                    )}
                  />
                </div>
              </FormField>

              {/* Quick Fill Buttons from unpaid bills */}
              {unpaidBills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNominal(String(unpaidBills[0].sisaTagihan || unpaidBills[0].totalTagihan));
                      setNominalError(null);
                    }}
                    className="text-2xs font-bold px-2 py-1 bg-mono-100 hover:bg-red-50 text-text hover:text-red rounded-md border border-border/60 transition-colors cursor-pointer"
                  >
                    Bayar Periode {unpaidBills[0].periode} (Rp {(unpaidBills[0].sisaTagihan || unpaidBills[0].totalTagihan).toLocaleString('id-ID')})
                  </button>
                  {unpaidBills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const sumTotal = unpaidBills.reduce((acc, b) => acc + (b.sisaTagihan || b.totalTagihan), 0);
                        setNominal(String(sumTotal));
                        setNominalError(null);
                      }}
                      className="text-2xs font-extrabold px-2 py-1 bg-red-50 text-red hover:bg-red hover:text-white rounded-md border border-red/20 transition-colors cursor-pointer"
                    >
                      Lunasi Semua ({unpaidBills.length} Periode)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 4: Lampiran Foto Bukti */}
            <div className="flex flex-col gap-2">
              <label htmlFor="file-upload-input" className="text-xs font-bold text-text uppercase tracking-wider flex items-center justify-between">
                <span>
                  4. Foto Bukti Struk / Bukti Bayar {metode === 'tunai' ? '(Opsional)' : '(Wajib)'}
                </span>
                {previewBukti && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-2xs font-extrabold text-red hover:underline cursor-pointer"
                  >
                    Hapus Berkas
                  </button>
                )}
              </label>

              {!previewBukti ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center transition-colors shadow-2xs",
                    isDragOver ? "border-red bg-red-50/40" : (buktiError ? "border-red bg-red-50/10" : "border-border/80 bg-mono-50 hover:bg-mono-100/50")
                  )}
                >
                  <div className="size-10 rounded-full bg-mono-100 text-mono-400 flex items-center justify-center">
                    <Icon icon="heroicons:arrow-up-tray-20-solid" className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text">
                      Tarik & lepas foto struk di sini, atau telusuri berkas
                    </span>
                    <span className="text-2xs text-text-3 mt-0.5">
                      Format didukung: JPG, PNG, WebP (Maksimal 5MB)
                    </span>
                  </div>
                  <label htmlFor="file-upload-input" className="cursor-pointer mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-border text-xs font-bold text-text hover:bg-mono-50 shadow-2xs">
                    <Icon icon="heroicons:photo-20-solid" className="size-4 text-red" />
                    <span>Pilih Foto</span>
                    <input
                      id="file-upload-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="p-3 bg-mono-50 border border-border rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={previewBukti}
                      alt="Pratinjau Bukti"
                      className="size-12 object-cover rounded-lg border border-border/80 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-text truncate">
                        {buktiFoto?.name || 'Foto Bukti Terpilih'}
                      </span>
                      <span className="text-2xs text-text-3">
                        {buktiFoto ? `${(buktiFoto.size / 1024).toFixed(1)} KB` : 'Berkas Siap'}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleRemoveFile}
                    className="text-red hover:bg-red-50 font-bold"
                  >
                    Ganti
                  </Button>
                </div>
              )}

              {buktiError && (
                <span className="text-2xs font-bold text-red flex items-center gap-1">
                  <Icon icon="heroicons:exclamation-circle-20-solid" className="size-3.5" />
                  <span>{buktiError}</span>
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!selectedTenantId || !nominal || isSubmitting}
                className="w-full sm:w-auto font-black px-6 shadow-xs gap-1.5"
              >
                <Icon icon="heroicons:check-circle-20-solid" className="size-4" />
                <span>Simpan Pembayaran</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Right Info / FIFO Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Unpaid bills summary */}
          <Card variant="outline" className="p-4 flex flex-col gap-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-text uppercase tracking-wider flex items-center gap-1.5">
                <Icon icon="heroicons:document-text-20-solid" className="size-4 text-red" />
                <span>Tagihan Tertunggak / Aktif</span>
              </span>
              <span className="text-2xs font-bold text-text-3">
                {isBillsLoading ? 'Memuat...' : `${unpaidBills.length} Tagihan`}
              </span>
            </div>

            {isBillsLoading ? (
              <div className="py-6 text-center text-xs text-text-3">
                Memeriksa tagihan sewa tenant...
              </div>
            ) : !selectedTenantId ? (
              <div className="py-6 text-center text-xs text-text-3 flex flex-col items-center gap-1">
                <Icon icon="heroicons:user-circle-20-solid" className="size-8 text-mono-300" />
                <span>Pilih tenant terlebih dahulu untuk melihat rincian tagihan sewa.</span>
              </div>
            ) : unpaidBills.length === 0 ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5 font-bold">
                <Icon icon="heroicons:check-badge-20-solid" className="size-5 text-emerald-600 shrink-0" />
                <span>Semua tagihan sewa untuk kios ini telah lunas. Tidak ada tagihan tertunggak.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {unpaidBills.map((b) => (
                  <div
                    key={b.idTagihan}
                    className="p-3 bg-mono-50 border border-border/70 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-extrabold text-text">Periode {b.periode}</span>
                      <span className="text-2xs text-text-3">
                        Jatuh Tempo: {b.jatuhTempo || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black font-tabular-nums text-text">
                        Rp {(b.sisaTagihan || b.totalTagihan).toLocaleString('id-ID')}
                      </span>
                      <span className="text-2xs text-amber-700 font-bold">
                        {b.statusTagihan}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* FIFO Allocation Preview */}
          {unpaidBills.length > 0 && numericNominal > 0 && (
            <FIFOPreview
              nominal={numericNominal}
              allocations={fifoAllocations}
            />
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI PEMBAYARAN */}
      {showKonfirmasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <Card variant="elevated" className="max-w-md w-full p-5 sm:p-6 flex flex-col gap-4 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-red-50 text-red flex items-center justify-center shrink-0 border border-red/20">
                <Icon icon="heroicons:shield-check-20-solid" className="size-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-black text-text text-base">Konfirmasi Pembayaran</h3>
                <span className="text-xs text-text-3">Periksa kembali data pembayaran sebelum disimpan ke sistem.</span>
              </div>
            </div>

            <div className="bg-mono-50 border border-border/80 rounded-xl p-3.5 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-3">Penyewa / Kios:</span>
                <span className="font-black text-text">{selectedTenantObj?.nama} ({selectedTenantObj?.kios})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-3">Metode Bayar:</span>
                <span className="font-black text-text uppercase">
                  {metode === 'tunai' ? 'Setoran Tunai Loket' : metode === 'qris' ? 'QRIS Barcode' : 'Transfer Bank'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-3">Nominal Terbayar:</span>
                <span className="font-black font-tabular-nums text-red text-sm">
                  Rp {parseInt(nominal, 10).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-3">Status Langsung:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-2xs">
                  Lunas / Disahkan Kasir
                </span>
              </div>
              {previewBukti && (
                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-text-3">Foto Bukti:</span>
                  <img src={previewBukti} alt="Bukti" className="size-9 object-cover rounded border border-border" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setShowKonfirmasi(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onClick={handleSimpanPembayaranFinal}
                className="font-bold gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="heroicons:arrow-path-20-solid" className="size-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:check-20-solid" className="size-4" />
                    <span>Ya, Simpan Pembayaran</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
      {/* Modal Resi & Kuitansi SSRD Otomatis Pasca-Setoran */}
      <BuktiPembayaranModal
        isOpen={Boolean(savedReceiptData)}
        onClose={() => setSavedReceiptData(null)}
        item={savedReceiptData}
      />
    </div>
  );
}

export default SetoranKasir;
