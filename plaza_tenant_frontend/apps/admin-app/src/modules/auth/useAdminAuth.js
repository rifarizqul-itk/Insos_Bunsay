import { useContext } from 'react';
import { AdminAuthContext } from './AdminAuthProvider';

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth harus digunakan di dalam AdminAuthProvider');
  return context;
};

export default useAdminAuth;
