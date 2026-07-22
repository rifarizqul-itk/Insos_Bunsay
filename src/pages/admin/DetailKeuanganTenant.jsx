import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';

function DetailKeuanganTenant({ tenant, onBack, onUpdateTenant }) {
  const { addToast } = useUI();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    statusPembayaran: tenant.statusPembayaran,
    tunggakan: tenant.tunggakan,
    rincianTunggakan: tenant.rincianTunggakan || '—'
  });

  const tableHeaders = [
    { label: 'ID' },
    { label: 'Tanggal' },
    { label: 'Jenis' },
    { label: 'Nominal' },
    { label: 'Metode' },
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

  const getStatusBadgeStyle = (status) => {
    const styles = {
      'Lunas': { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Lunas (Bulan Ini)' },
      'Belum Bayar': { bg: 'var(--red-100)', color: 'var(--red)', label: 'Belum Bayar' },
      'Menunggu Verifikasi': { bg: 'var(--orange-bg)', color: 'var(--orange)', label: 'Menunggu Verifikasi' }
    };
    return styles[status] || styles['Belum Bayar'];
  };

  const formatRupiah = (angka) => {
    if (typeof angka === 'string') angka = parseInt(angka.replace(/[^0-9]/g, ''), 10) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(angka);
  };

  const tunggakanValue = typeof tenant.tunggakan === 'number' ? tenant.tunggakan : parseInt(String(tenant.tunggakan).replace(/[^0-9]/g, ''), 10) || 0;

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <button
          onClick={onBack}
          style={{
            backgroundColor: 'var(--warm-gray)',
            color: 'var(--text)',
            padding: '0 20px',
            fontSize: '14px',
            marginBottom: '16px',
            height: '44px',
            fontWeight: '600',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Icon icon="ph:arrow-left-bold" width="18" height="18" />
          <span>Kembali ke Daftar Tenant</span>
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Detail Keuangan: {tenant.nama}
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
              Nomor Kios: <strong className="font-tabular-nums">{tenant.kios}</strong> — {tenant.usaha || '—'}
            </p>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              backgroundColor: 'var(--red)',
              color: '#ffffff',
              padding: '0 20px',
              fontSize: '14px',
              fontWeight: '700',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              height: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Icon icon="ph:pencil-bold" width="18" height="18" />
            <span>Edit Status / Tunggakan</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
            <span className="label-micro">Status Pembayaran Bulan Ini</span>
            <div style={{ marginTop: '12px' }}>
              <span style={{
                backgroundColor: getStatusBadgeStyle(tenant.statusPembayaran).bg,
                color: getStatusBadgeStyle(tenant.statusPembayaran).color,
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '800',
                fontSize: '14px',
                display: 'inline-block'
              }}>
                {getStatusBadgeStyle(tenant.statusPembayaran).label}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
            <span className="label-micro">Akumulasi Tunggakan AR (Historis)</span>
            <div className="font-tabular-nums" style={{ fontSize: '26px', fontWeight: '800', color: tunggakanValue > 0 ? 'var(--orange)' : 'var(--green)', marginTop: '8px' }}>
              {formatRupiah(tunggakanValue)}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
            Riwayat Transaksi Pelaporan Terdahulu
          </h3>
          <Table
            caption={`Riwayat Transaksi Keuangan Kios ${tenant.kios}`}
            ariaLabel={`Tabel Riwayat Transaksi Keuangan Tenant ${tenant.nama}`}
            headers={tableHeaders}
            isEmpty={!tenant.riwayat || tenant.riwayat.length === 0}
            emptyMessage="Belum ada riwayat transaksi."
            colSpan={6}
          >
            {tenant.riwayat && tenant.riwayat.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--warm-gray)' }}>
                <td data-label="ID" className="font-tabular-nums font-bold" style={{ padding: '8px 12px' }}>{row.id}</td>
                <td data-label="Tanggal" style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{row.tanggal}</td>
                <td data-label="Jenis" style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{row.tipe}</td>
                <td data-label="Nominal" className="font-tabular-nums font-bold" style={{ padding: '8px 12px' }}>{typeof row.nominal === 'number' ? formatRupiah(row.nominal) : row.nominal}</td>
                <td data-label="Metode" style={{ padding: '8px 12px', color: 'var(--text-3)', fontWeight: '600' }}>{row.metode}</td>
                <td data-label="Status" style={{ padding: '8px 12px' }}>
                  <span style={{ backgroundColor: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '11px' }}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Data Keuangan: ${tenant.nama}`}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              style={{
                flex: 1,
                backgroundColor: 'var(--warm-gray)',
                color: 'var(--text)',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                height: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              style={{
                flex: 1,
                backgroundColor: 'var(--red)',
                color: '#ffffff',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                height: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Simpan Perubahan
            </button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField label="Status Pembayaran" id="edit-status-pembayaran">
            <select
              name="statusPembayaran"
              value={editData.statusPembayaran}
              onChange={handleEditChange}
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
            >
              <option value="Lunas">Lunas</option>
              <option value="Belum Bayar">Belum Bayar</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            </select>
          </FormField>

          <FormField label="Tunggakan AR (Nominal)" id="edit-tunggakan">
            <input
              type="number"
              name="tunggakan"
              value={editData.tunggakan}
              onChange={handleEditChange}
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
            />
          </FormField>

          <FormField label="Rincian / Catatan Tunggakan" id="edit-rincian-tunggakan">
            <textarea
              name="rincianTunggakan"
              value={editData.rincianTunggakan}
              onChange={handleEditChange}
              rows="3"
              style={{ borderRadius: '6px', border: '1px solid var(--border)', padding: '10px 12px', fontSize: '15px', resize: 'none' }}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}

export default DetailKeuanganTenant;