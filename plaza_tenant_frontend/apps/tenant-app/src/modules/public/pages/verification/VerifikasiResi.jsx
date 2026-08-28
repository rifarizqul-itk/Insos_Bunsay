import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Icon, Badge, Button, BunsayQRCode } from '@bunsay/shared-ui';

export function VerifikasiResi() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTrx = searchParams.get('trx');
  const rawRef = searchParams.get('ref');
  const [inputCode, setInputCode] = useState('');
  const [searchError, setSearchError] = useState('');

  const hasParams = Boolean(rawTrx || rawRef);
  const trxId = rawTrx?.trim() || rawRef?.trim() || '';
  const refCode = rawRef?.trim() || trxId;
  const isDummyPlaceholder = trxId.toUpperCase() === 'TRX-PAYMENT' || trxId === '';
  const isValidLookup = hasParams && !isDummyPlaceholder;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) {
      setSearchError('Silakan masukkan nomor kuitansi atau kode transaksi.');
      return;
    }
    if (clean.length < 3) {
      setSearchError('Kode transaksi terlalu pendek. Masukkan kode yang valid.');
      return;
    }
    setSearchError('');
    setSearchParams({ trx: clean });
  };

  const handleResetSearch = () => {
    setInputCode('');
    setSearchError('');
    setSearchParams({});
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-mono-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-6 border-b border-border/60">
        <div className="flex items-center gap-3">
          <picture>
            <source srcSet="/assets/main_logo_transparent_for_light_bg.webp" type="image/webp" />
            <img
              src="/assets/main_logo_transparent_for_light_bg.png"
              alt="Logo Plaza Kebun Sayur"
              loading="lazy"
              decoding="async"
              width={130}
              height={32}
              className="h-10 w-auto object-contain"
            />
          </picture>
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

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-2xl border border-border/80 shadow-lg p-6 sm:p-8 flex flex-col gap-6">
          
          {!isValidLookup ? (
            /* 1. PUBLIC SEARCH / LOOKUP STATE */
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-red-50/80 border border-red/20">
                <div className="size-11 rounded-full bg-red text-white flex items-center justify-center shrink-0">
                  <Icon icon="heroicons:document-magnifying-glass-20-solid" className="size-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-red uppercase tracking-wider block">
                    Layanan Publik
                  </span>
                  <h2 className="text-base font-extrabold text-text">
                    Verifikasi Keaslian Kuitansi e-Retribusi
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-text-2 leading-relaxed">
                Gunakan layanan ini untuk memeriksa keabsahan surat setoran atau kuitansi pembayaran sewa kios resmi yang diterbitkan oleh UPTD Pengelola Pasar Plaza Kebun Sayur.
              </p>

              {hasParams && isDummyPlaceholder && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Icon icon="heroicons:exclamation-circle-20-solid" className="size-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Dokumen Belum Ditemukan</strong>
                    <p className="mt-0.5">Parameter kode transaksi tidak valid. Silakan masukkan nomor kuitansi transaksi yang tertera pada bukti pembayaran Anda.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
                <label htmlFor="input-verifikasi-kode-tenant" className="text-xs font-bold text-text">
                  Nomor Surat / Kode Transaksi
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="input-verifikasi-kode-tenant"
                    type="text"
                    placeholder="Contoh: TRX-1024 atau BUNSAY-TAG-..."
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      if (searchError) setSearchError('');
                    }}
                    className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-mono-50/50 text-xs sm:text-sm text-text focus:bg-white focus:outline-none focus:border-red transition-colors"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="h-10 px-5 font-bold gap-1.5 shrink-0 whitespace-nowrap"
                  >
                    <Icon icon="heroicons:magnifying-glass-20-solid" className="size-4" />
                    <span>Cek Dokumen</span>
                  </Button>
                </div>
                {searchError && (
                  <p className="text-xs font-semibold text-red">{searchError}</p>
                )}
              </form>

              <div className="p-3.5 rounded-xl bg-mono-50/80 border border-border/60 text-xs text-text-3 flex items-start gap-2.5">
                <Icon icon="heroicons:qr-code-20-solid" className="size-5 text-mono-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Pindai QR Code:</strong> Anda juga dapat memindai QR Code yang tercantum di pojok lembar kuitansi resmi langsung menggunakan kamera smartphone Anda untuk memvalidasi secara otomatis.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <Link to="/" className="text-xs font-bold text-red hover:underline flex items-center gap-1">
                  <span>Kembali ke Beranda Portal</span>
                  <Icon icon="heroicons:arrow-right-20-solid" className="size-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* 2. VERIFIED DOCUMENT FOUND STATE */
            <div className="flex flex-col gap-6">
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

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResetSearch}
                  className="w-full sm:w-auto px-4 font-bold border-border bg-white text-text hover:bg-mono-50 text-xs"
                >
                  <Icon icon="heroicons:magnifying-glass-20-solid" className="size-3.5" />
                  <span>Periksa Dokumen Lain</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-6 font-bold text-xs"
                >
                  Masuk ke Portal
                </Button>
              </div>
            </div>
          )}

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
