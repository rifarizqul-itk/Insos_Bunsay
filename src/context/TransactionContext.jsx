import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { transactionPort } from '../api/transactions';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const [antrean, setAntrean] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshState = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [queueData, historyData] = await Promise.all([
        transactionPort.query({ scope: 'QUEUE' }),
        transactionPort.query({ scope: 'HISTORY' })
      ]);
      setAntrean(queueData || []);
      setRiwayat(historyData || []);
    } catch (err) {
      setError({
        message: err?.message || 'Gagal memuat data transaksi dari server.',
        field: 'general'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const getFIFOPreview = useCallback(async (idPemilik, nominal) => {
    try {
      return await transactionPort.previewFIFO(idPemilik || 1, nominal);
    } catch (_) {
      return { allocations: [], remainingAmount: 0, updatedBills: [] };
    }
  }, []);

  const verifyTransaction = useCallback(async (id, status, alasan = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await transactionPort.execute({
        type: 'VERIFY_TRANSACTION',
        payload: { id, status, alasan }
      });

      if (!result.success) {
        setError({
          message: result.message || 'Gagal memverifikasi transaksi.',
          field: result.field
        });
        return result;
      }

      await refreshState();
      return result;
    } catch (err) {
      setError({
        message: err?.message || 'Terjadi kesalahan sistem saat memproses verifikasi.',
        field: 'general'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshState]);

  const recordCashPayment = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await transactionPort.execute({
        type: 'RECORD_CASH',
        payload
      });

      if (!result.success) {
        setError({
          message: result.message || 'Gagal mencatat setoran tunai.',
          field: result.field
        });
        return result;
      }

      await refreshState();
      return result;
    } catch (err) {
      setError({
        message: err?.message || 'Terjadi kesalahan saat menyimpan setoran tunai.',
        field: 'general'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshState]);

  const submitTenantPayment = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await transactionPort.execute({
        type: 'SUBMIT_PAYMENT',
        payload
      });

      if (!result.success) {
        setError({
          message: result.message || 'Gagal memproses pembayaran.',
          field: result.field
        });
        return result;
      }

      await refreshState();
      return result;
    } catch (err) {
      setError({
        message: err?.message || 'Terjadi kesalahan saat mengirimkan pembayaran.',
        field: 'general'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshState]);

  const exportReport = useCallback(async (period) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await transactionPort.execute({
        type: 'EXPORT_REPORT',
        payload: period
      });

      if (!result.success) {
        setError({
          message: result.message || 'Gagal mengekspor laporan.',
          field: result.field
        });
        return result;
      }

      return result;
    } catch (err) {
      setError({
        message: err?.message || 'Terjadi kesalahan saat mengekspor laporan.',
        field: 'general'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    antrean,
    riwayat,
    isLoading,
    error,
    getFIFOPreview,
    verifyTransaction,
    recordCashPayment,
    submitTenantPayment,
    exportReport,
    refreshState
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransactionDomain = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransactionDomain must be used within TransactionProvider');
  return context;
};
