import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, FormField, Badge, Table, Modal, AlokasiBreakdown, EmptyState, Icon, SkeletonTable } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function DetailKeuanganTenant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { httpClient } = useAdminAuth();

  const [tenant, setTenant] = useState(location.state?.tenant || {
    id: 1,
    nama: 'Hj. Yuliana',
    kios: 'B-1001, B-1002',
    usaha: 'Sembako & Kelontong',
    tunggakan: 3500000,
    statusPembayaran: 'Belum Bayar',
    riwayat: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    statusPembayaran: tenant.statusPembayaran || 'Belum Bayar',
    tunggakan: tenant.tunggakan || 0,
    rincianTunggakan: tenant.rincianTunggakan || '—'
  });
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    async function fetchDetailKeuangan() {
      setIsLoading(true);
      try {
        const response = await httpClient.get('/api/v1/admin/pembayaran');
        if (response?.data && Array.isArray(response.data)) {
          const raw = response.data;
          const mappedHistory = raw.map(p => ({
            id: `TRX-${p.Id_Pembayaran}`,
            tanggal: p.Tanggal_Bayar || 'Terbaru',
            tagihan: `Sewa Kios ${p.tagihan?.Periode || 'Berjalan'}`,
            nominal: Number(p.Total_Bayar || 0),
            metode: p.Metode_Bayar || 'Transfer Bank',
            status: p.Verifikasi_Pembayaran === 'Diterima' ? 'Lunas' : 'Menunggu Verifikasi',
            alokasi: []
          }));

          setTenant(prev => ({
            ...prev,
            riwayat: mappedHistory
          }));
        }
      } catch (err) {
        console.warn('Backend fetch detail keuangan error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetailKeuangan();
  }, [httpClient]);

  useEffect(() => {
    setEditData({
      statusPembayaran: tenant.statusPembayaran || 'Belum Bayar',
      tunggakan: tenant.tunggakan || 0,
      rincianTunggakan: tenant.rincianTunggakan || '—'
    });
  }, [tenant, showEditModal]);

  const tableHeaders = [
    { label: 'ID Transaksi' },
    { label: 'Tanggal' },
    { label: 'Jenis / Ket' },
    { label: 'Nominal Bayar' },
    { label: 'Metode' },
    { label: 'Rincian Cicilan' },
    { label: 'Status' },
  ];

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    setTenant(prev => ({
      ...prev,
      statusPembayaran: editData.statusPembayaran,
      tunggakan: Number(editData.tunggakan) || 0,
      rincianTunggakan: editData.rincianTunggakan
    }));
    setShowEditModal(false);
    setToastMsg('Data keuangan tenant berhasil diperbarui.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const formatRupiah = (angka) => {
    if (typeof angka === 'string') angka = parseInt(angka.replace(/[^0-9]/g, ''), 10) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const rawTunggakan = tenant.tunggakan ?? tenant.hutangTunggakan ?? 0;
  const tunggakanValue = typeof rawTunggakan === 'number' ? rawTunggakan : parseInt(String(rawTunggakan).replace(/[^0-9]/g, ''), 10) || 0;

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {toastMsg && (
        <div className="bg-emerald-500 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:check-circle-20-solid" width="20" height="20" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-4 gap-2 font-bold"
        >
          <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
          <span>Kembali ke Daftar Tenant</span>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
              Detail Keuangan: {tenant.nama}
            </h1>
            <p className="text-text-2 text-sm sm:text-base font-medium mt-1">
              Nomor Kios: <strong className="font-tabular-nums text-red">{tenant.kios}</strong> — {tenant.usaha || '—'}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowEditModal(true)}
            className="gap-2 shadow-md self-start sm:self-auto"
          >
            <Icon icon="heroicons:pencil-square-20-solid" width="18" height="18" />
            <span>Edit Status Pembayaran</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Card variant="elevated" className="p-5 flex flex-col justify-between">
            <span className="label-micro text-text-3">Status Pembayaran Bulan Ini</span>
            <div className="mt-2">
              <Badge status={tenant.statusPembayaran} />
            </div>
          </Card>

          <Card variant="elevated" className="p-5 flex flex-col justify-between">
            <span className="label-micro text-text-3">Total Tunggakan Akumulatif</span>
            <div className={`text-2xl sm:text-3xl font-extrabold font-tabular-nums mt-1 ${tunggakanValue > 0 ? 'text-orange' : 'text-green'}`}>
              {formatRupiah(tunggakanValue)}
            </div>
          </Card>
        </div>

        <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-text tracking-tight">
            Riwayat Transaksi Tenant
          </h3>

          {isLoading ? (
            <SkeletonTable rows={3} cols={7} />
          ) : (!tenant.riwayat || tenant.riwayat.length === 0) ? (
            <EmptyState
              icon="heroicons:receipt-refund-20-solid"
              title="Belum Ada Transaksi"
              description="Tenant ini belum memiliki riwayat transaksi pembayaran."
            />
          ) : (
            <Table
              caption={`Riwayat Transaksi Keuangan Kios ${tenant.kios}`}
              ariaLabel={`Tabel Riwayat Transaksi Keuangan Tenant ${tenant.nama}`}
              headers={tableHeaders}
              colSpan={7}
            >
              {tenant.riwayat.map((row, idx) => (
                <tr key={row.id || idx} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                  <th scope="row" data-label="ID Transaksi" className="font-tabular-nums font-bold p-3 text-text text-left">
                    {row.id}
                  </th>
                  <td data-label="Tanggal" className="p-3 text-text-2 font-medium font-tabular-nums">
                    {row.tanggal || row.waktu}
                  </td>
                  <td data-label="Jenis / Ket" className="p-3 text-text font-semibold">
                    {row.tipe || row.tagihan}
                  </td>
                  <td data-label="Nominal Bayar" className="font-tabular-nums font-extrabold p-3 text-text">
                    {typeof row.nominal === 'number' ? formatRupiah(row.nominal) : row.nominal}
                  </td>
                  <td data-label="Metode" className="p-3 text-text-3 font-semibold text-xs">
                    {row.metode}
                  </td>
                  <td data-label="Rincian Cicilan" className="p-3">
                    <AlokasiBreakdown alokasiList={row.alokasi} compact={true} />
                  </td>
                  <td data-label="Status" className="p-3">
                    <Badge status={row.status} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Data Keuangan: ${tenant.nama}`}
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveEdit}
            >
              Simpan Perubahan
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="flex flex-col gap-4 font-sans">
          <FormField label="Status Pembayaran Bulan Ini" id="edit-status-pembayaran">
            <select
              name="statusPembayaran"
              value={editData.statusPembayaran}
              onChange={handleEditChange}
              className="w-full h-11 rounded-md border border-border bg-white px-3 text-sm font-semibold text-text"
            >
              <option value="Lunas">Lunas</option>
              <option value="Dicicil">Dicicil</option>
              <option value="Belum Bayar">Belum Bayar</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            </select>
          </FormField>

          <FormField label="Akumulasi Tunggakan (Rp)" id="edit-tunggakan">
            <input
              type="number"
              name="tunggakan"
              value={editData.tunggakan}
              onChange={handleEditChange}
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3 text-base font-extrabold font-tabular-nums text-text"
            />
          </FormField>

          <FormField label="Rincian / Catatan Tunggakan" id="edit-rincian-tunggakan">
            <textarea
              name="rincianTunggakan"
              value={editData.rincianTunggakan}
              onChange={handleEditChange}
              rows={3}
              className="w-full p-3 rounded-md border border-border bg-warm-gray/50 text-sm text-text resize-none"
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}

export default DetailKeuanganTenant;
