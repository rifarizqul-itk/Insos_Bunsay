import { useContext } from 'react';
import { TenantAuthContext } from './TenantAuthProvider';

export const useTenantAuth = () => {
  const context = useContext(TenantAuthContext);
  if (!context) throw new Error('useTenantAuth harus digunakan di dalam TenantAuthProvider');
  return context;
};

export default useTenantAuth;
