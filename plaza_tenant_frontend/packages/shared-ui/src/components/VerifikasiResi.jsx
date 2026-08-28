import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { Badge } from './Badge';
import { Button } from './Button';

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
      setSearchError('Masukkan nomor kuitansi atau kode transaksi.');
      return;
    }
    if (clean.length < 3) {
      setSearchError('Kode transaksi terlalu pendek.');
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

  return (
    <div className="min-h-screen bg-warm-gray/40 flex flex-col justify-between p-4 sm:p-6 font-sans text-text">
      {/* Header Minimalis */}
      <header className="max-w-lg mx-auto w-full flex items-center justify-between pb-4 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <picture>
            <source srcSet="/assets/main_logo_transparent_for_light_bg.webp" type="image/webp" />
            <img
              src="/assets/main_logo_transparent_for_light_bg.png"
              alt="Plaza Kebun Sayur"
              loading="lazy"
              decoding="async"
              className="h-8 w-auto object-contain"
            />
          </picture>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-text leading-tight">
              UPTD Plaza Kebun Sayur
            </h1>
            <p className="text-[11px] text-text-3 font-normal">
              e-Retribusi Daerah Balikpapan
            </p>
          </div>
        </div>
        <Link to="/" className="text-xs font-semibold text-red hover:underline">
          Beranda &rarr;
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-lg mx-auto w-full my-auto py-6">
        <div className="bg-white rounded-2xl border border-border/80 shadow-sm p-5 sm:p-7 flex flex-col gap-5">
          
          {!isValidLookup ? (
            /* 1. PUBLIC SEARCH / FORM STATE */
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text">
                  Verifikasi Bukti Pembayaran
                </h2>
                <p className="text-xs sm:text-sm text-text-2 mt-1">
                  Periksa keaslian kuitansi atau surat setoran retribusi resmi.
                </p>
              </div>

              {hasParams && isDummyPlaceholder && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Icon icon="heroicons:exclamation-circle-20-solid" className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Kode transaksi tidak ditemukan. Periksa kembali nomor kuitansi Anda.</span>
                </div>
              )}

              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2.5 mt-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Nomor kuitansi / kode transaksi"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      if (searchError) setSearchError('');
                    }}
                    className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-warm-gray/30 text-xs sm:text-sm text-text focus:bg-white focus:outline-none focus:border-red transition-colors"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="h-10 px-4 font-bold shrink-0 whitespace-nowrap text-xs sm:text-sm"
                  >
                    Periksa
                  </Button>
                </div>
                {searchError && (
                  <p className="text-xs text-red font-medium">{searchError}</p>
                )}
              </form>

              <p className="text-[11px] text-text-3 border-t border-border/60 pt-3">
                Atau pindai QR Code pada lembar kuitansi Anda untuk verifikasi otomatis.
              </p>
            </div>
          ) : (
            /* 2. CLEAN VERIFIED CERTIFICATE STATE */
            <div className="flex flex-col gap-5">
              {/* Badge Header */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Icon icon="heroicons:check-badge-20-solid" className="size-5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-emerald-950">
                    Dokumen Sah &amp; Terdaftar
                  </h2>
                  <p className="text-[11px] text-emerald-800">
                    Kuitansi tercatat resmi di database UPTD Plaza Kebun Sayur
                  </p>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-border/80 overflow-hidden divide-y divide-border/60 text-xs">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-warm-gray/20">
                  <span className="text-text-3 font-medium">No. Kuitansi</span>
                  <span className="font-mono font-bold text-text text-xs sm:text-sm">{trxId}</span>
                </div>
                {refCode && refCode !== trxId && (
                  <div className="flex justify-between items-center px-3.5 py-2.5">
                    <span className="text-text-3 font-medium">Referensi Transaksi</span>
                    <span className="font-mono text-mono-700 text-[11px]">{refCode}</span>
                  </div>
                )}
                <div className="flex justify-between items-center px-3.5 py-2.5">
                  <span className="text-text-3 font-medium">Jenis Retribusi</span>
                  <strong className="text-text font-semibold">Sewa Kios Pasar</strong>
                </div>
                <div className="flex justify-between items-center px-3.5 py-2.5">
                  <span className="text-text-3 font-medium">Status Setoran</span>
                  <Badge status="Diterima" customText="LUNAS" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="text-xs font-semibold text-text-2 hover:text-text hover:underline cursor-pointer"
                >
                  &larr; Cek Dokumen Lain
                </button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-4 font-bold text-xs bg-warm-gray/40 border-border hover:bg-warm-gray/70"
                >
                  Ke Halaman Utama
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Ringkas */}
      <footer className="max-w-lg mx-auto w-full text-center text-[11px] text-text-3 pt-4 border-t border-border/80">
        &copy; {new Date().getFullYear()} UPTD Plaza Kebun Sayur &bull; Dinas Perdagangan Balikpapan
      </footer>
    </div>
  );
}

export default VerifikasiResi;


