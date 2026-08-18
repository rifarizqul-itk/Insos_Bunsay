import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTenantAuth } from '../../useTenantAuth';
import { FormField, Button, Card, Icon } from '@bunsay/shared-ui';

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useTenantAuth();

  const isForgotMode = location.pathname === '/auth/lupa-sandi';

  const [formData, setFormData] = useState({ username: '', kataSandi: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const [identifier, setIdentifier] = useState('');
  const [forgotError, setForgotError] = useState(null);
  const [isForgotSent, setIsForgotSent] = useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  useEffect(() => {
    setUsernameError(null);
    setPasswordError(null);
    setForgotError(null);
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
    let hasError = false;
    if (!formData.username) {
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
      const res = await login(formData.username, formData.kataSandi);
      if (res?.accessToken) {
        navigate('/tenant/dashboard');
      } else {
        setUsernameError(res?.message || 'Username atau kata sandi salah.');
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message;
      if (errMsg) {
        setUsernameError(errMsg);
      } else if (err?.response?.status === 401 || err?.response?.status === 422) {
        setUsernameError('Username atau kata sandi yang Anda masukkan salah.');
      } else {
        setUsernameError('Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda atau coba lagi nanti.');
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const timerRef = React.useRef(null);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!identifier || identifier.trim().length === 0) {
      setForgotError('Masukkan username atau alamat email Anda.');
      return;
    }

    setForgotError(null);
    setIsForgotSubmitting(true);

    timerRef.current = setTimeout(() => {
      setIsForgotSubmitting(false);
      setIsForgotSent(true);
    }, 800);
  };

  return (
    <div data-slot="auth-page" className="min-h-dvh bg-cream flex items-center justify-center p-4 sm:p-6 font-sans">
      <Card variant="elevated" className="w-full max-w-md p-6 sm:p-8 border-border/80">
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

          <div key={isForgotMode ? 'title-forgot' : 'title-login'} className="page-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-red tracking-tight mb-1 text-balance">
              {isForgotMode ? 'Lupa Kata Sandi' : 'Login Tenant'}
            </h1>
            <p className="text-text-2 text-sm font-medium text-pretty">
              {isForgotMode 
                ? 'Masukkan username atau email Anda untuk menerima tautan reset kata sandi.'
                : 'Masuk ke Akun Sewa Kios Plaza Kebun Sayur'}
            </p>
          </div>
        </div>

        {!isForgotMode ? (
          <form key="form-login" onSubmit={handleLoginSubmit} className="flex flex-col gap-4 page-fade-in">
            <FormField label="Username" id="auth-username-input" required error={usernameError}>
              <input
                type="text"
                name="username"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white focus:ring-2 focus:ring-red/30 transition-colors"
              />
            </FormField>

            <FormField label="Kata Sandi" id="auth-password-input" required error={passwordError}>
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="kataSandi"
                  placeholder="Masukkan kata sandi Anda"
                  value={formData.kataSandi}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 ps-3.5 pe-12 text-base focus:bg-white focus:ring-2 focus:ring-red/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute end-0.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] size-11 flex items-center justify-center text-text-3 hover:text-text active:scale-95 transition-all focus:outline-none cursor-pointer rounded-md"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  <Icon icon={showPassword ? 'heroicons:eye-slash-20-solid' : 'heroicons:eye-20-solid'} className="size-5" />
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between mt-1 text-sm">
              <label className="flex items-center gap-2 font-semibold text-text-2 cursor-pointer select-none min-h-[44px] py-1">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4.5 accent-red cursor-pointer rounded"
                />
                <span>Ingat Saya</span>
              </label>
              <Link
                to="/auth/lupa-sandi"
                className="text-red hover:underline font-semibold text-sm transition-colors min-h-[44px] inline-flex items-center px-1"
              >
                Lupa Kata Sandi?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isLoginLoading}
              className="mt-2 h-12 text-base font-extrabold shadow-md"
            >
              {isLoginLoading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin size-4.5" />
                  <span>Memproses...</span>
                </span>
              ) : 'Masuk'}
            </Button>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 text-text-2 hover:text-red font-semibold text-sm transition-colors py-1 mt-1"
            >
              <Icon icon="heroicons:arrow-left-20-solid" className="size-4.5" />
              <span>Kembali ke Beranda Utama</span>
            </Link>
          </form>
        ) : isForgotSent ? (
          <div key="form-forgot-sent" className="flex flex-col gap-4 text-center page-fade-in" role="status" aria-live="polite">
            <div className="bg-green-bg/60 border border-green/30 rounded-xl p-4 text-start flex flex-col gap-2">
              <div className="flex items-center gap-2 text-green font-bold text-sm sm:text-base">
                <Icon icon="heroicons:check-circle-20-solid" className="size-5" />
                <span className="text-balance">Instruksi Pemulihan Dikirim</span>
              </div>
              <p className="text-xs sm:text-sm text-text leading-relaxed text-pretty">
                Jika username atau email terdaftar, instruksi telah dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => { setIsForgotSent(false); navigate('/auth'); }}
              className="h-11 text-base font-extrabold shadow-md gap-2"
            >
              <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
              <span>Kembali ke Halaman Login</span>
            </Button>
          </div>
        ) : (
          <form key="form-forgot" onSubmit={handleForgotSubmit} className="flex flex-col gap-4 page-fade-in">
            <FormField label="Username atau Alamat Email" id="forgot-identifier-input" required error={forgotError}>
              <input
                type="text"
                placeholder="Contoh: yuliana atau yuliana@email.com"
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
                  <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin size-4.5" />
                  <span>Mengirim Tautan...</span>
                </span>
              ) : (
                'Kirim Tautan Reset'
              )}
            </Button>

            <div className="bg-cream/60 border border-border rounded-xl p-3.5 flex gap-2.5 items-start">
              <Icon icon="heroicons:information-circle-20-solid" className="size-5 text-red shrink-0 mt-0.5" />
              <div className="text-xs text-text-2 leading-relaxed">
                <strong className="text-text font-bold block mb-0.5">Butuh Bantuan Pengelola?</strong>
                Hubungi <strong>WhatsApp (0811-5901-119)</strong> atau datang ke <strong>Kantor Pengelola Lt. 3</strong>.
              </div>
            </div>

            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 text-text-2 hover:text-red font-semibold text-sm transition-colors py-1 mt-1"
            >
              <Icon icon="heroicons:arrow-left-20-solid" className="size-4.5" />
              <span>Kembali ke Halaman Login</span>
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
}

export default AuthPage;
