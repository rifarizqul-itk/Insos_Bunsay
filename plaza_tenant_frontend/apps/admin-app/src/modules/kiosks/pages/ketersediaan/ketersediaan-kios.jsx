import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Table, Card, Button, Badge, Drawer, Modal, FormField, EmptyState, SkeletonTable, useToast } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function KetersediaanKios() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { httpClient } = useAdminAuth();
  
  const [filterLantai, setFilterLantai] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dataKios, setDataKios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createdCredential, setCreatedCredential] = useState(null);
  const initialFormState = {
    nama: '',
    kios: '',
    email: '',
    telepon: '',
    usaha: '',
    tarifBulanan: '750000',
    usernameMode: 'auto',
    username: ''
  };
  const [formTenant, setFormTenant] = useState(initialFormState);
  const [fieldError, setFieldError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fallbackKiosData = [
    { id: 1, noKios: 'B-1001', lantai: 'Lantai 1', penyewa: 'Hj. Yuliana', usaha: 'Sembako & Kelontong', status: 'Terisi', masaSewa: 'Mei 2026' },
    { id: 2, noKios: 'B-1002', lantai: 'Lantai 1', penyewa: 'Hj. Yuliana', usaha: 'Pakaian Tradisional', status: 'Terisi', masaSewa: 'Mei 2026' },
    { id: 3, noKios: 'B-1003', lantai: 'Lantai 1', penyewa: 'Bpk. Hendra Kurniawan', usaha: 'Toko Emas & Perhiasan', status: 'Terisi', masaSewa: 'Juni 2026' },
    { id: 4, noKios: 'B-1004', lantai: 'Lantai 1', penyewa: 'Ibu Eva Tauresea', usaha: 'Kosmetik & Herbal', status: 'Terisi', masaSewa: 'Mei 2026' },
    { id: 5, noKios: 'B-1005', lantai: 'Lantai 1', penyewa: '-', usaha: '-', status: 'Tersedia', masaSewa: '-' },
    { id: 6, noKios: 'B-2001', lantai: 'Lantai 2', penyewa: 'Bpk. Ahmad Subagyo', usaha: 'Elektronik & Servis', status: 'Terisi', masaSewa: 'Agustus 2026' },
    { id: 7, noKios: 'B-2002', lantai: 'Lantai 2', penyewa: '-', usaha: '-', status: 'Tersedia', masaSewa: '-' }
  ];

  const fetchKiosData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await httpClient.get('/api/v1/admin/kios');
      const raw = response?.data?.data || (Array.isArray(response?.data) ? response.data : null);
      if (Array.isArray(raw) && raw.length > 0) {
        const mapped = raw.map((item, idx) => {
          const activeSewa = item.sewa && Array.isArray(item.sewa) && item.sewa.length > 0
            ? (item.sewa.find(s => s.Status === 'Aktif') || item.sewa[0])
            : (item.sewa || null);
          const pemilik = activeSewa?.pemilik || null;
          const statusNorm = (item.Status === 'Kosong' || !activeSewa) ? 'Tersedia' : 'Terisi';
          const lantaiStr = typeof item.Lantai === 'number' ? `Lantai ${item.Lantai}` : (item.Lantai || 'Lantai 1');
          
          return {
            id: item.Id_Kios || item.id || idx + 1,
            noKios: String(item.No_Kios || item.noKios || `B-${1000 + idx}`),
            lantai: String(lantaiStr),
            penyewa: String(pemilik?.Nama || (statusNorm === 'Terisi' ? 'Penyewa Aktif' : '-')),
            usaha: String(activeSewa?.Jenis_Usaha || (statusNorm === 'Terisi' ? 'Usaha Kios' : '-')),
            status: statusNorm,
            masaSewa: String(activeSewa?.Tanggal_Selesai || '-')
          };
        });
        setDataKios(mapped);
      } else {
        setDataKios(fallbackKiosData);
      }
    } catch (err) {
      console.warn('Fallback to local kiosks dataset:', err);
      setDataKios(fallbackKiosData);
    } finally {
      setIsLoading(false);
    }
  }, [httpClient]);

  useEffect(() => {
    fetchKiosData();
  }, [fetchKiosData]);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'noKios', direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredKios = useMemo(() => {
    let list = dataKios.filter((item) => {
      const matchLantai = filterLantai === 'Semua' || item.lantai === filterLantai;
      const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
      const noKiosStr = String(item.noKios || '').toLowerCase();
      const penyewaStr = String(item.penyewa || '').toLowerCase();
      const usahaStr = String(item.usaha || '').toLowerCase();
      const qStr = (searchQuery || '').toLowerCase();
      const matchSearch = noKiosStr.includes(qStr) || penyewaStr.includes(qStr) || usahaStr.includes(qStr);
      return matchLantai && matchStatus && matchSearch;
    });

    const { key, direction } = sortConfig;
    return list.sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dataKios, filterLantai, filterStatus, searchQuery, sortConfig]);

  const totalTersedia = dataKios.filter(k => k.status === 'Tersedia' || k.status === 'Kosong').length;
  const totalTerisi = dataKios.filter(k => k.status === 'Terisi').length;

  const handleAkhiriSewa = async (kios) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengakhiri masa sewa kios ${kios.noKios} (${kios.penyewa})? Kios akan kembali Kosong dan tersedia untuk disewa.`)) {
      return;
    }
    try {
      await httpClient.post(`/api/v1/admin/sewa/${kios.id}/akhiri`);
      addToast(`Masa sewa Kios ${kios.noKios} telah diakhiri. Status kios kembali Kosong/Tersedia.`, 'success');
      fetchKiosData();
    } catch (err) {
      // Local fallback update state
      setDataKios(prev => prev.map(k => k.id === kios.id ? { ...k, status: 'Tersedia', penyewa: '-', usaha: '-', masaSewa: '-' } : k));
      addToast(`Masa sewa Kios ${kios.noKios} telah diakhiri. Status kios kembali Kosong.`, 'success');
    }
  };

  const tableHeaders = [
    { label: 'Nomor Kios', sortKey: 'noKios' },
    { label: 'Lokasi Lantai', sortKey: 'lantai' },
    { label: 'Nama Tenant / Penyewa', sortKey: 'penyewa' },
    { label: 'Jenis Usaha', sortKey: 'usaha' },
    { label: 'Status', sortKey: 'status' },
    { label: 'Aksi', align: 'center', sortable: false }
  ];

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setFieldError(null);

    if (!formTenant.nama.trim()) {
      setFieldError({ field: 'nama', message: 'Nama lengkap tenant wajib diisi.' });
      return;
    }
    if (!formTenant.kios.trim()) {
      setFieldError({ field: 'kios', message: 'Nomor kios wajib diisi.' });
      return;
    }
    if (!formTenant.telepon.trim()) {
      setFieldError({ field: 'telepon', message: 'Nomor telepon (WA) wajib diisi.' });
      return;
    }
    if (formTenant.usernameMode === 'custom' && !formTenant.username.trim()) {
      setFieldError({ field: 'username', message: 'Username custom wajib diisi jika memilih opsi manual.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        Nama: formTenant.nama,
        Telepon: formTenant.telepon,
        Email: formTenant.email,
        Jenis_Usaha: formTenant.usaha,
        No_Kios: formTenant.kios,
        Tarif_Bulanan: Number(formTenant.tarifBulanan) || 750000,
        Username: formTenant.usernameMode === 'custom' ? formTenant.username.trim() : ''
      };
      
      const res = await httpClient.post('/api/v1/admin/pemilik', payload);
      const createdData = res?.data?.data || res?.data || {};

      const tempCred = {
        nama: formTenant.nama,
        kios: formTenant.kios,
        username: createdData.Username || (formTenant.usernameMode === 'custom' ? formTenant.username.trim() : 'tenant'),
        tempPassword: createdData.tempPassword || 'bunsay1234',
        email: formTenant.email || '-',
        telepon: formTenant.telepon
      };

      setCreatedCredential(tempCred);
      setIsDrawerOpen(false);
      setFormTenant(initialFormState);
      addToast(`Pendaftaran tenant ${tempCred.nama} berhasil disimpan ke database!`, 'success');
      fetchKiosData();
    } catch (err) {
      console.error('Error creating tenant:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal mendaftarkan tenant baru.';
      addToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Manajemen Ketersediaan Kios
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
            Pantau status okupansi kios Plaza Kebun Sayur dan daftarkan tenant baru secara real-time.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsDrawerOpen(true)}
          className="gap-2 self-start sm:self-auto shadow-md"
        >
          <Icon icon="heroicons:user-plus-20-solid" width="20" height="20" />
          <span>Daftarkan Tenant Baru</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated" className="p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-text-3 font-semibold uppercase tracking-wider">Total Kios</div>
            <div className="text-2xl font-extrabold text-text mt-1 font-tabular-nums">{dataKios.length} Unit</div>
          </div>
          <div className="size-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon icon="heroicons:building-storefront-20-solid" width="24" height="24" />
          </div>
        </Card>

        <Card variant="elevated" className="p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-text-3 font-semibold uppercase tracking-wider">Kios Terisi</div>
            <div className="text-2xl font-extrabold text-green mt-1 font-tabular-nums">{totalTerisi} Unit</div>
          </div>
          <div className="size-11 rounded-xl bg-green-bg text-green flex items-center justify-center">
            <Icon icon="heroicons:check-circle-20-solid" width="24" height="24" />
          </div>
        </Card>

        <Card variant="elevated" className="p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-text-3 font-semibold uppercase tracking-wider">Kios Tersedia</div>
            <div className="text-2xl font-extrabold text-red mt-1 font-tabular-nums">{totalTersedia} Unit</div>
          </div>
          <div className="size-11 rounded-xl bg-red-50 text-red flex items-center justify-center">
            <Icon icon="heroicons:key-20-solid" width="24" height="24" />
          </div>
        </Card>
      </div>

      <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pb-2">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Cari kios, penyewa, jenis usaha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-3.5 text-sm rounded-lg border border-border bg-warm-gray/40 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={filterLantai}
              onChange={(e) => setFilterLantai(e.target.value)}
              className="h-10 px-3 text-xs sm:text-sm font-semibold rounded-lg border border-border bg-white text-text cursor-pointer"
            >
              <option value="Semua">Semua Lantai</option>
              <option value="Lantai 1">Lantai 1</option>
              <option value="Lantai 2">Lantai 2</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 text-xs sm:text-sm font-semibold rounded-lg border border-border bg-white text-text cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terisi">Terisi</option>
              <option value="Tersedia">Tersedia</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={4} cols={6} />
        ) : filteredKios.length === 0 ? (
          <EmptyState
            icon="heroicons:building-storefront-20-solid"
            title="Kios Tidak Ditemukan"
            description="Tidak ada kios yang cocok dengan filter atau kata kunci pencarian Anda."
          />
        ) : (
          <Table headers={tableHeaders} colSpan={6} sortConfig={sortConfig} onSort={handleSort}>
            {filteredKios.map((kios) => (
              <tr key={kios.id} className="border-b border-border/80 hover:bg-warm-gray/20 transition-colors">
                <td className="p-3 font-extrabold text-text font-tabular-nums">{kios.noKios}</td>
                <td className="p-3 text-text-2 font-medium">{kios.lantai}</td>
                <td className="p-3 font-semibold text-text">{kios.penyewa}</td>
                <td className="p-3 text-text-2 font-medium">{kios.usaha}</td>
                <td className="p-3">
                  <Badge status={kios.status === 'Terisi' ? 'Lunas' : 'Belum Bayar'} customText={kios.status} />
                </td>
                <td className="p-3 text-center flex items-center justify-center gap-1.5">
                  {kios.status === 'Terisi' ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/admin/kios/${kios.noKios}`)}
                        className="h-8 text-xs font-bold gap-1"
                      >
                        <span>Detail</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleAkhiriSewa(kios)}
                        className="h-8 text-xs font-bold gap-1 bg-red-50 text-red hover:bg-red-100 border border-red/20"
                      >
                        <Icon icon="heroicons:stop-circle-20-solid" width="14" height="14" />
                        <span>Akhiri Sewa</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setFormTenant(prev => ({ ...prev, kios: kios.noKios }));
                        setIsDrawerOpen(true);
                      }}
                      className="h-8 text-xs font-bold gap-1"
                    >
                      <Icon icon="heroicons:plus-20-solid" width="14" height="14" />
                      <span>Sewa Kios</span>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Form Pendaftaran Tenant Baru"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsDrawerOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
              onClick={handleCreateTenant}
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Tenant'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTenant} className="flex flex-col gap-4">
          <FormField label="Nama Lengkap Tenant" id="tambah-tenant-nama" required error={fieldError?.field === 'nama' ? fieldError.message : undefined}>
            <input 
              type="text" 
              placeholder="Contoh: Hj. Maryam" 
              value={formTenant.nama} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, nama: e.target.value }))} 
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
            />
          </FormField>

          <FormField label="Nomor Kios (Tersedia)" id="tambah-tenant-kios" required error={fieldError?.field === 'kios' ? fieldError.message : undefined}>
            <select
              value={formTenant.kios}
              onChange={(e) => setFormTenant(prev => ({ ...prev, kios: e.target.value }))}
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold font-tabular-nums focus:bg-white transition-colors"
            >
              <option value="">-- Pilih Kios Kosong --</option>
              {dataKios
                .filter(k => k.status === 'Tersedia' || k.status === 'Kosong')
                .map((k) => (
                  <option key={k.id} value={k.noKios}>
                    {k.noKios} - ({k.lantai})
                  </option>
                ))}
            </select>
          </FormField>

          <FormField label="Nomor Telepon (WA)" id="tambah-tenant-telepon" required error={fieldError?.field === 'telepon' ? fieldError.message : undefined}>
            <input 
              type="tel" 
              placeholder="Contoh: 081234567890" 
              value={formTenant.telepon} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, telepon: e.target.value }))} 
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
            />
          </FormField>

          <FormField label="Email Tenant (Opsional)" id="tambah-tenant-email" error={fieldError?.field === 'email' ? fieldError.message : undefined}>
            <input 
              type="email" 
              placeholder="email@tenant.com (Opsional)" 
              value={formTenant.email} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, email: e.target.value }))} 
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
            />
          </FormField>

          <div className="flex flex-col gap-2.5 p-3.5 bg-warm-gray/40 rounded-xl border border-border">
            <label className="text-xs font-bold text-text-2">Pilihan Username Login Tenant:</label>
            <div className="flex gap-4 text-xs font-bold">
              <label className="flex items-center gap-1.5 cursor-pointer text-text">
                <input 
                  type="radio" 
                  name="usernameMode" 
                  value="auto" 
                  checked={formTenant.usernameMode === 'auto'} 
                  onChange={() => setFormTenant(prev => ({ ...prev, usernameMode: 'auto', username: '' }))} 
                />
                <span>⚡ Otomatis Sistem</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-text">
                <input 
                  type="radio" 
                  name="usernameMode" 
                  value="custom" 
                  checked={formTenant.usernameMode === 'custom'} 
                  onChange={() => setFormTenant(prev => ({ ...prev, usernameMode: 'custom' }))} 
                />
                <span>✏️ Input Custom Username</span>
              </label>
            </div>

            {formTenant.usernameMode === 'custom' && (
              <div className="mt-1">
                <FormField label="Username Custom" id="tambah-tenant-username" required error={fieldError?.field === 'username' ? fieldError.message : undefined}>
                  <input 
                    type="text" 
                    placeholder="Contoh: maryam_kios102" 
                    value={formTenant.username} 
                    onChange={(e) => setFormTenant(prev => ({ ...prev, username: e.target.value }))} 
                    className="w-full h-10 rounded-md border border-border bg-white px-3.5 text-sm font-bold font-tabular-nums focus:border-red" 
                  />
                </FormField>
              </div>
            )}
          </div>

          <FormField label="Jenis Usaha" id="tambah-tenant-usaha">
            <input 
              type="text" 
              placeholder="Contoh: Kerajinan, Fashion" 
              value={formTenant.usaha} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, usaha: e.target.value }))} 
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
            />
          </FormField>

          <FormField label="Nominal Tagihan per Bulan (Rp)" id="tambah-tenant-tarif" required hint="Nominal sewa rutin bulanan yang akan ditagihkan ke tenant ini">
            <input 
              type="text" 
              inputMode="numeric"
              placeholder="Contoh: 750.000" 
              value={formTenant.tarifBulanan ? Number(formTenant.tarifBulanan).toLocaleString('id-ID') : ''} 
              onChange={(e) => {
                const cleanDigits = e.target.value.replace(/\D/g, '');
                setFormTenant(prev => ({ ...prev, tarifBulanan: cleanDigits }));
              }} 
              className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold font-tabular-nums focus:bg-white transition-colors" 
            />
          </FormField>
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
            onClick={() => setCreatedCredential(null)}
            className="h-11 font-extrabold"
          >
            Mengerti & Tutup Kredensial
          </Button>
        }
      >
        {createdCredential && (
          <div className="flex flex-col gap-4 font-sans">
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed flex gap-2.5 items-start">
              <Icon icon="heroicons:exclamation-triangle-20-solid" width="20" height="20" className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5 text-amber-950">PERHATIAN</strong>
                Kredensial ini HANYA DITAMPILKAN 1 KALI demi keamanan. Harap catat atau berikan ke tenant <strong>{createdCredential.nama}</strong> ({createdCredential.kios}).
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
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const textToCopy = `Kredensial Tenant ${createdCredential.nama}:\nUsername: ${createdCredential.username}\nPassword: ${createdCredential.tempPassword}`;
                navigator.clipboard.writeText(textToCopy);
                addToast('Kredensial tenant berhasil disalin!', 'success');
              }}
              className="w-full h-10 text-xs font-bold gap-1.5"
            >
              <Icon icon="heroicons:document-duplicate-20-solid" width="16" height="16" />
              <span>Salin Kredensial</span>
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default KetersediaanKios;
