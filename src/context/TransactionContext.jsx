import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TransactionContext = createContext(null);

// Mock data awal
const initialAntrean = [
  { id: 'TRX-1092', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (BNI)', waktu: '19 Mei 2026, 14:20 WITA' }
];

const initialRiwayat = [
  { id: 'TRX-1090', nama: 'Hj. Yuliana', kios: 'B-1001', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS Manual', waktu: '18 Mei 2026, 09:15 WITA', status: 'Lunas' },
  { id: 'TRX-1091', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (Mandiri)', waktu: '18 Mei 2026, 11:45 WITA', status: 'Tertolak', alasan: 'Bukti transfer tidak valid/rekayasa' }
];

export const TransactionProvider = ({ children }) => {
  const [antrean, setAntrean] = useState(initialAntrean);
  const [riwayat, setRiwayat] = useState(initialRiwayat);

  const tambahAntrean = useCallback((transaksi) => {
    setAntrean(prev => [transaksi, ...prev]);
  }, []);

  const prosesVerifikasi = useCallback((transaksiSelesai) => {
    setRiwayat(prev => [transaksiSelesai, ...prev]);
    setAntrean(prev => prev.filter(item => item.id !== transaksiSelesai.id));
  }, []);

  const tambahRiwayat = useCallback((transaksi) => {
    setRiwayat(prev => [transaksi, ...prev]);
  }, []);

  const value = {
    antrean,
    riwayat,
    tambahAntrean,
    prosesVerifikasi,
    tambahRiwayat,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransactions must be used within TransactionProvider');
  return context;
};
