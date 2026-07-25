import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useAdminKios, useTenantRegistration } from '../../hooks/useAdmin';
import Drawer from '../../components/ui/Drawer';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';

function KetersediaanKios({ isAdmin = false }) {
  const navigate = useNavigate();
  const { addToast } = useUI();
  const { data: kiosData, loading, error, refetch } = useAdminKios();
  const { registerTenant } = useTenantRegistration();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLantai, setFilterLantai] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showTambahDrawer, setShowTambahDrawer] = useState(false);
  const [formTenant, setFormTenant] = useState({ nama: '', kios: '', email: '', usaha: '' });
  const [fieldError, setFieldError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredential, setCreatedCredential] = useState(null);

  const tableHeaders = [
    { label: 'Lantai' },
    { label: 'No. Kios' },
    { label: 'Status' },
    ...(isAdmin ? [{ label: 'Nama Pemilik' }] : []),
    { label: 'Jenis Usaha' },
    ...(isAdmin ? [{ label: 'Catatan' }] : []),
    ...(isAdmin ? [{ label: 'Aksi', align: 'center' }] : []),
  ];

  const filteredKios = (kiosData || []).filter(kios => {
    const matchesSearch = (kios.nomorKios || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (kios.tenant || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLantai = filterLantai === 'Semua' || kios.lantai === filterLantai || (kios.lantai || '').includes(filterLantai.replace('Lantai ', 'Lt. '));
    const matchesStatus = filterStatus === 'Semua' || kios.statusKios === filterStatus;
    return matchesSearch && matchesLantai && matchesStatus;
  });

  const handleDetailClick = (kios) => {
    navigate('/admin/detail-administrasi', { state: { kiosId: kios.id } });
  };

  const handleTambahTenant = async (e) => {
    e.preventDefault();
    setFieldError(null);
    setIsSubmitting(true);
    try {
      const result = await registerTenant(formTenant);
      if (result && result.success) {
        addToast(result.message || `Tenant ${formTenant.nama} berhasil didaftarkan!`, 'success');
        setShowTambahDrawer(false);
        if (result.data && result.data.credentials) {
          setCreatedCredential({
            nama: formTenant.nama,
            kios: result.data.kios || formTenant.kios,
            username: result.data.credentials.username,
            tempPassword: result.data.credentials.tempPassword,
            email: result.data.credentials.email
          });
        }
        setFormTenant({ nama: '', kios: '', email: '', usaha: '' });
        refetch();
      } else if (result && !result.success) {
        addToast(result.message || 'Gagal mendaftarkan tenant.', 'error');
        if (result.field) {
          setFieldError({ field: result.field, message: result.message });
        }
      }
    } catch (_) {
      addToast('Gagal mendaftarkan tenant. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-fade-in flex flex-col gap-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-2">
            <SkeletonTable rows={1} className="h-9 w-64" />
            <SkeletonTable rows={1} className="h-5 w-80" />
          </div>
          <SkeletonTable rows={1} className="h-11 w-44" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
        </div>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="inset" className="p-10 text-center my-8">
        <p className="text-red font-bold text-base mb-4">Gagal memuat data kios.</p>
        <Button variant="primary" onClick={refetch}>
          Muat Ulang
        </Button>
      </Card>
    );
  }

  const countTerisi = (kiosData || []).filter(k => k.statusKios === 'Terisi').length;
  const countKosong = (kiosData || []).filter(k => k.statusKios === 'Kosong').length;
  const countValidasi = (kiosData || []).filter(k => k.statusKios === 'Perlu Validasi').length;

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            {isAdmin ? 'Manajemen Unit Kios' : 'Ketersediaan Kios Plaza'}
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
            Pemetaan status ketersediaan dan administrasi unit kios Plaza Kebun Sayur.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/admin/riwayat-pemilik')}
              className="gap-2 font-bold"
            >
              <Icon icon="heroicons:clock-20-solid" width="18" height="18" />
              <span>Riwayat Tenant Lama</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowTambahDrawer(true)}
              className="gap-2 shadow-md"
            >
              <Icon icon="heroicons:user-plus-20-solid" width="18" height="18" />
              <span>Daftarkan Tenant Baru</span>
            </Button>
          </div>
        )}
      </div>

      {/* Ringkasan Status Kios */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4 flex flex-col justify-between">
          <span className="label-micro text-text-3">Total Kios</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-tabular-nums text-text mt-1">
            {kiosData?.length || 0}
          </div>
        </Card>
        <Card variant="elevated" className="p-4 flex flex-col justify-between">
          <span className="label-micro text-green">Kios Terisi</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-tabular-nums text-green mt-1">
            {countTerisi}
          </div>
        </Card>
        <Card variant="elevated" className="p-4 flex flex-col justify-between">
          <span className="label-micro text-red">Kios Kosong</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-tabular-nums text-red mt-1">
            {countKosong}
          </div>
        </Card>
        <Card variant="elevated" className="p-4 flex flex-col justify-between">
          <span className="label-micro text-orange">Perlu Validasi</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-tabular-nums text-orange mt-1">
            {countValidasi}
          </div>
        </Card>
      </div>

      <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-extrabold text-text tracking-tight text-balance">
            Daftar Unit Kios Plaza Kebun Sayur
          </h3>
          
          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari no kios / nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari nomor kios atau nama tenant"
              className="h-10 px-3.5 rounded-md border border-border bg-white text-sm font-medium w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-red"
            />
            <select
              value={filterLantai}
              onChange={(e) => setFilterLantai(e.target.value)}
              aria-label="Filter berdasarkan lantai kios"
              className="h-10 px-3 rounded-md border border-border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red"
            >
              <option value="Semua">Semua Lantai</option>
              <option value="Lt. 1">Lantai 1</option>
              <option value="Lt. 2">Lantai 2</option>
              <option value="Lt. 3">Lantai 3</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter berdasarkan status ketersediaan kios"
              className="h-10 px-3 rounded-md border border-border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terisi">Terisi</option>
              <option value="Kosong">Kosong</option>
              <option value="Perlu Validasi">Perlu Validasi</option>
            </select>
          </div>
        </div>

        {filteredKios.length === 0 ? (
          <EmptyState
            icon="heroicons:building-storefront-20-solid"
            title="Kios Tidak Ditemukan"
            description="Tidak ada unit kios yang cocok dengan filter lantai atau pencarian Anda."
          />
        ) : (
          <Table
            caption="Daftar Ketersediaan Kios"
            ariaLabel="Manajemen Unit Kios Plaza Bunsay"
            headers={tableHeaders}
            colSpan={isAdmin ? 7 : 4}
          >
            {filteredKios.map((kios, idx) => (
              <tr key={kios.id || idx} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                <th scope="row" data-label="No. Kios" className="font-tabular-nums font-extrabold p-3 text-text text-left">
                  {kios.nomorKios}
                </th>
                <td data-label="Lantai" className="p-3 text-text-2 font-semibold">
                  Lantai {kios.lantai}
                </td>
                <td data-label="Status" className="p-3">
                  <Badge status={kios.statusKios} />
                </td>
                {isAdmin && (
                  <td data-label="Nama Pemilik" className="p-3 font-semibold text-text">
                    {kios.tenant}
                  </td>
                )}
                <td data-label="Jenis Usaha" className="p-3 text-text-2 font-medium">
                  {kios.usaha}
                </td>
                {isAdmin && (
                  <td data-label="Catatan" className="p-3 text-xs text-text-3 font-medium">
                    {kios.catatan}
                  </td>
                )}
                {isAdmin && (
                  <td data-label="Aksi" className="p-3 text-center">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleDetailClick(kios)}
                      aria-label={`Lihat detail administrasi kios ${kios.nomorKios} (${kios.tenant || 'Kosong'})`}
                      className="min-h-[44px] sm:min-h-8 sm:h-8 px-3 text-xs font-bold"
                    >
                      Detail
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Drawer Pendaftaran Tenant Baru */}
      <Drawer
        isOpen={showTambahDrawer}
        onClose={() => setShowTambahDrawer(false)}
        title="Daftarkan Tenant Baru"
        subtitle="Tambahkan data pemilik kios baru ke dalam sistem Bunsay"
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowTambahDrawer(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isSubmitting}
              onClick={handleTambahTenant}
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Tenant'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleTambahTenant} className="flex flex-col gap-4">
          <FormField label="Nama Lengkap" id="tambah-tenant-nama" required error={fieldError?.field === 'nama' ? fieldError.message : undefined}>
            <input 
              type="text" 
              placeholder="Nama pemilik kios" 
              value={formTenant.nama} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, nama: e.target.value }))} 
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
            />
          </FormField>

          <FormField label="Nomor Kios" id="tambah-tenant-kios" required error={fieldError?.field === 'kios' ? fieldError.message : undefined}>
            <input 
              type="text" 
              placeholder="Contoh: B-1001" 
              value={formTenant.kios} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, kios: e.target.value }))} 
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold font-tabular-nums focus:bg-white transition-colors" 
            />
          </FormField>

          <FormField label="Email" id="tambah-tenant-email" required error={fieldError?.field === 'email' ? fieldError.message : undefined}>
            <input 
              type="email" 
              placeholder="email@tenant.com" 
              value={formTenant.email} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, email: e.target.value }))} 
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
            />
          </FormField>

          <FormField label="Jenis Usaha" id="tambah-tenant-usaha" required error={fieldError?.field === 'usaha' ? fieldError.message : undefined}>
            <input 
              type="text" 
              placeholder="Contoh: Kerajinan, Fashion" 
              value={formTenant.usaha} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, usaha: e.target.value }))} 
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
            />
          </FormField>

          <Card variant="inset" className="p-4 text-xs text-text-2 leading-relaxed flex gap-2.5 items-start">
            <Icon icon="heroicons:information-circle-20-solid" width="20" height="20" className="text-red flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-text font-bold block mb-0.5">Informasi Kredensial Akun:</strong>
              Username dan password sementara akan dikirim ke email tenant sekaligus ditampilkan di layar setelah pendaftaran.
            </div>
          </Card>
        </form>
      </Drawer>

      {/* Modal Kredensial Sementara (One-Time Display) */}
      <Modal
        isOpen={Boolean(createdCredential)}
        onClose={() => setCreatedCredential(null)}
        title="Kredensial Login Awal Tenant"
        size="md"
        footer={
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              setCreatedCredential(null);
              addToast('Kredensial dicatat. Berikan ke tenant sebelum beraktivitas.', 'info');
            }}
            className="h-11 font-extrabold"
          >
            Mengerti & Tutup Kredensial
          </Button>
        }
      >
        {createdCredential && (
          <div className="flex flex-col gap-4 font-sans">
            <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed flex gap-2.5 items-start">
              <Icon icon="heroicons:exclamation-triangle-20-solid" width="20" height="20" className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5 text-amber-950">PERHATIAN</strong>
                Kredensial ini HANYA DITAMPILKAN 1 KALI demi keamanan. Harap catat atau berikan ke tenant <strong>{createdCredential.nama}</strong> ({createdCredential.kios}) sebelum menutup dialog ini.
              </div>
            </div>

            <div className="bg-warm-gray/60 border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm border-b border-border/70 pb-2">
                <span className="text-text-2 font-medium">Pemilik / Tenant:</span>
                <span className="font-bold text-text">{createdCredential.nama} ({createdCredential.kios})</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-2 font-medium">Username Awal:</span>
                <code className="font-mono font-bold text-red bg-white px-2.5 py-1 rounded border border-border">
                  {createdCredential.username}
                </code>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-2 font-medium">Password Sementara:</span>
                <code className="font-mono font-bold text-green bg-white px-2.5 py-1 rounded border border-border">
                  {createdCredential.tempPassword}
                </code>
              </div>
              <div className="flex justify-between items-center text-xs text-text-3 pt-1">
                <span>Email Notifikasi:</span>
                <span className="font-medium text-text">{createdCredential.email}</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const textToCopy = `Nama Tenant: ${createdCredential.nama}\nKios: ${createdCredential.kios}\nUsername: ${createdCredential.username}\nPassword Sementara: ${createdCredential.tempPassword}`;
                navigator.clipboard.writeText(textToCopy);
                addToast('Kredensial berhasil disalin ke clipboard!', 'success');
              }}
              className="w-full h-10 text-xs font-bold gap-2"
            >
              <Icon icon="heroicons:document-duplicate-20-solid" width="18" height="18" />
              <span>Salin Kredensial Tenant</span>
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default KetersediaanKios;
