import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { authPort } from '../../api/auth';
import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Icon from '../../components/ui/Icon';

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useUI();

  const isForgotMode = location.pathname === '/auth/lupa-sandi';

  // State Login
  const [formData, setFormData] = useState({ username: '', kataSandi: '' });
  const [selectedRole, setSelectedRole] = useState('tenant');
  const [rememberMe, setRememberMe] = useState(true);
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // State Lupa Sandi
  const [identifier, setIdentifier] = useState('');
  const [forgotError, setForgotError] = useState(null);
  const [isForgotSent, setIsForgotSent] = useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Reset error & state saat berpindah mode
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

  const handleRadioKeyDown = (e, targetRole) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const nextRole = selectedRole === 'tenant' ? 'admin' : 'tenant';
      setSelectedRole(nextRole);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (targetRole) setSelectedRole(targetRole);
    }
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
      // Hit backend nyata — authPort sudah pakai RealAuthAdapter
      const result = await authPort.login({
        username: formData.username,
        password: formData.kataSandi,
      });

      if (result.success) {
        // Role ditentukan dari Id_roles backend (1 = admin, lainnya = tenant)
        await login(result.role, result, rememberMe);
        addToast(`Selamat datang, ${result.user?.Username || formData.username}!`, 'success');
        navigate(result.role === 'admin' ? '/admin/dashboard' : '/tenant/dashboard');
      } else {
        setUsernameError(result.message || 'Username atau kata sandi salah.');
        addToast(result.message || 'Login gagal. Periksa username dan kata sandi Anda.', 'error');
      }
    } catch (_) {
      addToast('Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.', 'error');
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
      addToast('Masukkan username atau alamat email Anda.', 'error');
      return;
    }

    setForgotError(null);
    setIsForgotSubmitting(true);

    timerRef.current = setTimeout(() => {
      setIsForgotSubmitting(false);
      setIsForgotSent(true);
      addToast('Instruksi pemulihan kata sandi telah dikirim jika akun terdaftar di sistem.', 'success');
    }, 800);
  };

  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center p-4 sm:p-6 font-sans">
      <Card variant="elevated" className="w-full max-w-[440px] p-6 sm:p-8 border-border/80">
        {/* Header Tetap (Logo tidak pernah unmount/hilang) */}
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
              {isForgotMode ? 'Lupa Kata Sandi' : 'Login'}
            </h1>
            <p className="text-text-2 text-sm font-medium text-pretty">
              {isForgotMode 
                ? 'Masukkan username atau email Anda untuk menerima tautan reset kata sandi.'
                : 'Masuk ke Akun Sewa Kios Plaza Kebun Sayur'}
            </p>
          </div>
        </div>

        {/* Dynamic Body Content (Hanya elemen form/isi yang berpindah secara halus) */}
        {!isForgotMode ? (
          /* FORM LOGIN */
          <form key="form-login" onSubmit={handleLoginSubmit} className="flex flex-col gap-4 page-fade-in">
            <FormField label="Username" id="auth-username-input" required error={usernameError}>
              <input
                type="text"
                name="username"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
              />
            </FormField>

            <FormField label="Kata Sandi" id="auth-password-input" required error={passwordError}>
              <input
                type="password"
                name="kataSandi"
                placeholder="Masukkan kata sandi Anda"
                value={formData.kataSandi}
                onChange={handleInputChange}
                autoComplete="current-password"
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
              />
            </FormField>

            {/* Role selector untuk simulasi */}
            <div className="flex flex-col gap-1.5">
              <span id="role-select-label" className="text-sm font-semibold text-text-2">
                Pilih Peran Login (BACKEND NANTI HAPUS INI YA)
              </span>
              <div
                role="radiogroup"
                aria-labelledby="role-select-label"
                className="flex gap-2"
              >
                <button
                  type="button"
                  role="radio"
                  tabIndex={selectedRole === 'tenant' ? 0 : -1}
                  aria-checked={selectedRole === 'tenant'}
                  onClick={() => setSelectedRole('tenant')}
                  onKeyDown={(e) => handleRadioKeyDown(e, 'tenant')}
                  className={`
                    flex-1 h-11 rounded-md font-bold text-sm transition-all duration-150 cursor-pointer
                    ${selectedRole === 'tenant' 
                      ? 'bg-red text-white border-2 border-red-dark shadow-sm' 
                      : 'bg-warm-gray/70 text-text border border-border hover:bg-warm-gray'}
                  `}
                >
                  Tenant
                </button>
                <button
                  type="button"
                  role="radio"
                  tabIndex={selectedRole === 'admin' ? 0 : -1}
                  aria-checked={selectedRole === 'admin'}
                  onClick={() => setSelectedRole('admin')}
                  onKeyDown={(e) => handleRadioKeyDown(e, 'admin')}
                  className={`
                    flex-1 h-11 rounded-md font-bold text-sm transition-all duration-150 cursor-pointer
                    ${selectedRole === 'admin' 
                      ? 'bg-red text-white border-2 border-red-dark shadow-sm' 
                      : 'bg-warm-gray/70 text-text border border-border hover:bg-warm-gray'}
                  `}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
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
              disabled={isLoginLoading}
              className="mt-2 h-12 text-base font-extrabold shadow-md"
            >
              {isLoginLoading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin" width="18" height="18" />
                  <span>Memproses...</span>
                </span>
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
        ) : isForgotSent ? (
          /* FORGOT PASSWORD SENT STATE */
          <div key="form-forgot-sent" className="flex flex-col gap-4 text-center page-fade-in" role="status" aria-live="polite">
            <div className="bg-green-bg/60 border border-green/30 rounded-xl p-4 text-left flex flex-col gap-2">
              <div className="flex items-center gap-2 text-green font-bold text-sm sm:text-base">
                <Icon icon="heroicons:check-circle-20-solid" width="20" height="20" />
                <span className="text-balance">Instruksi Pemulihan Dikirim</span>
              </div>
              <p className="text-xs sm:text-sm text-text leading-relaxed text-pretty">
                Jika username atau email terdaftar, <strong className="font-extrabold text-red">instruksi</strong> telah dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam.
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
          /* FORM LUPA KATA SANDI */
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
                  <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin" width="18" height="18" />
                  <span>Mengirim Tautan...</span>
                </span>
              ) : (
                'Kirim Tautan Reset'
              )}
            </Button>

            {/* Kotak Bantuan Pengelola */}
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
        )}
      </Card>
    </div>
  );
}

export default AuthPage;
