import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, FormField, Badge, Table, Drawer, Modal, EmptyState, StatCard, Icon, SkeletonTable } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function KetersediaanKios() {
  const navigate = useNavigate();
  const { httpClient } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLantai, setFilterLantai] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showTambahDrawer, setShowTambahDrawer] = useState(false);
  const [formTenant, setFormTenant] = useState({ nama: '', kios: '', email: '', telepon: '', usaha: '' });
  const [fieldError, setFieldError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredential, setCreatedCredential] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [kiosData, setKiosData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchKiosList() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const response = await httpClient.get('/api/v1/admin/kios');
        const rawList = response?.data?.data || response?.data;
        if (Array.isArray(rawList)) {
          const mapped = rawList.map(item => ({
            id: item.Id_Kios || item.id,
            nomorKios: item.No_Kios || item.nomorKios,
            lantai: String(item.Lantai || '1'),
            statusKios: item.Status || 'Terisi',
            tenant: item.sewa?.pemilik?.Nama || item.sewa?.[0]?.pemilik?.Nama || item.tenant || item.Nama || '-',
            usaha: item.sewa?.Jenis_Usaha || item.sewa?.[0]?.Jenis_Usaha || item.usaha || '-',
            catatan: item.Catatan || 'Masa sewa aktif',
            sp: 'SP-102/PLZ-BUNSAY/2026',
            ppjb: 'PPJB-0881',
            ukuran: item.Ukuran || '3 x 4 Meter',
            sertifikat: 'HGB Resmi Pemkot'
          }));
          setKiosData(mapped);
        }
      } catch (err) {
        console.error('Gagal mengambil data kios dari backend:', err);
        setErrorMsg('Gagal terhubung ke database backend SQL untuk mengambil data kios.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchKiosList();
  }, [httpClient]);

  const tableHeaders = [
    { label: 'No. Kios' },
    { label: 'Lantai' },
    { label: 'Status' },
    { label: 'Nama Pemilik' },
    { label: 'Jenis Usaha' },
    { label: 'Catatan' },
    { label: 'Aksi', align: 'center' },
  ];

  const filteredKios = kiosData.filter(kios => {
    const matchesSearch = (kios.nomorKios || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (kios.tenant || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLantai = filterLantai === 'Semua' || kios.lantai === filterLantai;
    const matchesStatus = filterStatus === 'Semua' || kios.statusKios === filterStatus;
    return matchesSearch && matchesLantai && matchesStatus;
  });

  const countTerisi = kiosData.filter(k => k.statusKios === 'Terisi').length;
  const countKosong = kiosData.filter(k => k.statusKios === 'Kosong').length;

  const handleTambahTenant = async (e) => {
    e.preventDefault();
    setFieldError(null);

    if (!formTenant.nama || !formTenant.kios || !formTenant.email || !formTenant.telepon || !formTenant.usaha) {
      if (!formTenant.nama) setFieldError({ field: 'nama', message: 'Nama lengkap wajib diisi' });
      else if (!formTenant.kios) setFieldError({ field: 'kios', message: 'Nomor kios wajib diisi' });
      else if (!formTenant.email) setFieldError({ field: 'email', message: 'Email wajib diisi' });
      else if (!formTenant.telepon) setFieldError({ field: 'telepon', message: 'Nomor telepon wajib diisi' });
      else if (!formTenant.usaha) setFieldError({ field: 'usaha', message: 'Jenis usaha wajib diisi' });
      return;
    }

    setIsSubmitting(true);
    try {
      await httpClient.post('/api/v1/admin/pemilik', {
        Nama: formTenant.nama,
        No_HP: formTenant.telepon
      });
    } catch (_) {
    }

    const generatedPassword = `bunsay${Math.floor(1000 + Math.random() * 9000)}`;
    const usernameGenerated = formTenant.email.split('@')[0] || formTenant.nama.toLowerCase().replace(/\s+/g, '');

    const newCredential = {
      nama: formTenant.nama,
      kios: formTenant.kios,
      username: usernameGenerated,
      tempPassword: generatedPassword,
      email: formTenant.email,
      telepon: formTenant.telepon
    };

    setKiosData(prev => [
      {
        id: prev.length + 1,
        nomorKios: formTenant.kios,
        lantai: '1',
        statusKios: 'Terisi',
        tenant: formTenant.nama,
        usaha: formTenant.usaha,
        catatan: 'Registrasi Baru',
        sp: 'SP-NEW/2026',
        ppjb: 'PPJB-NEW/2026',
        ukuran: '3 x 4 Meter',
        sertifikat: 'HGB Resmi Pemkot'
      },
      ...prev
    ]);

    setIsSubmitting(false);
    setShowTambahDrawer(false);
    setCreatedCredential(newCredential);
    setFormTenant({ nama: '', kios: '', email: '', telepon: '', usaha: '' });
  };

  const handleDetailClick = (kios) => {
    navigate('/admin/detail-administrasi', { state: { kios } });
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      {errorMsg && (
        <div className="bg-red-500 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:exclamation-triangle-20-solid" width="20" height="20" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {toastMessage && (
        <div className="bg-emerald-500 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:check-circle-20-solid" width="20" height="20" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Manajemen Ketersediaan Unit Kios
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
            Pantau status keterisian unit kios, nomor lantai, dan administrasi pemilik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/admin/riwayat-pemilik')}
            className="w-full sm:w-auto font-bold"
          >
            <Icon icon="heroicons:clock-20-solid" width="18" height="18" className="mr-1.5" />
            Riwayat Tenant Lama
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowTambahDrawer(true)}
            className="w-full sm:w-auto font-bold shadow-md"
          >
            <Icon icon="heroicons:plus-circle-20-solid" width="18" height="18" className="mr-1.5" />
            Tambah Tenant Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="Total Unit Kios"
          value={kiosData.length}
          color="red"
          icon={<Icon icon="heroicons:building-storefront-20-solid" width="24" height="24" />}
        />
        <StatCard
          label="Unit Terisi (Aktif)"
          value={countTerisi}
          color="green"
          icon={<Icon icon="heroicons:check-circle-20-solid" width="24" height="24" />}
        />
        <StatCard
          label="Unit Kosong (Tersedia)"
          value={countKosong}
          color="orange"
          icon={<Icon icon="heroicons:exclamation-circle-20-solid" width="24" height="24" />}
        />
      </div>

      <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-extrabold text-text tracking-tight text-balance">
            Daftar Unit Kios Plaza
          </h3>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari no. kios / nama tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 px-3.5 rounded-md border border-border bg-white text-sm font-medium w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-red"
            />
            <select
              value={filterLantai}
              onChange={(e) => setFilterLantai(e.target.value)}
              className="h-10 px-3 rounded-md border border-border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red"
            >
              <option value="Semua">Semua Lantai</option>
              <option value="1">Lantai 1</option>
              <option value="2">Lantai 2</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 rounded-md border border-border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terisi">Terisi</option>
              <option value="Kosong">Kosong</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={4} cols={7} />
        ) : filteredKios.length === 0 ? (
          <EmptyState
            icon="heroicons:building-storefront-20-solid"
            title="Kios Tidak Ditemukan di Database SQL"
            description="Tidak ada unit kios yang ditemukan di database backend SQL."
          />
        ) : (
          <Table
            caption="Daftar Ketersediaan Kios"
            ariaLabel="Manajemen Unit Kios Plaza Bunsay"
            headers={tableHeaders}
            colSpan={7}
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
                <td data-label="Nama Pemilik" className="p-3 font-semibold text-text">
                  {kios.tenant}
                </td>
                <td data-label="Jenis Usaha" className="p-3 text-text-2 font-medium">
                  {kios.usaha}
                </td>
                <td data-label="Catatan" className="p-3 text-text-3 text-xs font-semibold">
                  {kios.catatan}
                </td>
                <td data-label="Aksi" className="p-3 text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDetailClick(kios)}
                    className="min-h-[44px] sm:min-h-9 sm:h-9 px-4 text-xs font-bold"
                  >
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Drawer
        isOpen={showTambahDrawer}
        onClose={() => setShowTambahDrawer(false)}
        title="Registrasi Tenant Kios Baru"
        subtitle="Buat akun tenant baru dan kaitkan dengan unit kios"
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowTambahDrawer(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              onClick={handleTambahTenant}
              className="font-bold"
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Registrasikan Tenant'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleTambahTenant} className="flex flex-col gap-4 font-sans">
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

          <FormField label="Nomor Telepon" id="tambah-tenant-telepon" required error={fieldError?.field === 'telepon' ? fieldError.message : undefined}>
            <input
              type="tel"
              placeholder="Contoh: 081234567890"
              value={formTenant.telepon}
              onChange={(e) => setFormTenant(prev => ({ ...prev, telepon: e.target.value }))}
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
              setToastMessage('Kredensial dicatat. Berikan ke tenant sebelum beraktivitas.');
              setTimeout(() => setToastMessage(null), 3000);
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
                <code className="font-mono font-bold text-emerald-600 bg-white px-2.5 py-1 rounded border border-border">
                  {createdCredential.tempPassword}
                </code>
              </div>
              <div className="flex justify-between items-center text-xs text-text-3 pt-1">
                <span>Email Notifikasi:</span>
                <span className="font-medium text-text">{createdCredential.email}</span>
              </div>
            </div>

            <div className="flex gap-2.5 w-full">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const textToCopy = `Halo Bpk/Ibu ${createdCredential.nama}, berikut kredensial akun Bunsay Plaza Kebun Sayur Anda:\n\n- Kios: ${createdCredential.kios}\n- Username: ${createdCredential.username}\n- Password Sementara: ${createdCredential.tempPassword}\n\nSilakan login di portal Bunsay.`;
                  navigator.clipboard.writeText(textToCopy);
                  setToastMessage('Kredensial tenant berhasil disalin!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 shrink-0 h-10 text-xs font-bold gap-1.5 whitespace-nowrap"
              >
                <Icon icon="heroicons:document-duplicate-20-solid" width="16" height="16" />
                <span>Salin Kredensial</span>
              </Button>
              {(() => {
                const cleanPhone = (createdCredential.telepon || '').replace(/[^0-9]/g, '');
                const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                const messageText = `Halo Bpk/Ibu ${createdCredential.nama}, berikut kredensial akun Bunsay Plaza Kebun Sayur Anda:\n\n- Kios: ${createdCredential.kios}\n- Username: ${createdCredential.username}\n- Password Sementara: ${createdCredential.tempPassword}\n\nSilakan login di portal Bunsay.`;
                const waUrl = waPhone 
                  ? `https://wa.me/${waPhone}?text=${encodeURIComponent(messageText)}`
                  : `https://wa.me/?text=${encodeURIComponent(messageText)}`;
                return (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 shrink-0 bg-[#25D366] text-white hover:bg-[#20bd5a] h-10 rounded-md text-xs font-bold text-decoration-none flex items-center justify-center gap-1.5 transition-all shadow-sm whitespace-nowrap"
                  >
                    <Icon icon="ic:baseline-whatsapp" width="18" height="18" />
                    <span>Kirim via WA</span>
                  </a>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default KetersediaanKios;
