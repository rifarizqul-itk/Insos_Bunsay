import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useApi } from '../../hooks/useApi';
import { getAdminKiosDetail, updateKios } from '../../api/admin';

function DetailAdministrasiKios() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useUI();
  const kiosId = location.state?.kiosId;

  const { data: kios, loading, error, refetch } = useApi(
    () => getAdminKiosDetail(kiosId),
    [kiosId],
    !!kiosId
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (kios) {
      setEditData({
        tenant: kios.tenant,
        statusKios: kios.statusKios,
        usaha: kios.usaha,
        catatan: kios.catatan || '',
        ...(kios.detailAdministrasi || {})
      });
    }
  }, [kios]);

  useEffect(() => {
    if (!kiosId) {
      navigate('/admin/kios');
    }
  }, [kiosId, navigate]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateKios(kiosId, editData);
      addToast(`Data administrasi kios ${kios?.nomorKios} berhasil diperbarui.`, 'success');
      setShowEditModal(false);
      refetch();
    } catch (_) {
      addToast('Gagal memperbarui data. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>Memuat data...</div>;
  }

  if (error || !kios) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--red)' }}>Gagal memuat data kios.</p>
        <button onClick={() => navigate('/admin/kios')} style={{ marginTop: '16px', backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '0 20px', height: '44px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer' }}>Kembali</button>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <button onClick={() => navigate('/admin/kios')} style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '0 20px', fontSize: '14px', marginBottom: '16px', height: '44px', fontWeight: '600', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>← Kembali ke Tabel Kios</button>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Detail Administrasi Kios: {kios.nomorKios}</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>Informasi kepemilikan, dokumen legal, dan status unit kios.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text)' }}>Dokumen Kepemilikan</h3>
            <button onClick={() => setShowEditModal(true)} style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '0 16px', fontSize: '13px', fontWeight: '600', height: '36px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Edit Data</button>
          </div>
          {kios.detailAdministrasi ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: '15px' }}>
              <div><span style={{ color: 'var(--text-3)' }}>Nama Pemilik:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{kios.tenant}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Nomor KTP:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{kios.detailAdministrasi.ktp}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Alamat:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{kios.detailAdministrasi.alamat}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Kontak:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{kios.detailAdministrasi.kontak}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>No. SP / Tgl:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{kios.detailAdministrasi.sp}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>No. PPJB / Tgl:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{kios.detailAdministrasi.ppjb}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Tgl BAST:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{kios.detailAdministrasi.bast}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Ukuran:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{kios.detailAdministrasi.ukuran}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Sertifikat:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{kios.detailAdministrasi.sertifikat}</div></div>
              <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-3)' }}>Keterangan:</span> <div style={{ fontWeight: '600', marginTop: '2px', color: 'var(--text-2)' }}>{kios.detailAdministrasi.keterangan}</div></div>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>Data administrasi belum tersedia untuk kios ini.</div>
          )}
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>Status Kios</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Status</span>
              <div style={{ marginTop: '6px' }}>
                <span style={{ backgroundColor: kios.statusKios === 'Terisi' ? 'var(--green-bg)' : kios.statusKios === 'Kosong' ? 'var(--red-100)' : 'var(--orange-bg)', color: kios.statusKios === 'Terisi' ? 'var(--green)' : kios.statusKios === 'Kosong' ? 'var(--red)' : 'var(--orange)', padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '13px' }}>
                  {kios.statusKios}
                </span>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Jenis Usaha</span>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px', color: 'var(--text)' }}>{kios.usaha || '—'}</div>
            </div>
            <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Catatan</span>
              <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '6px', color: 'var(--text-2)' }}>{kios.catatan || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="page-fade-in" style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '28px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Edit Data Kios: {kios.nomorKios}</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-3)', padding: '4px' }}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Nama Pemilik</label><input type="text" name="tenant" value={editData.tenant || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
                <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Nomor KTP</label><input type="text" name="ktp" value={editData.ktp || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
              </div>
              <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Alamat</label><input type="text" name="alamat" value={editData.alamat || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Kontak</label><input type="text" name="kontak" value={editData.kontak || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
                <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Jenis Usaha</label><input type="text" name="usaha" value={editData.usaha || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>No. SP / Tgl</label><input type="text" name="sp" value={editData.sp || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
                <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>No. PPJB / Tgl</label><input type="text" name="ppjb" value={editData.ppjb || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Tgl BAST</label><input type="text" name="bast" value={editData.bast || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
                <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Ukuran</label><input type="text" name="ukuran" value={editData.ukuran || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
              </div>
              <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Sertifikat</label><input type="text" name="sertifikat" value={editData.sertifikat || ''} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Keterangan</label><textarea name="keterangan" value={editData.keterangan || ''} onChange={handleEditChange} rows="2" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '14px', resize: 'none', width: '100%' }} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Status Kios</label><select name="statusKios" value={editData.statusKios || 'Terisi'} onChange={handleEditChange} style={{ height: '40px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', width: '100%' }}><option value="Terisi">Terisi</option><option value="Kosong">Kosong</option><option value="Perlu Validasi">Perlu Validasi</option></select></div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '12px', fontSize: '14px', fontWeight: '600', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, backgroundColor: isSubmitting ? 'var(--text-3)' : 'var(--red)', color: '#ffffff', padding: '12px', fontSize: '14px', fontWeight: '700', border: 'none', borderRadius: 'var(--radius-md)', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailAdministrasiKios;
