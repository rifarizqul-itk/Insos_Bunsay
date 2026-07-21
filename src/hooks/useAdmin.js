import { useCallback } from 'react';
import { useApi } from './useApi';
import { adminPort } from '../api/admin';

/**
 * Custom Hook untuk membaca daftar tenant admin
 */
export function useAdminTenants() {
  const getTenants = useCallback(() => adminPort.getTenants(), []);
  return useApi(getTenants, [], true);
}

/**
 * Custom Hook untuk membaca daftar utilitas kios
 */
export function useAdminKios() {
  const getKiosList = useCallback(() => adminPort.getKiosList(), []);
  return useApi(getKiosList, [], true);
}

/**
 * Custom Hook untuk membaca detail legalitas kios spesifik
 */
export function useAdminKiosDetail(kiosId) {
  const getDetail = useCallback(() => adminPort.getKiosDetail(kiosId), [kiosId]);
  return useApi(getDetail, [kiosId], !!kiosId);
}

/**
 * Custom Hook untuk pendaftaran tenant baru
 */
export function useTenantRegistration() {
  const registerTenant = useCallback(async (payload) => {
    return adminPort.createTenant(payload);
  }, []);
  return { registerTenant };
}

/**
 * Custom Hook untuk pembaruan data administrasi kios
 */
export function useKiosUpdate() {
  const updateKiosData = useCallback(async (kiosId, data) => {
    return adminPort.updateKios(kiosId, data);
  }, []);
  return { updateKiosData };
}
