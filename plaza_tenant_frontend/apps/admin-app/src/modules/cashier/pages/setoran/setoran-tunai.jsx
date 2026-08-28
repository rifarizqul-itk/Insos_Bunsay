import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, FormField, Button, Card, Badge, FIFOPreview, BuktiPembayaranModal, useToast, cn } from '@bunsay/shared-ui';
import { allocatePaymentFIFO } from '@bunsay/shared-core';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function SetoranTunai() {
  const navigate = useNavigate();
  const { httpClient } = useAdminAuth();
  const { addToast } = useToast();

  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [nominalTunai, setNominalTunai] = useState('');
  const [buktiTunai, setBuktiTunai] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantError, setTenantError] = useState(null);
  const [nominalError, setNominalError] = useState(null);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const [tenantData, setTenantData] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [isBillsLoading, setIsBillsLoading] = useState(false);
  const [targetTagihanId, setTargetTagihanId] = useState(null);
  const [savedReceiptData, setSavedReceiptData] = useState(null);

  // Search & Filter state for Tenant Selection
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState('Semua'); // 'Semua' | 'Lantai 1' | 'Lantai 2' | 'Terisi'
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

  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await httpClient.get('/api/v1/admin/kios');
        const raw = response?.data?.data || (Array.isArray(response?.data) ? response.data : []);
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((item, idx) => {
            const activeSewa = Array.isArray(item.sewa)
              ? (item.sewa.find(s => s.Status === 'Aktif') || item.sewa[0] || null)
              : (item.sewa || null);
            const pemilik = activeSewa?.pemilik || item.pemilik || null;
            return {
              id: item.Id_Kios || item.id || idx + 1,
              idPemilik: pemilik?.Id_Pemilik || item.Id_Pemilik || idx + 1,
              nama: pemilik?.Nama || (item.Status === 'Terisi' ? 'Penyewa Kios' : 'Kios Kosong'),
              kios: item.No_Kios || `Kios-${idx + 1}`,
              lantai: item.Lantai || (String(item.No_Kios).includes('2') ? 2 : 1),
              status: item.Status || (pemilik ? 'Terisi' : 'Kosong'),
              usaha: activeSewa?.Jenis_Usaha || 'Perdagangan Umum'
            };
          });
          setTenantData(mapped);
        } else {
          setTenantData([]);
        }
      } catch (err) {
        console.warn('Gagal memuat data kios:', err);
        setTenantData([]);
      }
    }
    fetchTenants();
  }, [httpClient]);

  // Filtered tenants for search and quick floor tabs
  const filteredTenants = useMemo(() => {
    return tenantData.filter(t => {
      const q = tenantSearchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        (t.kios && t.kios.toLowerCase().includes(q)) ||
        (t.nama && t.nama.toLowerCase().includes(q)) ||
        (t.usaha && t.usaha.toLowerCase().includes(q));

      let matchFilter = true;
      if (floorFilter === 'Lantai 1') {
        matchFilter = String(t.lantai) === '1' || (t.kios && t.kios.includes('1'));
      } else if (floorFilter === 'Lantai 2') {
        matchFilter = String(t.lantai) === '2' || (t.kios && t.kios.includes('2'));
      } else if (floorFilter === 'Terisi') {
        matchFilter = t.status === 'Terisi' && t.nama !== 'Kios Kosong';
      }

      return matchQuery && matchFilter;
    });
  }, [tenantData, tenantSearchQuery, floorFilter]);

  const selectedTenantObj = useMemo(() => {
    return tenantData.find(t => String(t.id) === String(selectedTenantId));
  }, [tenantData, selectedTenantId]);

  // Auto-fetch active bills when tenant is selected
  useEffect(() => {
    if (!selectedTenantId) {
      setUnpaidBills([]);
      setTargetTagihanId(null);
      setNominalTunai('');
      return;
    }

    const selectedObj = tenantData.find(t => String(t.id) === String(selectedTenantId));

    async function fetchActiveBills() {
      setIsBillsLoading(true);
      try {
        const url = selectedObj?.idPemilik 
          ? `/api/v1/admin/tagihan?Id_Pemilik=${selectedObj.idPemilik}` 
          : '/api/v1/admin/tagihan';
        const response = await httpClient.get(url);
        const raw = response?.data?.data || (Array.isArray(response?.data) ? response.data : []);
        
        if (Array.isArray(raw)) {
          const active = raw
            .filter(b => b.Status_Tagihan !== 'Lunas')
            .map(b => ({
              idTagihan: b.Id_Tagihan || b.id,
              periode: b.Periode || 'Periode Aktif',
              tarifSewa: Number(b.Tarif_Sewa || b.Total_Tagihan || b.Nominal || 450000),
              totalTagihan: Number(b.Total_Tagihan || b.Nominal || 450000),
              totalTerbayar: 0,
              statusTagihan: b.Status_Tagihan || 'Belum Bayar'
            }));

          setUnpaidBills(active);
          if (active.length > 0) {
            setTargetTagihanId(active[0].idTagihan);
            const totalNominal = active.reduce((sum, b) => sum + b.totalTagihan, 0);
            setNominalTunai(String(totalNominal));
          } else {
            setTargetTagihanId(null);
            setNominalTunai('');
          }
        }
      } catch (err) {
        console.warn('Error fetching tenant bills:', err);
      } finally {
        setIsBillsLoading(false);
      }
    }
    fetchActiveBills();
  }, [selectedTenantId, tenantData, httpClient]);

  const fifoAllocations = useMemo(() => {
    const nominalNum = Number(nominalTunai) || 0;
    if (selectedTenantId && nominalNum > 0) {
      const activeUnpaid = unpaidBills.filter(b => b.statusTagihan !== 'Lunas');
      return allocatePaymentFIFO(activeUnpaid, nominalNum).allocations;
    }
    return [];
  }, [nominalTunai, selectedTenantId, unpaidBills]);

  const handleSelectTenant = (tenant) => {
    setSelectedTenantId(String(tenant.id));
    setIsDropdownOpen(false);
    setTenantSearchQuery('');
    if (tenantError) setTenantError(null);
  };

  const handleClearSelectedTenant = () => {
    setSelectedTenantId('');
    setNominalTunai('');
    setUnpaidBills([]);
    setTargetTagihanId(null);
    setTenantSearchQuery('');
    setIsDropdownOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let hasErr = false;
    setTenantError(null);
    setNominalError(null);

    if (!selectedTenantId) {
      setTenantError('Silakan pilih tenant terlebih dahulu.');
      hasErr = true;
    }

    const nominalNum = parseInt(nominalTunai, 10);
    if (!nominalNum || nominalNum <= 0) {
      setNominalError('Masukkan nominal tunai yang valid.');
      hasErr = true;
    }

    if (hasErr) return;
    setShowKonfirmasi(true);
  };

  const handleSimpanTunaiFinal = async () => {
    setIsSubmitting(true);
    const nominalNum = parseInt(nominalTunai, 10);
    const dateNow = new Date().toISOString().split('T')[0];
    const refCode = `LOKET-CASH-${Date.now()}`;

    try {
      const response = await httpClient.post('/api/v1/admin/pembayaran', {
        Id_Tagihan: targetTagihanId || 101,
        Tanggal_Bayar: dateNow,
        Total_Bayar: nominalNum,
        Metode_Bayar: 'Tunai',
        Bukti_Pembayaran: previewBukti || refCode,
        Verifikasi_Pembayaran: 'Diterima'
      });

      const resData = response?.data?.data || response?.data || {};

      setSavedReceiptData({
        id: resData.Id_Pembayaran || Date.now(),
        trxCode: `TRX-${resData.Id_Pembayaran || 'CASH'}`,
        nama: selectedTenantObj?.nama || 'Tenant',
        kios: selectedTenantObj?.kios || '-',
        nominal: nominalNum,
        nominalRaw: nominalNum,
        metode: 'Tunai',
        labelMetode: 'Tunai (Kasir Loket)',
        tanggal: dateNow,
        waktu: dateNow,
        status: 'Diterima',
        Bukti_Pembayaran: refCode,
      });

      addToast('Setoran tunai berhasil dicatat', 'success');
      setNominalTunai('');
      setSelectedTenantId('');
      setBuktiTunai(null);
      setPreviewBukti(null);
      setShowKonfirmasi(false);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Gagal menyimpan setoran tunai. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-slot="setoran-tunai" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {toastMsg && (
        <div className="bg-emerald-600 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-white hover:opacity-80 p-1"
          >
            <Icon icon="heroicons:x-mark-20-solid" className="size-4" />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Setoran Tunai
        </h1>
      </div>

      <Card variant="elevated" className="max-w-2xl p-6 sm:p-8 flex flex-col gap-6">
        {showKonfirmasi ? (
          <div className="flex flex-col gap-5 page-fade-in" role="region" aria-label="Tinjauan Konfirmasi Setoran Tunai">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Icon icon="heroicons:shield-check-20-solid" className="size-6 text-green" />
              <h2 className="text-lg font-extrabold text-text tracking-tight text-balance">
                Konfirmasi Setoran Tunai
              </h2>
            </div>
            <p className="text-sm text-text-2 text-pretty">
              Periksa rincian setoran sebelum menyimpan pencatatan.
            </p>

            <Card variant="inset" className="p-4 flex flex-col gap-2.5 text-sm">
              <div><span className="text-text-3 font-semibold">Tenant:</span> <strong className="text-text font-bold">{selectedTenantObj?.nama} ({selectedTenantObj?.kios})</strong></div>
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
                    <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin size-5" />
                    <span>Menyimpan...</span>
                  </span>
                ) : (
                  'Simpan Setoran'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
            
            {/* SEARCHABLE & FILTERABLE TENANT COMBOMOX */}
            <div className="flex flex-col gap-2" ref={dropdownRef}>
              <label className="text-sm font-extrabold text-text flex items-center justify-between">
                <span>Pilih Tenant Kios <span className="text-red">*</span></span>
                {tenantData.length > 0 && (
                  <span className="text-xs font-semibold text-text-3">
                    Total {tenantData.length} Kios Terdaftar
                  </span>
                )}
              </label>

              {selectedTenantObj ? (
                /* SELECTED TENANT CARD */
                <div className="p-3.5 sm:p-4 rounded-xl border border-red/30 bg-red-50/50 flex items-center justify-between gap-3 shadow-xs animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-red text-white font-extrabold text-sm rounded-lg shadow-xs font-tabular-nums">
                      {selectedTenantObj.kios}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-text text-sm sm:text-base leading-tight">
                        {selectedTenantObj.nama}
                      </h4>
                      <p className="text-xs text-text-2 font-medium mt-0.5">
                        Lantai {selectedTenantObj.lantai} • {selectedTenantObj.usaha}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleClearSelectedTenant}
                    className="h-8.5 px-3 text-xs font-bold text-red border-red/20 hover:bg-red-100"
                  >
                    <Icon icon="heroicons:arrow-path-20-solid" className="size-3.5 me-1" />
                    Ganti Kios
                  </Button>
                </div>
              ) : (
                /* SEARCH & FILTER CONTROLS */
                <div className="relative flex flex-col gap-2">
                  {/* Filter Tabs */}
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {[
                      { id: 'Semua', label: 'Semua Kios' },
                      { id: 'Lantai 1', label: 'Lantai 1' },
                      { id: 'Lantai 2', label: 'Lantai 2' },
                      { id: 'Terisi', label: 'Hanya Kios Terisi' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setFloorFilter(tab.id);
                          setIsDropdownOpen(true);
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border",
                          floorFilter === tab.id
                            ? "bg-red text-white border-red shadow-xs"
                            : "bg-warm-gray/60 text-text-2 border-border hover:bg-warm-gray hover:text-text"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Input & Dropdown Container */}
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-text-3">
                      <Icon icon="heroicons:magnifying-glass-20-solid" className="size-5" />
                    </div>
                    <input
                      type="text"
                      role="combobox"
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="listbox"
                      aria-controls="tenant-combobox-list"
                      aria-label="Cari nomor kios atau nama tenant untuk setoran tunai"
                      placeholder="Cari no. kios (misal: A1-05) atau nama tenant (misal: Ahmad)..."
                      value={tenantSearchQuery}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setTenantSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                        if (tenantError) setTenantError(null);
                      }}
                      className={cn(
                        "w-full h-11 ps-10 pe-10 rounded-md border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red transition-all shadow-xs",
                        tenantError ? "border-red ring-1 ring-red" : "border-border"
                      )}
                    />
                    {tenantSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTenantSearchQuery('')}
                        aria-label="Bersihkan pencarian"
                        className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-3 hover:text-text cursor-pointer"
                      >
                        <Icon icon="heroicons:x-mark-20-solid" className="size-4.5" />
                      </button>
                    )}

                    {/* Dropdown Floating Results - Placed directly below the search input */}
                    {isDropdownOpen && (
                      <div
                        id="tenant-combobox-list"
                        role="listbox"
                        aria-label="Daftar Tenant Terdaftar"
                        className="absolute top-full mt-1.5 inset-x-0 z-50 bg-white border border-border rounded-xl shadow-2xl max-h-64 overflow-y-auto page-fade-in divide-y divide-border/60"
                      >
                        {filteredTenants.length === 0 ? (
                          <div className="p-4 text-center text-xs font-semibold text-text-3">
                            <Icon icon="heroicons:user-minus-20-solid" className="size-6 mx-auto mb-1 text-text-3/60" />
                            Tidak ada tenant atau nomor kios yang cocok.
                          </div>
                        ) : (
                          filteredTenants.map((tenant) => {
                            const isOccupied = tenant.status === 'Terisi' && tenant.nama !== 'Kios Kosong';
                            return (
                              <button
                                key={tenant.id}
                                type="button"
                                role="option"
                                aria-selected={false}
                                onClick={() => handleSelectTenant(tenant)}
                                className="w-full p-3 text-start flex items-center justify-between gap-3 hover:bg-warm-gray/40 active:bg-warm-gray transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className={cn(
                                    "px-2.5 py-1 text-xs font-extrabold rounded-md font-tabular-nums shrink-0",
                                    isOccupied ? "bg-red-50 text-red border border-red/20" : "bg-warm-gray text-text-3"
                                  )}>
                                    {tenant.kios}
                                  </span>
                                  <div className="truncate">
                                    <div className="text-sm font-bold text-text truncate">
                                      {tenant.nama}
                                    </div>
                                    <div className="text-xs text-text-3 font-medium truncate">
                                      Lantai {tenant.lantai} • {tenant.usaha}
                                    </div>
                                  </div>
                                </div>

                                <span className={cn(
                                  "text-[11px] font-extrabold px-2 py-0.5 rounded-full shrink-0",
                                  isOccupied ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-mono-100 text-mono-600"
                                )}>
                                  {isOccupied ? 'Terisi' : 'Kosong'}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tenantError && (
                <p className="text-xs font-bold text-red mt-1 animate-fade-in">
                  {tenantError}
                </p>
              )}
            </div>

            {/* STATUS TAGIHAN AKTIF CARD */}
            {selectedTenantId && (
              <div className="page-fade-in">
                {isBillsLoading ? (
                  <div className="p-4 bg-warm-gray/50 border border-border rounded-lg flex items-center gap-3 text-xs text-text-2 font-bold animate-pulse">
                    <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin text-red size-4.5" />
                    <span>Mengambil data tagihan aktif tenant...</span>
                  </div>
                ) : unpaidBills.length > 0 ? (
                  <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-lg flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                      <Icon icon="heroicons:bookmark-20-solid" className="size-4.5 text-amber-700" />
                      <span>Tagihan Aktif Terdeteksi ({unpaidBills.length} Tagihan):</span>
                    </div>

                    {unpaidBills.map((bill, idx) => {
                      const isPendingVerif = bill.statusTagihan === 'Menunggu Verifikasi' || bill.statusTagihan === 'Proses Verifikasi' || bill.statusTagihan === 'Menunggu';

                      if (isPendingVerif) {
                        return (
                          <div key={bill.idTagihan || idx} className="flex flex-col gap-2.5 bg-orange-50/90 p-3.5 rounded-lg border border-orange-200 shadow-xs">
                            <div className="flex justify-between items-start text-xs font-bold text-slate-800">
                              <div>
                                <div className="font-extrabold text-text text-sm">{bill.periode}</div>
                                <span className="text-xs px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-900 font-extrabold mt-1 inline-flex items-center gap-1 border border-orange-200">
                                  <Icon icon="heroicons:clock-20-solid" className="size-3.5 text-orange" />
                                  <span>Status: Menunggu Verifikasi Transfer Bank</span>
                                </span>
                              </div>
                              <div className="text-end">
                                <span className="text-xs font-extrabold text-red font-tabular-nums">
                                  Rp {bill.totalTagihan.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-orange-950 font-medium leading-relaxed m-0 bg-white/70 p-2 rounded border border-orange-100">
                              <Icon icon="heroicons:light-bulb-20-solid" className="size-4 text-amber-600 inline me-1" />
                              <strong>Informasi:</strong> Tenant ini sudah mengunggah foto bukti transfer bank secara online dan saat ini sedang menunggu verifikasi admin.
                            </p>

                            <button
                              type="button"
                              onClick={() => navigate('/admin/verifikasi-bukti', {
                                state: {
                                  autoOpen: true,
                                  tenantNama: selectedTenantObj?.nama,
                                  idTagihan: bill.idTagihan
                                }
                              })}
                              className="mt-0.5 inline-flex items-center justify-center gap-2 bg-red hover:bg-red-rich text-white font-extrabold text-xs px-4 py-2.5 rounded-md transition-all cursor-pointer shadow-xs border-none active:scale-[0.99]"
                            >
                              <Icon icon="heroicons:arrow-top-right-on-square-20-solid" className="size-4" />
                              <span>Periksa & Verifikasi Bukti Transfer Tenant Ini</span>
                              <Icon icon="heroicons:arrow-right-20-solid" className="size-3.5 ms-1 inline" />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div key={bill.idTagihan || idx} className="flex justify-between items-center text-xs font-bold text-slate-800 bg-white p-2.5 rounded border border-amber-200">
                          <div>
                            <div className="font-extrabold text-text">{bill.periode}</div>
                            <span className="text-2.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold mt-0.5 inline-block">
                              {bill.statusTagihan}
                            </span>
                          </div>
                          <div className="text-end">
                            <span className="text-xs font-extrabold text-red font-tabular-nums">
                              Rp {bill.totalTagihan.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-start gap-3 text-xs font-medium text-emerald-900">
                    <Icon icon="heroicons:check-circle-20-solid" className="size-5.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold text-emerald-950 block text-sm mb-0.5">Tidak Ada Tagihan Aktif / Tunggakan</strong>
                      <span>Tenant <strong>{selectedTenantObj?.nama} ({selectedTenantObj?.kios})</strong> saat ini tidak memiliki tunggakan sewa (seluruh tagihan berstatus Lunas).</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <FormField label="Nominal Tunai (Rp)" id="setoran-nominal" required error={nominalError}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 1.500.000"
                value={nominalTunai ? Number(String(nominalTunai).replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                onChange={(e) => { 
                  const cleanDigits = e.target.value.replace(/\D/g, '');
                  setNominalTunai(cleanDigits); 
                  if (nominalError) setNominalError(null); 
                }}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-extrabold font-tabular-nums text-text focus:bg-white transition-colors"
              />
            </FormField>

            <FIFOPreview allocations={fifoAllocations} nominal={Number(nominalTunai) || 0} />

            <div className="p-3.5 bg-mono-100/60 border border-border/80 rounded-lg flex items-center gap-3 text-xs text-text-2">
              <Icon icon="heroicons:shield-check-20-solid" className="size-5 text-emerald-700 shrink-0" />
              <span>Setoran tunai otomatis dibukukan dan kuitansi SSRD ber-QR code dapat langsung dicetak.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              className="mt-2 h-13 text-base font-extrabold shadow-md"
            >
              Lanjutkan Setoran
            </Button>
          </form>
        )}
      </Card>

      {/* Modal Resi & Kuitansi SSRD Otomatis Pasca-Setoran */}
      <BuktiPembayaranModal
        isOpen={Boolean(savedReceiptData)}
        onClose={() => setSavedReceiptData(null)}
        item={savedReceiptData}
      />
    </div>
  );
}

export default SetoranTunai;
