import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, FormField, Button, Icon } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../useAdminAuth';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.password) {
      setError('Username dan kata sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginAdmin(formData.username.trim(), formData.password);
      if (res?.accessToken) {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Login Gagal. Periksa username & kata sandi.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-slot="admin-login-page" className="min-h-dvh bg-cream flex items-center justify-center p-4 sm:p-6 font-sans">
      <Card variant="elevated" className="w-full max-w-md p-5 sm:p-7 border-border/80 rounded-2xl shadow-sm bg-white">
        <div className="text-center mb-5">
          <div className="flex justify-center mb-2.5">
            <picture>
              <source srcSet="/assets/main_logo_transparent_for_light_bg.webp" type="image/webp" />
              <img
                src="/assets/main_logo_transparent_for_light_bg.png"
                alt="Logo Resmi Plaza Kebun Sayur Balikpapan"
                loading="lazy"
                decoding="async"
                className="h-10 sm:h-11 object-contain"
              />
            </picture>
          </div>

          <div className="page-fade-in">
            <h1 className="text-xl sm:text-2xl font-bold text-red mb-1 text-balance">
              Konsol Pengelola
            </h1>
            <p className="text-text-2 text-xs sm:text-sm font-normal text-pretty">
              Masuk ke akun staf pengelola Plaza Kebun Sayur
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-3.5 rounded-lg bg-red-50 border border-red-100 text-red text-xs sm:text-sm font-semibold text-center" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 page-fade-in">
          <FormField label="Username" id="admin-login-username" required>
            <input
              type="text"
              name="username"
              placeholder="Masukkan username"
              value={formData.username}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, username: e.target.value }));
                if (error) setError('');
              }}
              autoComplete="username"
              className="w-full h-10 rounded-lg border border-border bg-warm-gray/50 px-3 text-sm text-text focus:bg-white focus:outline-none focus:border-red transition-colors"
            />
          </FormField>

          <FormField label="Kata Sandi" id="admin-login-password" required>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Masukkan kata sandi"
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                  if (error) setError('');
                }}
                autoComplete="current-password"
                className="w-full h-10 rounded-lg border border-border bg-warm-gray/50 ps-3 pe-11 text-sm text-text focus:bg-white focus:outline-none focus:border-red transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute end-0.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] size-10 flex items-center justify-center text-text-3 hover:text-text active:scale-95 transition-all focus:outline-none cursor-pointer rounded-lg"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                <Icon icon={showPassword ? 'heroicons:eye-slash-20-solid' : 'heroicons:eye-20-solid'} className="size-4.5" />
              </button>
            </div>
          </FormField>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={isSubmitting}
            className="mt-1 h-10.5 text-sm font-bold shadow-xs"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin size-4" />
                <span>Memproses...</span>
              </span>
            ) : 'Masuk'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default AdminLoginPage;
