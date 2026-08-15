import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, FormField, Button, Card, FIFOPreview, BuktiPembayaranModal } from '@bunsay/shared-ui';
import { allocatePaymentFIFO } from '@bunsay/shared-core';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function SetoranTunai() {
  const navigate = useNavigate();
  const { httpClient } = useAdminAuth();
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [jenisTagihan] = useState('Setoran Tunai Loket Pengelola');
  const [nominalTunai, setNominalTunai] = useState('');
  const [buktiTunai, setBuktiTunai] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fifoAllocations, setFifoAllocations] = useState([]);
  const [tenantError, setTenantError] = useState(null);
  const [nominalError, setNominalError] = useState(null);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const [tenantData, setTenantData] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [isBillsLoading, setIsBillsLoading] = useState(false);
  const [targetTagihanId, setTargetTagihanId] = useState(null);

  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await httpClient.get('/api/v1/admin/kios');
        const raw = response?.data?.data || (Array.isArray(response?.data) ? response.data : []);
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((item, idx) => {
            const activeSewa = item.sewa && Array.isArray(item.sewa) && item.sewa.length > 0 ? item.sewa[0] : null;
            const pemilik = activeSewa?.pemilik || null;
            return {
              id: item.Id_Kios || item.id || idx + 1,
              idPemilik: pemilik?.Id_Pemilik || item.Id_Pemilik || idx + 1,
              nama: pemilik?.Nama || (item.Status === 'Terisi' ? 'Penyewa Kios' : 'Kios Kosong'),
              kios: item.No_Kios || `B-${1000 + idx}`
            };
          });
          setTenantData(mapped);
        } else {
          setTenantData(fallbackTenants);
        }
      } catch (err) {
        console.warn('Backend fetch tenant list fallback:', err);
        setTenantData(fallbackTenants);
      }
    }
    fetchTenants();
  }, [httpClient]);

  const fallbackTenants = [
    { id: 1, idPemilik: 1, nama: 'Hj. Yuliana', kios: 'B-1001' },
    { id: 2, idPemilik: 2, nama: 'Bpk. Hendra Kurniawan', kios: 'B-1003' },
    { id: 3, idPemilik: 3, nama: 'Ibu Eva Tauresea', kios: 'B-1004' }
  ];

  // Auto-fetch active bills when tenant is selected
  useEffect(() => {
    if (!selectedTenantId) {
      setUnpaidBills([]);
      setTargetTagihanId(null);
      setNominalTunai('');
      return;
    }

    const selectedObj = tenantData.find(t => String(t.id) === selectedTenantId);

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
        // Fallback sample active bill if API query fails
        const fallbackBill = [
          { idTagihan: 101, periode: 'Sewa Kios Periode Mei 2026', tarifSewa: 450000, totalTagihan: 450000, totalTerbayar: 0, statusTagihan: 'Belum Bayar' }
        ];
        setUnpaidBills(fallbackBill);
        setTargetTagihanId(101);
        setNominalTunai('450000');
      } finally {
        setIsBillsLoading(false);
      }
    }
    fetchActiveBills();
  }, [selectedTenantId, tenantData, httpClient]);

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

  const [savedReceiptData, setSavedReceiptData] = useState(null);

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

      setToastMsg('Setoran tunai loket berhasil dicatat di database!');
      setNominalTunai('');
      setSelectedTenantId('');
      setBuktiTunai(null);
      setPreviewBukti(null);
      setShowKonfirmasi(false);
    } catch (err) {
      alert('Gagal menyimpan setoran tunai. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTenantObj = tenantData.find(t => String(t.id) === selectedTenantId);

  return (
    <div data-slot="setoran-tunai" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {toastMsg && (
        <div className="bg-emerald-600 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:check-circle-20-solid" className="size-5" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            aria-label="Tutup notifikasi"
            className="text-white hover:opacity-80 p-1 cursor-pointer"
          >
            <Icon icon="heroicons:x-mark-20-solid" className="size-4" />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Loket Setoran Tunai Admin
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Pencatatan resmi pembayaran sewa kios secara tunai di kantor pengelola.
        </p>
      </div>

      <Card variant="elevated" className="max-w-2xl p-6 sm:p-8 flex flex-col gap-6">
        {showKonfirmasi ? (
          <div className="flex flex-col gap-5 page-fade-in" role="region" aria-label="Tinjauan Konfirmasi Setoran Tunai">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Icon icon="heroicons:shield-check-20-solid" className="size-6 text-green" />
              <h2 className="text-lg font-extrabold text-text tracking-tight text-balance">
                Konfirmasi Setoran Tunai Loket
              </h2>
            </div>
            <p className="text-sm text-text-2 text-pretty">
              Mohon periksa kembali rincian setoran tunai sebelum menyimpan pencatatan transaksi secara permanen.
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
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 pl-3.5 pr-9 text-base font-bold font-tabular-nums text-text focus:bg-white transition-colors cursor-pointer"
              >
                <option value="">-- Pilih Tenant Kios --</option>
                {tenantData.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.kios} - {t.nama}
                  </option>
                ))}
              </select>
            </FormField>

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
              <span>Setoran tunai akan otomatis dibukukan lunas dan menghasilkan Kuitansi SSRD Elektronik resmi ber-QR Code untuk dicetak seketika.</span>
            </div>

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
