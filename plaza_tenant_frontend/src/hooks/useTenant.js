import { useCallback } from 'react';
import { useApi } from './useApi';
import { tenantPort } from '../api/tenant';

/**
 * Custom Hook untuk membaca data snapshot dashboard tenant
 */
export function useTenantDashboard() {
  const getDashboard = useCallback(() => tenantPort.getDashboard(), []);
  return useApi(getDashboard, [], true);
}

/**
 * Custom Hook untuk membaca rincian tunggakan AR historis
 */
export function useTunggakanAR() {
  const getTunggakan = useCallback(() => tenantPort.getTunggakan(), []);
  return useApi(getTunggakan, [], true);
}

/**
 * Custom Hook untuk membaca & memperbarui profil tenant
 */
export function useTenantProfile() {
  const getProfile = useCallback(() => tenantPort.getProfile(), []);
  const apiState = useApi(getProfile, [], true);

  const updateProfile = useCallback(async (payload) => {
    const result = await tenantPort.updateProfile(payload);
    if (result && result.success) {
      await apiState.refetch();
    }
    return result;
  }, [apiState]);

  return {
    ...apiState,
    updateProfile
  };
}
