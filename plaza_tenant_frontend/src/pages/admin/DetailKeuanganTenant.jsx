import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import AlokasiBreakdown from '../../components/ui/AlokasiBreakdown';
import EmptyState from '../../components/ui/EmptyState';

function DetailKeuanganTenant({ tenant, onBack, onUpdateTenant }) {
  const { addToast } = useUI();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    statusPembayaran: tenant.statusPembayaran || 'Belum Bayar',
    tunggakan: tenant.tunggakan || tenant.hutangTunggakan || 0,
    rincianTunggakan: tenant.rincianTunggakan || '—'
  });

  React.useEffect(() => {
    setEditData({
      statusPembayaran: tenant.statusPembayaran || 'Belum Bayar',
      tunggakan: tenant.tunggakan || tenant.hutangTunggakan || 0,
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
    const updated = {
      ...tenant,
      statusPembayaran: editData.statusPembayaran,
      tunggakan: editData.tunggakan,
      rincianTunggakan: editData.rincianTunggakan
    };
    if (onUpdateTenant) onUpdateTenant(updated);
    setShowEditModal(false);
    addToast('Data keuangan tenant berhasil diperbarui.', 'success');
  };

  const formatRupiah = (angka) => {
    if (typeof angka === 'string') angka = parseInt(angka.replace(/[^0-9]/g, ''), 10) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const rawTunggakan = tenant.hutangTunggakan ?? tenant.tunggakan ?? 0;
  const tunggakanValue = typeof rawTunggakan === 'number' ? rawTunggakan : parseInt(String(rawTunggakan).replace(/[^0-9]/g, ''), 10) || 0;

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
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

          {(!tenant.riwayat || tenant.riwayat.length === 0) ? (
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