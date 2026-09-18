import React, { useState, useEffect, useMemo } from 'react';
import { Icon, FormField, Button, Card, useToast, cn } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../auth/useAdminAuth';

function PengaturanDendaAdmin() {
  const { httpClient } = useAdminAuth();
  const { addToast } = useToast();

  const [isActive, setIsActive] = useState(false);
  const [type, setType] = useState('fixed'); // 'fixed' | 'percentage'
  const [nominal, setNominal] = useState('50000');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSetting = async () => {
      setIsLoading(true);
      try {
        const res = await httpClient.get('/api/v1/admin/settings/penalty');
        if (res?.data?.data) {
          setIsActive(Boolean(res.data.data.is_active));
          setType(res.data.data.type || 'fixed');
          setNominal(String(res.data.data.nominal || 50000));
        }
      } catch (err) {
        console.error('Error fetching penalty setting:', err);
        addToast('Gagal memuat konfigurasi denda keterlambatan.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSetting();
  }, [httpClient]);

  // Simulasi Perhitungan Denda Live (Contoh Tagihan Sewa Standar Rp 750.000)
  const simulation = useMemo(() => {
    const sampleBill = 750000;
    const num = parseFloat(nominal) || 0;
    if (!isActive) {
      return { sampleBill, denda: 0, total: sampleBill };
    }
    const denda = type === 'percentage' ? (sampleBill * num) / 100 : num;
    return {
      sampleBill,
      denda,
      total: sampleBill + denda,
    };
  }, [isActive, type, nominal]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await httpClient.put('/api/v1/admin/settings/penalty', {
        is_active: isActive,
        type: type,
        nominal: Number(nominal) || 0,
      });

      addToast('Pengaturan denda keterlambatan berhasil disimpan.', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal menyimpan pengaturan denda.';
      addToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div data-slot="pengaturan-denda" className="page-fade-in flex flex-col gap-6 font-sans max-w-4xl mx-auto w-full">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1 border-b border-border/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2.5">
          <Icon icon="heroicons:cog-6-tooth-20-solid" className="size-7 text-red" />
          <span>Pengaturan Denda Keterlambatan</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-3 font-medium">
          Konfigurasi otomatisasi denda apabila tenant melewati batas jatuh tempo sewa kios.
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 bg-white rounded-2xl border border-border/80 animate-pulse" />
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form Konfigurasi (Kiri) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card variant="elevated" className="p-5 sm:p-6 bg-white rounded-2xl border border-border/80 shadow-xs flex flex-col gap-5">
              
              {/* Switch Master Aktifkan Denda */}
              <div className="p-4 rounded-xl bg-mono-50 border border-border/80 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-text">
                    Status Sistem Denda Keterlambatan
                  </h3>
                  <p className="text-2xs text-text-3 font-medium mt-0.5">
                    {isActive
                      ? 'Denda aktif: tagihan yang melewati jatuh tempo akan otomatis dikenakan denda.'
                      : 'Denda non-aktif: tagihan tidak akan dibebankan denda tambahan.'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-mono-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-mono-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red"></div>
                </label>
              </div>

              {/* Tipe Denda (Hanya aktif jika switch ON) */}
              <div className={cn("flex flex-col gap-3 transition-opacity", !isActive && "opacity-50 pointer-events-none")}>
                <div>
                  <label className="block text-xs font-extrabold text-text mb-1.5">
                    Tipe Perhitungan Denda
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('fixed')}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between",
                        type === 'fixed'
                          ? "border-red bg-red-50/30 text-red ring-1 ring-red shadow-2xs"
                          : "border-border/80 bg-white text-text-2 hover:bg-mono-50"
                      )}
                    >
                      <div>
                        <span className="block font-extrabold">Nominal Tetap (Rp)</span>
                        <span className="text-2xs text-text-3 font-normal mt-0.5 block">Contoh: Rp 50.000 / tagihan</span>
                      </div>
                      {type === 'fixed' && <Icon icon="heroicons:check-circle-20-solid" className="size-4 text-red shrink-0" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setType('percentage')}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between",
                        type === 'percentage'
                          ? "border-red bg-red-50/30 text-red ring-1 ring-red shadow-2xs"
                          : "border-border/80 bg-white text-text-2 hover:bg-mono-50"
                      )}
                    >
                      <div>
                        <span className="block font-extrabold">Persentase (%)</span>
                        <span className="text-2xs text-text-3 font-normal mt-0.5 block">Contoh: 5% dari sisa tagihan</span>
                      </div>
                      {type === 'percentage' && <Icon icon="heroicons:check-circle-20-solid" className="size-4 text-red shrink-0" />}
                    </button>
                  </div>
                </div>

                {/* Input Besaran Denda */}
                <FormField
                  label={
                    <span className="text-xs font-extrabold text-text">
                      {type === 'fixed' ? 'Nominal Denda (Rupiah)' : 'Besaran Denda (Persen %)'}
                    </span>
                  }
                  id="input-besaran-denda"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-3 font-bold text-xs">
                      {type === 'fixed' ? 'Rp' : '%'}
                    </div>
                    <input
                      type="number"
                      min="0"
                      step={type === 'fixed' ? '1000' : '0.1'}
                      value={nominal}
                      onChange={(e) => setNominal(e.target.value)}
                      className="w-full h-10.5 pl-10 pr-4 rounded-xl border border-border text-sm font-extrabold bg-white text-text focus:border-red font-tabular-nums"
                      required
                    />
                  </div>
                </FormField>
              </div>

              {/* Tombol Simpan */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSaving}
                  className="w-full h-11 text-sm font-bold shadow-xs rounded-xl cursor-pointer"
                >
                  {isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Denda'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Kartu Simulasi & Catatan Kebijakan (Kanan) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Simulasi Live */}
            <Card variant="elevated" className="p-5 bg-white rounded-2xl border border-border/80 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border/80">
                <Icon icon="heroicons:calculator-20-solid" className="size-4 text-red" />
                <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">
                  Simulasi Penerapan Denda
                </h3>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center text-text-2">
                  <span>Contoh Tagihan Kios:</span>
                  <span className="font-bold font-tabular-nums text-text">
                    Rp {simulation.sampleBill.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-text-2">
                  <span>Status Tagihan:</span>
                  <span className="font-bold text-red bg-red-50 px-2 py-0.5 rounded border border-red/20 text-2xs">
                    Melewati Jatuh Tempo
                  </span>
                </div>

                <div className="flex justify-between items-center text-text-2 pt-1 border-t border-border/60">
                  <span>Denda Diterapkan:</span>
                  <span className={cn("font-bold font-tabular-nums", simulation.denda > 0 ? "text-red" : "text-mono-400")}>
                    {simulation.denda > 0 ? `+ Rp ${simulation.denda.toLocaleString('id-ID')}` : 'Rp 0 (Non-aktif)'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-extrabold text-text pt-2 border-t border-dashed border-border/80">
                  <span>Total Tagihan Baru:</span>
                  <span className="font-extrabold text-red font-tabular-nums text-base">
                    Rp {simulation.total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-text-3 font-medium bg-mono-50 p-2.5 rounded-xl border border-border/60 mt-1">
                Perhitungan ini dihitung secara dinamis saat tenant atau kasir melihat tagihan yang terlambat. Tidak mengubah riwayat tagihan yang sudah lunas.
              </p>
            </Card>

            {/* Panduan & Catatan Mitra */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col gap-1.5 text-xs text-amber-950">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Icon icon="heroicons:information-circle-20-solid" className="size-4 text-amber-700" />
                <span>Catatan Hasil Wawancara Mitra:</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-amber-900/90">
                Fitur denda dibuat fleksibel agar pihak pengelola UPTD dapat mengaktifkan kapan saja setelah rapat ketentuan besaran denda final diputuskan bersama pimpinan.
              </p>
            </div>
          </div>

        </form>
      )}
    </div>
  );
}

export default PengaturanDendaAdmin;
