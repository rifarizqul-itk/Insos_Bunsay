import React, { useState } from 'react';
import { Card, FormField, Button, Icon } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../AdminAuthProvider';

function AdminLoginPage() {
  const { login, isLoading } = useAdminAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData);
    } catch (err) {
      setError(err.message || 'Login Gagal. Periksa username & kata sandi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <Card variant="elevated" className="w-full max-w-md p-6 sm:p-8 bg-slate-900 border border-slate-800 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-red-900/40 border border-red-700/50 flex items-center justify-center text-red-400">
            <Icon icon="heroicons:shield-check-20-solid" width="28" height="28" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Konsol Administrasi Plaza</h1>
          <p className="text-sm text-slate-400">Masuk menggunakan kredensial pengelola resmi (admin.bunsayhub.id).</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Username Admin" id="admin-login-username" required>
            <input
              type="text"
              name="username"
              placeholder="Masukkan username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full h-11 rounded-md border border-slate-700 bg-slate-800 px-3.5 text-slate-100 placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </FormField>

          <FormField label="Kata Sandi" id="admin-login-password" required>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full h-11 rounded-md border border-slate-700 bg-slate-800 px-3.5 text-slate-100 placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading}
            className="mt-2 h-12 text-base font-bold bg-red-700 hover:bg-red-600 text-white border-none shadow-lg"
          >
            {isLoading ? 'Authenticating...' : 'Masuk Konsol Admin'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default AdminLoginPage;
