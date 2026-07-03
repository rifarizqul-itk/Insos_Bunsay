import { mockDelay } from './client';

export const verifyTransaction = async (id, status, alasan = null) => {
  return mockDelay({
    success: true,
    id,
    status,
    alasan
  });
};

export const recordCashPayment = async (payload) => {
  // payload: { tenantId, jenisTagihan, nominal, bukti }
  return mockDelay({
    success: true,
    id: `CASH-${Date.now()}`
  });
};

export const exportReport = async (bulan, tahun) => {
  return mockDelay({
    url: '/downloads/report.xlsx' // simulasi
  });
};
