import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Icon, Badge, Button, BunsayQRCode } from '@bunsay/shared-ui';

export function VerifikasiResi() {
  const [searchParams] = useSearchParams();
  const trxId = searchParams.get('trx') || 'TRX-PAYMENT';
  const refCode = searchParams.get('ref') || trxId;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-mono-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-6 border-b border-border/60">
        <div className="flex items-center gap-3">
          <img
            src="/assets/main_logo_transparent_for_light_bg.png"
            alt="Logo Plaza Kebun Sayur"
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-text leading-tight">
              UPTD Pasar Plaza Kebun Sayur
            </h1>
            <p className="text-xs text-text-3 font-medium">
              Sistem Informasi e-Retribusi Daerah Balikpapan
            </p>
          </div>
        </div>
        <Link to="/" className="text-xs font-bold text-red hover:underline">
          Portal Utama &rarr;
        </Link>
      </header>

      {/* Main Card */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-2xl border border-border/80 shadow-lg p-6 sm:p-8 flex flex-col gap-6">
          
          {/* Status Banner */}
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="size-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Icon icon="heroicons:shield-check-20-solid" className="size-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Dokumen Sah &amp; Terverifikasi
              </span>
              <h2 className="text-base font-extrabold text-emerald-950">
                Surat Setoran Retribusi Terdaftar
              </h2>
            </div>
          </div>

          {/* QR & Core Identifiers */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-mono-50/60 border border-border/60">
            <div className="shrink-0">
              <BunsayQRCode value={currentUrl} size={110} />
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-center sm:text-left min-w-0">
              <span className="text-text-3 font-medium">Nomor Surat / Kuitansi:</span>
              <span className="font-mono font-extrabold text-base text-text tracking-tight">
                {trxId}
              </span>
              <span className="text-text-3 font-medium mt-1">Kode Referensi Transaksi:</span>
              <span className="font-mono font-bold text-xs text-mono-700 break-all">
                {refCode}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-text-3 font-medium">Instansi Penerbit</span>
              <strong className="text-text font-bold">UPTD Pasar Plaza Kebun Sayur</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-text-3 font-medium">Jenis Penerimaan</span>
              <strong className="text-text font-bold">Retribusi Pemakaian Kekayaan Daerah (Kios)</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-border/60">
              <span className="text-text-3 font-medium">Status Pembayaran</span>
              <Badge status="Diterima" customText="LUNAS TERVERIFIKASI" />
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-3 font-medium">Integritas Data</span>
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <Icon icon="heroicons:check-circle-20-solid" className="size-4 text-emerald-600" />
                <span>Tervalidasi Database Sistem</span>
              </span>
            </div>
          </div>

          {/* Notice */}
          <div className="p-3.5 rounded-lg bg-mono-100/50 border border-border/60 text-[11px] text-text-3 leading-relaxed">
            Halaman ini adalah bukti publik validasi transaksi e-Retribusi resmi yang diterbitkan secara elektronik oleh UPTD Pengelola Pasar Plaza Kebun Sayur Dinas Perdagangan Kota Balikpapan.
          </div>

          {/* Action */}
          <div className="flex justify-center">
            <Link to="/tenant/dashboard">
              <Button type="button" variant="primary" size="sm" className="px-6 font-bold">
                Masuk ke Portal Tenant
              </Button>
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full text-center text-xs text-text-3 pt-6 border-t border-border/60">
        &copy; {new Date().getFullYear()} Pemerintah Kota Balikpapan &bull; Dinas Perdagangan
      </footer>
    </div>
  );
}

export default VerifikasiResi;
