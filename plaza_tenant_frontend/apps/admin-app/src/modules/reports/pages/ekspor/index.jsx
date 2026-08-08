import React, { useState } from 'react';
import { Card, FormField, Button, Icon } from '@bunsay/shared-ui';

function EksporData() {
  const [bulanFilter, setBulanFilter] = useState('Mei');
  const [tahunFilter, setTahunFilter] = useState('2026');
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const handleDownloadExcel = (e) => {
    e.preventDefault();
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setToastMsg(`Berkas rekap transaksi sewa & tunggakan periode ${bulanFilter} ${tahunFilter} berhasil diunduh!`);
      setTimeout(() => setToastMsg(null), 4000);
    }, 1000);
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-green-bg border border-green/30 text-green font-bold text-sm text-center">
          {toastMsg}
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Ekspor Laporan Keuangan
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Unduh rekap transaksi sewa dan akumulasi tunggakan tenant ke berkas Excel (.xlsx).
        </p>
      </div>

      <div className="ekspor-layout-grid mobile-stack grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <Card variant="elevated" className="lg:col-span-8 p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="text-lg font-extrabold text-text tracking-tight border-b border-border pb-3 text-balance">
            Pilih Periode Laporan Keuangan
          </h3>

          <form onSubmit={handleDownloadExcel} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Bulan Laporan" id="ekspor-bulan">
                <select
                  value={bulanFilter}
                  onChange={(e) => setBulanFilter(e.target.value)}
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-semibold text-text focus:bg-white transition-colors"
                >
                  {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Tahun Laporan" id="ekspor-tahun">
                <select
                  value={tahunFilter}
                  onChange={(e) => setTahunFilter(e.target.value)}
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold font-tabular-nums text-text focus:bg-white transition-colors"
                >
                  {['2024','2025','2026'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isDownloading}
              className="h-13 px-8 text-base font-extrabold gap-2.5 shadow-md self-start"
            >
              {isDownloading ? (
                <span role="status" className="flex items-center gap-2">
                  <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin" width="20" height="20" />
                  <span>Memproses Rekap...</span>
                </span>
              ) : (
                <>
                  <Icon icon="heroicons:arrow-down-tray-20-solid" width="22" height="22" />
                  <span>Unduh Rekap Excel (.xlsx)</span>
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Informasi Lembar Rekap */}
        <Card variant="elevated" className="lg:col-span-4 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Icon icon="heroicons:table-cells-20-solid" width="22" height="22" className="text-red" />
            <h3 className="text-base font-extrabold text-text tracking-tight text-balance">Lembar Kerja (.xlsx)</h3>
          </div>

          <ul className="text-sm text-text-2 space-y-3 leading-relaxed">
            <li className="flex gap-2">
              <strong className="text-text font-bold flex-shrink-0">Sheet 1:</strong>
              <span>Rekap Seluruh Transaksi Pembayaran Sewa (Tunai, Transfer, Midtrans).</span>
            </li>
            <li className="flex gap-2">
              <strong className="text-text font-bold flex-shrink-0">Sheet 2:</strong>
              <span>Akumulasi Tunggakan Berjalan per Tenant.</span>
            </li>
            <li className="flex gap-2">
              <strong className="text-text font-bold flex-shrink-0">Sheet 3:</strong>
              <span>Rekap Pemetaan Status & Ketersediaan Unit Kios Plaza.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default EksporData;
