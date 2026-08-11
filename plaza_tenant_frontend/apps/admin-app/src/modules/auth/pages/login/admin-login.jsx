import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, FormField, Button, Icon } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../useAdminAuth';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAdminAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(formData);
      if (res?.accessToken) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message;
      setError(errMsg || 'Login Gagal. Periksa username & kata sandi.');
    }
  };

  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center p-4 sm:p-6 font-sans">
      <Card variant="elevated" className="w-full max-w-[440px] p-6 sm:p-8 border-border/80">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <picture>
              <source srcSet="/assets/main_logo_transparent_for_light_bg.webp" type="image/webp" />
              <img
                src="/assets/main_logo_transparent_for_light_bg.png"
                alt="Logo Resmi Plaza Kebun Sayur Balikpapan"
                loading="lazy"
                decoding="async"
                className="h-12 object-contain"
              />
            </picture>
          </div>

          <div className="page-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-red tracking-tight mb-1 text-balance">
              Konsol Pengelola
            </h1>
            <p className="text-text-2 text-sm font-medium text-pretty">
              Masuk ke akun administrator resmi Plaza Kebun Sayur
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-red-50 border border-red-100 text-red text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 page-fade-in">
          <FormField label="Username Admin" id="admin-login-username" required>
            <input
              type="text"
              name="username"
              placeholder="Masukkan username admin"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              autoComplete="username"
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors"
            />
          </FormField>

          <FormField label="Kata Sandi" id="admin-login-password" required>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Masukkan kata sandi"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                autoComplete="current-password"
                className="w-full h-11 rounded-md border border-border bg-warm-gray/50 pl-3.5 pr-11 text-base focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text p-1 focus:outline-none"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                <Icon icon={showPassword ? 'heroicons:eye-slash-20-solid' : 'heroicons:eye-20-solid'} width="20" height="20" />
              </button>
            </div>
          </FormField>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={isLoading}
            className="mt-2 h-12 text-base font-extrabold shadow-md"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Icon icon="heroicons:arrow-path-20-solid" className="animate-spin" width="18" height="18" />
                <span>Memproses...</span>
              </span>
            ) : 'Masuk Konsol Admin'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default AdminLoginPage;
