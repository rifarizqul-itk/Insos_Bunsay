import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTenantAuth } from '../../TenantAuthProvider';
import { FormField, Button, Card, Icon } from '@bunsay/shared-ui';
import { httpClient } from '@bunsay/shared-core';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, isHydrated } = useTenantAuth();

  const isForgotMode = location.pathname === '/auth/lupa-sandi';

  // Jika sudah login, langsung arahkan ke Dashboard Tenant
  useEffect(() => {
    if (isHydrated && isLoggedIn && !isForgotMode) {
      navigate('/tenant/dashboard', { replace: true });
    }
  }, [isHydrated, isLoggedIn, isForgotMode, navigate]);

  const [formData, setFormData] = useState({ username: '', kataSandi: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Rate Limiting 3x Attempts
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Forgot password & OTP states
  const [identifier, setIdentifier] = useState('');
  const [forgotError, setForgotError] = useState(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'verify' | 'success'
  const [resetUserId, setResetUserId] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  // Cooldown timer countdown for 3x failed attempts lock
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  useEffect(() => {
    setUsernameError(null);
    setPasswordError(null);
    setForgotError(null);
    setOtpError(null);
    setForgotStep('request');
  }, [isForgotMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'username' && usernameError) setUsernameError(null);
    if (name === 'kataSandi' && passwordError) setPasswordError(null);
  };

  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (lockoutSeconds > 0) {
      setUsernameError(`Akun terkunci sementara. Silakan tunggu ${lockoutSeconds} detik atau gunakan fitur Lupa Kata Sandi.`);
      return;
    }

    let hasError = false;
    if (!formData.username || !formData.username.trim()) {
      setUsernameError('Username wajib diisi.');
      hasError = true;
    }
    if (!formData.kataSandi) {
      setPasswordError('Kata sandi Anda wajib diisi.');
      hasError = true;
    }
    if (hasError) return;

    setIsLoginLoading(true);
    try {
      const res = await login(formData.username.trim(), formData.kataSandi);
      if (res?.accessToken) {
        setLoginAttempts(0);
        setLockoutSeconds(0);
        navigate('/tenant/dashboard');
      } else {
        const nextAttempts = loginAttempts + 1;
        setLoginAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setLockoutSeconds(60);
          setUsernameError('Batas percobaan login gagal (3 kali) terlampaui. Akun dikunci sementara selama 60 detik.');
        } else {
          const sisa = 3 - nextAttempts;
          setUsernameError(`Username atau kata sandi salah. Sisa percobaan: ${sisa} kali.`);
        }
      }
    } catch (err) {
      const respData = err.response?.data;
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);

      if (respData?.isLocked || respData?.retryAfter > 0 || nextAttempts >= 3) {
        setLockoutSeconds(respData?.retryAfter || 60);
        setUsernameError(respData?.message || 'Terlalu banyak percobaan login gagal (Maksimal 3 kali). Silakan coba lagi setelah 60 detik.');
      } else if (respData?.message) {
        setUsernameError(respData.message);
      } else if (err.response?.status === 401 || err.response?.status === 422) {
        const sisa = Math.max(0, 3 - nextAttempts);
        setUsernameError(`Username atau kata sandi salah. Sisa percobaan: ${sisa} kali.`);
      } else {
        setUsernameError('Tidak dapat terhubung ke server auth. Pastikan backend Laravel berjalan.');
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    const val = identifier.trim();
    if (!val) {
      setForgotError('Masukkan nomor WhatsApp atau alamat email Anda.');
      return;
    }

    // Jika input berupa format email (ada @), validasi format email resmi
    if (val.includes('@') && !EMAIL_REGEX.test(val)) {
      setForgotError('Format alamat email tidak valid (contoh: nama@domain.com).');
      return;
    }

    setForgotError(null);
    setIsForgotSubmitting(true);

    try {
      const res = await httpClient.post('/api/v1/tenant/auth/forgot-password', {
        identifier: val,
      });

      const data = res?.data ?? res;

      if (data?.success) {
        setResetUserId(data.userId);
        setMaskedEmail(data.maskedEmail);
        setForgotStep('verify');
      } else {
        setForgotError(data?.message || 'Gagal mengirim kode verifikasi.');
      }
    } catch (err) {
      setForgotError(err?.message || err?.response?.data?.message || 'Pengguna, nomor WhatsApp, atau email tidak ditemukan.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Masukkan 6 digit kode verifikasi.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setOtpError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setOtpError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setOtpError(null);
    setIsResetSubmitting(true);

    try {
      const res = await httpClient.post('/api/v1/tenant/auth/reset-password', {
        userId: resetUserId,
        otp: otpCode.trim(),
        kataSandiBaru: newPassword,
      });

      const data = res?.data ?? res;

      if (data?.success) {
        setForgotStep('success');
      } else {
        setOtpError(data?.message || 'Gagal mengatur ulang kata sandi.');
      }
    } catch (err) {
      setOtpError(err?.message || err?.response?.data?.message || 'Kode verifikasi salah atau sudah kadaluarsa.');
    } finally {
      setIsResetSubmitting(false);
    }
  };

  // Navigasi Mundur (Chrome-like Back Feature)
  const handleNavBack = () => {
    if (isForgotMode) {
      if (forgotStep === 'verify') {
        setForgotStep('request');
      } else {
        navigate('/auth');
      }
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center p-4 sm:p-6 font-sans">
      <Card variant="elevated" className="w-full max-w-[440px] p-6 sm:p-8 border-border/80 relative">
        {/* Tombol Mundur / Back hanya pada mode Lupa Kata Sandi */}
        {isForgotMode && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleNavBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-text-2 hover:text-red transition-colors py-1 px-2 rounded-md hover:bg-warm-gray/60"
              aria-label="Kembali ke halaman sebelumnya"
            >
              <Icon icon="heroicons:arrow-left-20-solid" width="16" height="16" />
              <span>{forgotStep === 'verify' ? 'Kembali' : 'Kembali ke Halaman Login'}</span>
            </button>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img 
              src="/assets/main_logo_transparent_for_light_bg.png" 
              alt="Logo Resmi Plaza Kebun Sayur Balikpapan" 
              loading="lazy"
              decoding="async"
              className="h-12 object-contain" 
            />
          </div>

          <div key={isForgotMode ? `title-forgot-${forgotStep}` : 'title-login'} className="page-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-red tracking-tight mb-1 text-balance">
              {isForgotMode ? 'Pemulihan Kata Sandi' : 'Login Tenant'}
            </h1>
            <p className="text-text-2 text-sm font-medium text-pretty">
              {!isForgotMode 
                ? 'Masuk ke Akun Sewa Kios Plaza Kebun Sayur'
                : forgotStep === 'request'
                ? 'Masukkan nomor WhatsApp atau email untuk menerima kode verifikasi.'
                : forgotStep === 'verify'
                ? `Masukkan kode verifikasi yang dikirim ke ${maskedEmail}`
                : 'Kata sandi Anda berhasil diperbarui.'}
            </p>
          </div>
        </div>

        {!isForgotMode ? (
          <form key="form-login" onSubmit={handleLoginSubmit} className="flex flex-col gap-4 page-fade-in">
            {lockoutSeconds > 0 && (
              <div className="bg-red-50 border border-red-300 text-red text-xs p-3.5 rounded-lg flex items-start gap-2.5">
                <Icon icon="heroicons:lock-closed-20-solid" width="20" height="20" className="flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold block">Akun Terkunci Sementara (Batas 3x Gagal)</strong>
                  Silakan tunggu <strong className="font-mono font-bold text-sm text-red">{lockoutSeconds} detik</strong> atau klik menu <strong>Lupa Kata Sandi</strong> di bawah.
                </div>
              </div>
            )}

            <FormField label="Username" id="auth-username-input" required error={usernameError}>
              <input
                type="text"
                name="username"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
                disabled={lockoutSeconds > 0 || isLoginLoading}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors disabled:opacity-60"
              />
            </FormField>

            <FormField label="Kata Sandi" id="auth-password-input" required error={passwordError}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="kataSandi"
                  placeholder="Masukkan kata sandi Anda"
                  value={formData.kataSandi}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  disabled={lockoutSeconds > 0 || isLoginLoading}
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 pr-11 text-base focus:bg-white transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 p-1 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  <Icon icon={showPassword ? 'heroicons:eye-slash-20-solid' : 'heroicons:eye-20-solid'} width="20" height="20" />
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between mt-1 text-sm">
              <label className="flex items-center gap-2 font-semibold text-text-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 accent-red cursor-pointer rounded"
                />
                Ingat Saya
              </label>
              <Link
                to="/auth/lupa-sandi"
                className="text-red hover:underline font-semibold text-sm transition-colors py-1"
              >
                Lupa Kata Sandi?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isLoginLoading || lockoutSeconds > 0}
              className="mt-2 h-12 text-base font-extrabold shadow-md"
            >
              {isLoginLoading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin" width="18" height="18" />
                  <span>Memproses...</span>
                </span>
              ) : lockoutSeconds > 0 ? (
                <span>Tunggu ({lockoutSeconds}d)</span>
              ) : 'Masuk'}
            </Button>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 text-text-2 hover:text-red font-semibold text-sm transition-colors py-1 mt-1"
            >
              <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
              <span>Kembali ke Beranda Utama</span>
            </Link>
          </form>
        ) : forgotStep === 'request' ? (
          <form key="form-forgot-request" onSubmit={handleForgotRequestSubmit} className="flex flex-col gap-4 page-fade-in">
            <FormField label="Nomor WhatsApp atau Email Terdaftar" id="forgot-identifier-input" required error={forgotError}>
              <input
                type="text"
                placeholder="Contoh: 081234567890 atau nama@email.com"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); if (forgotError) setForgotError(null); }}
                autoComplete="username"
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isForgotSubmitting}
              className="h-11 text-base font-extrabold shadow-md gap-2"
            >
              {isForgotSubmitting ? (
                <span role="status" className="flex items-center gap-2">
                  <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin" width="18" height="18" />
                  <span>Mengirim Kode OTP...</span>
                </span>
              ) : (
                'Kirim Kode Verifikasi'
              )}
            </Button>

            <div className="bg-cream/60 border border-border rounded-xl p-3.5 flex gap-2.5 items-start">
              <Icon icon="heroicons:information-circle-20-solid" width="20" height="20" className="text-red flex-shrink-0 mt-0.5" />
              <div className="text-xs text-text-2 leading-relaxed">
                <strong className="text-text font-bold block mb-0.5">Butuh Bantuan Pengelola?</strong>
                Hubungi <strong>WhatsApp (0811-5901-119)</strong> atau datang ke <strong>Kantor Pengelola Lt. 3</strong>.
              </div>
            </div>

            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 text-text-2 hover:text-red font-semibold text-sm transition-colors py-1 mt-1"
            >
              <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
              <span>Kembali ke Halaman Login</span>
            </Link>
          </form>
        ) : forgotStep === 'verify' ? (
          <form key="form-forgot-verify" onSubmit={handleResetSubmit} className="flex flex-col gap-4 page-fade-in">
            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red text-xs p-3 rounded-lg flex items-center gap-2">
                <Icon icon="heroicons:exclamation-circle-20-solid" width="18" height="18" className="flex-shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <FormField label="Kode Verifikasi WhatsApp/Email (6 Digit)" id="otp-input" required>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-center font-mono text-lg tracking-widest focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Kata Sandi Baru" id="new-password-input" required>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 pr-11 text-base focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(prev => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 p-1 focus:outline-none"
                  aria-label={showNewPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  <Icon icon={showNewPassword ? 'heroicons:eye-slash-20-solid' : 'heroicons:eye-20-solid'} width="20" height="20" />
                </button>
              </div>
            </FormField>

            <FormField label="Konfirmasi Kata Sandi Baru" id="confirm-password-input" required>
              <input
                type="password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isResetSubmitting}
              className="h-11 text-base font-extrabold shadow-md gap-2"
            >
              {isResetSubmitting ? (
                <span role="status" className="flex items-center gap-2">
                  <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin" width="18" height="18" />
                  <span>Menyimpan Kata Sandi...</span>
                </span>
              ) : (
                'Simpan Kata Sandi Baru'
              )}
            </Button>

            <button
              type="button"
              onClick={() => setForgotStep('request')}
              className="text-text-2 hover:text-red text-xs font-semibold text-center transition-colors py-1"
            >
              Kirim ulang kode verifikasi ke akun lain
            </button>
          </form>
        ) : (
          <div key="form-forgot-success" className="flex flex-col gap-4 text-center page-fade-in" role="status">
            <div className="bg-green-bg/60 border border-green/30 rounded-xl p-5 text-center flex flex-col items-center gap-2">
              <Icon icon="heroicons:check-circle-20-solid" width="36" height="36" className="text-green" />
              <div className="text-green font-bold text-base">
                Kata Sandi Berhasil Diperbarui!
              </div>
              <p className="text-xs sm:text-sm text-text leading-relaxed">
                Anda sekarang dapat masuk ke akun tenant Anda menggunakan kata sandi yang baru.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => navigate('/auth')}
              className="h-11 text-base font-extrabold shadow-md gap-2"
            >
              <span>Masuk Sekarang</span>
              <Icon icon="heroicons:arrow-right-20-solid" width="18" height="18" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AuthPage;
