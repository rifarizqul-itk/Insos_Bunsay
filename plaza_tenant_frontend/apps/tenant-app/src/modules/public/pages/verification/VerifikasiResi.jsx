import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Icon, Badge, Button } from '@bunsay/shared-ui';

export function VerifikasiResi() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTrx = searchParams.get('trx');
  const rawRef = searchParams.get('ref');

  const queryCode = rawTrx?.trim() || rawRef?.trim() || '';
  const isDummyCode = queryCode.toUpperCase() === 'TRX-PAYMENT' || queryCode === '';

  const [inputCode, setInputCode] = useState('');
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ? import.meta.env.VITE_API_URL : '';

  useEffect(() => {
    if (!queryCode || isDummyCode) {
      setVerifyResult(null);
      setVerifyError('');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setVerifyError('');
    setVerifyResult(null);

    const checkVerification = async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/public/verifikasi-resi?code=${encodeURIComponent(queryCode)}`, {
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.valid === true) {
          setVerifyResult(data.data);
          setVerifyError('');
        } else {
          setVerifyResult(null);
          setVerifyError(data.message || 'Dokumen pembayaran tidak ditemukan atau belum sah.');
        }
      } catch (err) {
        if (!isMounted) return;
        setVerifyResult(null);
        setVerifyError('Tidak dapat terhubung ke server verifikasi. Periksa koneksi internet Anda.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkVerification();

    return () => {
      isMounted = false;
    };
  }, [queryCode, isDummyCode, apiBase]);

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
    setVerifyError('');
    setVerifyResult(null);
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
          
          {loading ? (
            /* 1. LOADING / VALIDATING STATE */
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <div className="size-10 border-3 border-red/20 border-t-red rounded-full animate-spin" />
              <div>
                <h2 className="text-sm font-bold text-text">Memvalidasi Dokumen...</h2>
                <p className="text-xs text-text-3 mt-0.5">Memeriksa keaslian bukti ke database resmi</p>
              </div>
            </div>
          ) : verifyResult ? (
            /* 2. AUTHENTICATED & VALIDATED CERTIFICATE STATE */
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
                  <span className="font-mono font-bold text-text text-xs sm:text-sm">{verifyResult.no_kuitansi}</span>
                </div>
                {verifyResult.referensi && verifyResult.referensi !== verifyResult.no_kuitansi && (
                  <div className="flex justify-between items-center px-3.5 py-2.5">
                    <span className="text-text-3 font-medium">Referensi Transaksi</span>
                    <span className="font-mono text-mono-700 text-[11px]">{verifyResult.referensi}</span>
                  </div>
                )}
                {verifyResult.unit_kios && verifyResult.unit_kios !== '-' && (
                  <div className="flex justify-between items-center px-3.5 py-2.5">
                    <span className="text-text-3 font-medium">Unit Kios</span>
                    <strong className="text-text font-semibold">{verifyResult.unit_kios}</strong>
                  </div>
                )}
                <div className="flex justify-between items-center px-3.5 py-2.5">
                  <span className="text-text-3 font-medium">Tanggal Pembayaran</span>
                  <span className="text-text font-medium">{verifyResult.tanggal_bayar}</span>
                </div>
                <div className="flex justify-between items-center px-3.5 py-2.5">
                  <span className="text-text-3 font-medium">Nominal Retribusi</span>
                  <strong className="text-text font-bold">
                    Rp {Number(verifyResult.total_bayar || 0).toLocaleString('id-ID')}
                  </strong>
                </div>
                <div className="flex justify-between items-center px-3.5 py-2.5">
                  <span className="text-text-3 font-medium">Metode Pembayaran</span>
                  <span className="text-text font-medium">{verifyResult.metode_bayar}</span>
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
          ) : (
            /* 3. PUBLIC SEARCH / ERROR FORM STATE */
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text">
                  Verifikasi Bukti Pembayaran
                </h2>
                <p className="text-xs sm:text-sm text-text-2 mt-1">
                  Periksa keaslian kuitansi atau surat setoran retribusi resmi.
                </p>
              </div>

              {verifyError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
                  <Icon icon="heroicons:x-circle-20-solid" className="size-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-red-950 block">Dokumen Tidak Valid / Tidak Terdaftar</strong>
                    <p className="mt-0.5 text-red-800 leading-relaxed">{verifyError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2.5 mt-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Nomor kuitansi / kode transaksi (mis: TRX-1)"
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
