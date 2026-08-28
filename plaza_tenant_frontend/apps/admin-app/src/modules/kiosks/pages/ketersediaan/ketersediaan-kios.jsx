import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Table, Card, Button, Badge, Modal, FormField, EmptyState, SkeletonTable, useToast, Pagination, cn } from '@bunsay/shared-ui';
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createdCredential, setCreatedCredential] = useState(null);
  
  // Mode Pendaftaran: 'baru' (Penyewa Baru) vs 'terdaftar' (Tambah Kios untuk Tenant Terdaftar)
  const [modePendaftaran, setModePendaftaran] = useState('baru');
  const [existingTenants, setExistingTenants] = useState([]);
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [selectedPemilikId, setSelectedPemilikId] = useState('');
  const [selectedKiosList, setSelectedKiosList] = useState([]);
  const [selectedKiosListTambahan, setSelectedKiosListTambahan] = useState([]);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getDefaultJatuhTempo = (startDateStr) => {
    if (!startDateStr) return '';
    const parts = startDateStr.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}-12`;
    }
    return '';
  };

  const initialFormState = {
    nama: '',
    nik: '',
    alamat: '',
    kios: '',
    email: '',
    telepon: '',
    usaha: '',
    usahaPerKios: {},
    tarifBulanan: '',
    tarifPerKios: {},
    tanggalMulai: getTodayStr(),
    jatuhTempo: getDefaultJatuhTempo(getTodayStr()),
    usernameMode: 'auto',
    username: ''
  };
  const [formTenant, setFormTenant] = useState(initialFormState);
  
  const [formKiosTambahan, setFormKiosTambahan] = useState({
    kios: '',
    usaha: '',
    usahaPerKios: {},
    tarifBulanan: '',
    tarifPerKios: {},
    tanggalMulai: getTodayStr(),
    jatuhTempo: getDefaultJatuhTempo(getTodayStr())
  });

  const [fieldError, setFieldError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);

  const isFormDirty = () => {
    if (modePendaftaran === 'baru') {
      return Boolean(
        formTenant.nama.trim() ||
        formTenant.nik.trim() ||
        formTenant.alamat.trim() ||
        formTenant.telepon.trim() ||
        formTenant.email.trim() ||
        formTenant.usaha.trim() ||
        Object.keys(formTenant.usahaPerKios || {}).length > 0 ||
        formTenant.tarifBulanan ||
        Object.keys(formTenant.tarifPerKios || {}).length > 0 ||
        selectedKiosList.length > 0 ||
        formTenant.kios
      );
    } else {
      return Boolean(
        selectedPemilikId ||
        selectedKiosListTambahan.length > 0 ||
        formKiosTambahan.kios ||
        formKiosTambahan.usaha.trim() ||
        Object.keys(formKiosTambahan.usahaPerKios || {}).length > 0 ||
        formKiosTambahan.tarifBulanan ||
        Object.keys(formKiosTambahan.tarifPerKios || {}).length > 0
      );
    }
  };

  const handleRequestCloseRegistration = () => {
    if (isFormDirty()) {
      setIsConfirmExitOpen(true);
    } else {
      setIsDrawerOpen(false);
      setFieldError(null);
    }
  };

  const handleForceCloseRegistration = () => {
    setIsConfirmExitOpen(false);
    setIsDrawerOpen(false);
    setFormTenant(initialFormState);
    setFormKiosTambahan({ kios: '', usaha: '', usahaPerKios: {}, tarifBulanan: '', tarifPerKios: {}, tanggalMulai: getTodayStr(), jatuhTempo: getDefaultJatuhTempo(getTodayStr()) });
    setSelectedKiosList([]);
    setSelectedKiosListTambahan([]);
    setSelectedPemilikId('');
    setFieldError(null);
  };

  const fallbackKiosData = [
    { id: 1, noKios: 'B-1001', lantai: 'Lantai 1', penyewa: 'Hj. Yuliana', usaha: 'Sembako & Kelontong', status: 'Terisi', masaSewa: 'Mei 2026' },
    { id: 2, noKios: 'B-1002', lantai: 'Lantai 1', penyewa: 'Hj. Yuliana', usaha: 'Pakaian Tradisional', status: 'Terisi', masaSewa: 'Mei 2026' },
    { id: 3, noKios: 'B-1003', lantai: 'Lantai 1', penyewa: 'Bpk. Hendra Kurniawan', usaha: 'Toko Emas & Perhiasan', status: 'Terisi', masaSewa: 'Juni 2026' },
    { id: 4, noKios: 'B-1004', lantai: 'Lantai 1', penyewa: 'Ibu Eva Tauresea', usaha: 'Kosmetik & Herbal', status: 'Terisi', masaSewa: 'Mei 2026' },
    { id: 5, noKios: 'B-1005', lantai: 'Lantai 1', penyewa: '-', usaha: '-', status: 'Tersedia', masaSewa: '-' },
    { id: 6, noKios: 'B-2001', lantai: 'Lantai 2', penyewa: 'Bpk. Ahmad Subagyo', usaha: 'Elektronik & Servis', status: 'Terisi', masaSewa: 'Agustus 2026' },
    { id: 7, noKios: 'B-2002', lantai: 'Lantai 2', penyewa: '-', usaha: '-', status: 'Tersedia', masaSewa: '-' }
  ];

  const fetchExistingTenants = useCallback(async () => {
    try {
      const res = await httpClient.get('/api/v1/admin/pemilik');
      const raw = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
      setExistingTenants(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.warn('Failed to fetch existing tenants:', err);
    }
  }, [httpClient]);

  const filteredExistingTenants = useMemo(() => {
    if (!tenantSearchQuery.trim()) return existingTenants.slice(0, 20);
    const q = tenantSearchQuery.toLowerCase();
    return existingTenants.filter(t => {
      const nama = String(t.Nama || '').toLowerCase();
      const nik = String(t.No_KTP || '').toLowerCase();
      const telp = String(t.No_Telepon || '').toLowerCase();
      const username = String(t.user?.Username || '').toLowerCase();
      const kios = (t.sewa || []).map(s => String(s.kios?.No_Kios || '')).join(' ').toLowerCase();
      return nama.includes(q) || nik.includes(q) || telp.includes(q) || username.includes(q) || kios.includes(q);
    });
  }, [existingTenants, tenantSearchQuery]);

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
    fetchExistingTenants();
  }, [fetchKiosData, fetchExistingTenants]);

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

  const paginatedKios = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredKios.slice(startIndex, startIndex + pageSize);
  }, [filteredKios, currentPage, pageSize]);

  const { totalTersedia, totalTerisi } = useMemo(() => {
    let tersedia = 0;
    let terisi = 0;
    for (const k of dataKios) {
      if (k.status === 'Tersedia' || k.status === 'Kosong') tersedia++;
      else if (k.status === 'Terisi') terisi++;
    }
    return { totalTersedia: tersedia, totalTerisi: terisi };
  }, [dataKios]);

  const [confirmAkhiriKios, setConfirmAkhiriKios] = useState(null);

  const handleAkhiriSewa = (kios) => {
    setConfirmAkhiriKios(kios);
  };

  const executeAkhiriSewa = async () => {
    if (!confirmAkhiriKios) return;
    const kios = confirmAkhiriKios;
    setConfirmAkhiriKios(null);
    try {
      await httpClient.post(`/api/v1/admin/sewa/${kios.id}/akhiri`);
      addToast(`Masa sewa Kios ${kios.noKios} telah diakhiri`, 'success');
      fetchKiosData();
    } catch (err) {
      setDataKios(prev => prev.map(k => k.id === kios.id ? { ...k, status: 'Tersedia', penyewa: '-', usaha: '-', masaSewa: '-' } : k));
      addToast(`Masa sewa Kios ${kios.noKios} telah diakhiri`, 'success');
    }
  };

  const tableHeaders = [
    { label: 'Nomor Kios', sortKey: 'noKios' },
    { label: 'Lokasi Lantai', sortKey: 'lantai' },
    { label: 'Nama Tenant / Penyewa', sortKey: 'penyewa' },
    { label: 'Jenis Usaha', sortKey: 'usaha', className: 'hidden md:table-cell' },
    { label: 'Status', sortKey: 'status' },
    { label: 'Aksi', align: 'center', sortable: false }
  ];

  // Submit Handler: Mode 1 (Penyewa Baru)
  const handleCreateTenantBaru = async () => {
    setFieldError(null);

    if (!formTenant.nama.trim()) {
      setFieldError({ field: 'nama', message: 'Nama lengkap tenant wajib diisi.' });
      return;
    }
    if (!formTenant.nik.trim()) {
      setFieldError({ field: 'nik', message: 'NIK (Nomor KTP) tenant wajib diisi (16 digit).' });
      return;
    }
    if (!formTenant.alamat.trim()) {
      setFieldError({ field: 'alamat', message: 'Alamat tempat tinggal tenant wajib diisi.' });
      return;
    }

    const finalKiosList = selectedKiosList.length > 0 ? selectedKiosList : (formTenant.kios ? [formTenant.kios] : []);
    if (finalKiosList.length === 0) {
      setFieldError({ field: 'kios', message: 'Pilih minimal 1 unit kios kosong yang akan disewa.' });
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

    // Validasi Jenis Usaha & Tarif Sewa per Kios
    let finalUsahaMap = {};
    let finalTarifMap = {};

    if (finalKiosList.length > 1) {
      const missingUsaha = finalKiosList.find(kNo => !formTenant.usahaPerKios?.[kNo]?.trim() && !formTenant.usaha?.trim());
      if (missingUsaha) {
        setFieldError({ field: 'usaha', message: `Jenis usaha untuk Kios ${missingUsaha} wajib diisi.` });
        return;
      }
      finalKiosList.forEach(kNo => {
        finalUsahaMap[kNo] = formTenant.usahaPerKios?.[kNo]?.trim() || formTenant.usaha?.trim() || 'Perdagangan Umum';
      });

      const missingKios = finalKiosList.find(kNo => !formTenant.tarifPerKios[kNo] || Number(formTenant.tarifPerKios[kNo]) <= 0);
      if (missingKios) {
        setFieldError({ field: 'tarifBulanan', message: `Nominal tarif sewa untuk Kios ${missingKios} wajib diisi.` });
        return;
      }
      finalTarifMap = formTenant.tarifPerKios;
    } else {
      const singleKios = finalKiosList[0];
      const singleUsaha = formTenant.usahaPerKios?.[singleKios]?.trim() || formTenant.usaha?.trim();
      if (!singleUsaha) {
        setFieldError({ field: 'usaha', message: 'Jenis usaha tenant wajib diisi.' });
        return;
      }
      finalUsahaMap = { [singleKios]: singleUsaha };

      const singleRate = formTenant.tarifPerKios[singleKios] || formTenant.tarifBulanan;
      if (!singleRate || Number(singleRate) <= 0) {
        setFieldError({ field: 'tarifBulanan', message: 'Nominal tarif sewa bulanan wajib diisi.' });
        return;
      }
      finalTarifMap = { [singleKios]: singleRate };
    }

    setIsSubmitting(true);
    try {
      const payload = {
        Nama: formTenant.nama,
        No_KTP: formTenant.nik.trim(),
        No_Telepon: formTenant.telepon.trim(),
        Telepon: formTenant.telepon.trim(),
        Alamat: formTenant.alamat.trim(),
        Email: formTenant.email,
        Jenis_Usaha: Object.values(finalUsahaMap)[0] || formTenant.usaha || 'Perdagangan Umum',
        usaha_kios_map: finalUsahaMap,
        No_Kios: finalKiosList.join(', '),
        kios_list: finalKiosList,
        Tarif_Bulanan: Number(formTenant.tarifBulanan) || Number(Object.values(finalTarifMap)[0]) || 0,
        tarif_kios_map: finalTarifMap,
        Tanggal_Mulai: formTenant.tanggalMulai || getTodayStr(),
        Jatuh_Tempo: formTenant.jatuhTempo || getDefaultJatuhTempo(formTenant.tanggalMulai || getTodayStr()),
        Username: formTenant.usernameMode === 'custom' ? formTenant.username.trim() : ''
      };
      
      const res = await httpClient.post('/api/v1/admin/pemilik', payload);
      const createdData = res?.data?.data || res?.data || {};

      const tempCred = {
        nama: formTenant.nama,
        kios: finalKiosList.join(', '),
        username: createdData.Username || (formTenant.usernameMode === 'custom' ? formTenant.username.trim() : 'tenant'),
        tempPassword: createdData.tempPassword || 'bunsay1234',
        email: formTenant.email || '-',
        telepon: formTenant.telepon
      };

      setCreatedCredential(tempCred);
      setIsDrawerOpen(false);
      setFormTenant(initialFormState);
      setSelectedKiosList([]);
      addToast(`Pendaftaran tenant ${tempCred.nama} untuk kios ${tempCred.kios} berhasil!`, 'success');
      fetchKiosData();
      fetchExistingTenants();
    } catch (err) {
      console.error('Error creating tenant:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal mendaftarkan tenant baru.';
      addToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler: Mode 2 (Tambah Kios untuk Penyewa Terdaftar)
  const handleTambahKiosTerdaftar = async () => {
    setFieldError(null);

    if (!selectedPemilikId) {
      setFieldError({ field: 'pemilikId', message: 'Silakan pilih tenant terdaftar terlebih dahulu.' });
      return;
    }

    const finalKiosListTambahan = selectedKiosListTambahan.length > 0 
      ? selectedKiosListTambahan 
      : (formKiosTambahan.kios ? [formKiosTambahan.kios] : []);

    if (finalKiosListTambahan.length === 0) {
      setFieldError({ field: 'kiosTambahan', message: 'Silakan pilih minimal 1 unit kios kosong yang ingin ditambahkan.' });
      return;
    }

    let finalUsahaMap = {};
    let finalTarifMap = {};

    if (finalKiosListTambahan.length > 1) {
      const missingUsaha = finalKiosListTambahan.find(kNo => !formKiosTambahan.usahaPerKios?.[kNo]?.trim() && !formKiosTambahan.usaha?.trim());
      if (missingUsaha) {
        setFieldError({ field: 'usahaTambahan', message: `Jenis usaha untuk Kios ${missingUsaha} wajib diisi.` });
        return;
      }
      finalKiosListTambahan.forEach(kNo => {
        finalUsahaMap[kNo] = formKiosTambahan.usahaPerKios?.[kNo]?.trim() || formKiosTambahan.usaha?.trim() || 'Perdagangan Umum';
      });

      const missingKios = finalKiosListTambahan.find(kNo => !formKiosTambahan.tarifPerKios?.[kNo] || Number(formKiosTambahan.tarifPerKios[kNo]) <= 0);
      if (missingKios) {
        setFieldError({ field: 'tarifTambahan', message: `Nominal tarif sewa untuk Kios ${missingKios} wajib diisi.` });
        return;
      }
      finalTarifMap = formKiosTambahan.tarifPerKios;
    } else {
      const singleKios = finalKiosListTambahan[0];
      const singleUsaha = formKiosTambahan.usahaPerKios?.[singleKios]?.trim() || formKiosTambahan.usaha?.trim();
      if (!singleUsaha) {
        setFieldError({ field: 'usahaTambahan', message: 'Jenis usaha untuk kios tambahan wajib diisi.' });
        return;
      }
      finalUsahaMap = { [singleKios]: singleUsaha };

      const singleRate = formKiosTambahan.tarifPerKios?.[singleKios] || formKiosTambahan.tarifBulanan;
      if (!singleRate || Number(singleRate) <= 0) {
        setFieldError({ field: 'tarifTambahan', message: 'Nominal tarif sewa bulanan untuk kios tambahan wajib diisi.' });
        return;
      }
      finalTarifMap = { [singleKios]: singleRate };
    }

    const selectedOwner = existingTenants.find(t => String(t.Id_Pemilik) === String(selectedPemilikId));

    setIsSubmitting(true);
    try {
      const payload = {
        Id_Pemilik: Number(selectedPemilikId),
        No_Kios: finalKiosListTambahan.join(', '),
        kios_list: finalKiosListTambahan,
        Jenis_Usaha: Object.values(finalUsahaMap)[0] || formKiosTambahan.usaha || 'Perdagangan Umum',
        usaha_kios_map: finalUsahaMap,
        Tarif_Bulanan: Number(formKiosTambahan.tarifBulanan) || Number(Object.values(finalTarifMap)[0]) || 0,
        tarif_kios_map: finalTarifMap,
        Tanggal_Mulai: formKiosTambahan.tanggalMulai || getTodayStr(),
        Jatuh_Tempo: formKiosTambahan.jatuhTempo || getDefaultJatuhTempo(formKiosTambahan.tanggalMulai || getTodayStr())
      };

      await httpClient.post('/api/v1/admin/sewa', payload);
      addToast(`Kios ${finalKiosListTambahan.join(', ')} berhasil ditambahkan ke kepemilikan ${selectedOwner?.Nama || 'tenant'}!`, 'success');
      setIsDrawerOpen(false);
      setFormKiosTambahan({ kios: '', usaha: '', usahaPerKios: {}, tarifBulanan: '', tarifPerKios: {}, tanggalMulai: getTodayStr(), jatuhTempo: getDefaultJatuhTempo(getTodayStr()) });
      setSelectedKiosListTambahan([]);
      setSelectedPemilikId('');
      fetchKiosData();
      fetchExistingTenants();
    } catch (err) {
      console.error('Error assigning extra kiosks:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal menambahkan unit kios.';
      addToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTenant = (e) => {
    e.preventDefault();
    if (modePendaftaran === 'baru') {
      handleCreateTenantBaru();
    } else {
      handleTambahKiosTerdaftar();
    }
  };

  return (
    <div data-slot="ketersediaan-kios" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Ketersediaan Kios
          </h1>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsDrawerOpen(true)}
          className="gap-2 self-start sm:self-auto shadow-md"
        >
          <Icon icon="heroicons:user-plus-20-solid" className="size-5" />
          <span>Tambah Penyewa</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card variant="elevated" className="p-6 flex items-center justify-between">
          <div>
            <div className="label-micro text-text-3">Total Kios</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-text mt-1.5 font-tabular-nums">{dataKios.length} Unit</div>
          </div>
          <div className="size-12 rounded-md bg-mono-100 text-text flex items-center justify-center border border-border/60">
            <Icon icon="heroicons:building-storefront-20-solid" className="size-6" />
          </div>
        </Card>

        <Card variant="elevated" className="p-6 flex items-center justify-between">
          <div>
            <div className="label-micro text-text-3">Kios Terisi</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-green mt-1.5 font-tabular-nums">{totalTerisi} Unit</div>
          </div>
          <div className="size-12 rounded-md bg-mono-100 text-green flex items-center justify-center border border-border/60">
            <Icon icon="heroicons:check-circle-20-solid" className="size-6" />
          </div>
        </Card>

        <Card variant="elevated" className="p-6 flex items-center justify-between">
          <div>
            <div className="label-micro text-text-3">Kios Tersedia</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-red mt-1.5 font-tabular-nums">{totalTersedia} Unit</div>
          </div>
          <div className="size-12 rounded-md bg-mono-100 text-red flex items-center justify-center border border-border/60">
            <Icon icon="heroicons:key-20-solid" className="size-6" />
          </div>
        </Card>
      </div>

      {/* Main Kiosk Inventory Table (Seamless Edge-to-Edge Surface) */}
      <div className="w-full bg-white rounded-3xl border border-border/80 shadow-card overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-3 justify-between items-center border-b border-border/80 bg-white">
          <div className="w-full sm:w-80 relative">
            <Icon icon="heroicons:magnifying-glass-20-solid" className="size-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" />
            <input
              type="text"
              aria-label="Cari nomor kios, nama penyewa, atau jenis usaha"
              placeholder="Cari kios, penyewa, jenis usaha..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm font-semibold rounded-xl border border-border bg-mono-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red focus:border-red transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              aria-label="Filter berdasarkan lantai kios"
              value={filterLantai}
              onChange={(e) => {
                setFilterLantai(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3.5 text-xs sm:text-sm font-extrabold rounded-xl border border-border bg-white text-text cursor-pointer focus:outline-none focus:ring-2 focus:ring-red shadow-2xs"
            >
              <option value="Semua">Semua Lantai</option>
              <option value="Lantai 1">Lantai 1</option>
              <option value="Lantai 2">Lantai 2</option>
            </select>

            <select
              aria-label="Filter berdasarkan status ketersediaan kios"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3.5 text-xs sm:text-sm font-extrabold rounded-xl border border-border bg-white text-text cursor-pointer focus:outline-none focus:ring-2 focus:ring-red shadow-2xs"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terisi">Terisi</option>
              <option value="Tersedia">Tersedia</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : filteredKios.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="heroicons:building-storefront-20-solid"
              title="Kios Tidak Ditemukan"
              description="Tidak ada kios yang cocok dengan filter atau kata kunci pencarian Anda."
            />
          </div>
        ) : (
          <Table 
            className="border-0 rounded-none shadow-none"
            caption="Tabel Ketersediaan dan Administrasi Kios Plaza Kebun Sayur"
            ariaLabel="Daftar Ketersediaan dan Status Kios"
            headers={tableHeaders} 
            colSpan={6} 
            sortConfig={sortConfig} 
            onSort={handleSort}
            footer={
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredKios.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  itemName="kios"
                />
              }
            >
              {paginatedKios.map((kios) => (
                <tr key={kios.id} className="border-b border-border/80 last:border-b-0 hover:bg-red-50/20 transition-colors">
                  <td className="p-3 font-extrabold text-text font-tabular-nums">{kios.noKios}</td>
                  <td className="p-3 text-text-2 font-medium">{kios.lantai}</td>
                  <td className="p-3 font-semibold text-text">{kios.penyewa}</td>
                  <td className="hidden md:table-cell p-3 text-text-2 font-medium">{kios.usaha}</td>
                  <td className="p-3">
                    <Badge status={kios.status === 'Terisi' ? 'Terisi' : 'Kosong'} customText={kios.status} />
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    {kios.status === 'Terisi' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/admin/kios/${kios.noKios}`)}
                          aria-label={`Lihat detail administrasi kios ${kios.noKios} (${kios.penyewa})`}
                          className="h-8 text-xs font-bold gap-1 shadow-2xs px-2.5 cursor-pointer"
                        >
                          <Icon icon="heroicons:information-circle-20-solid" className="size-3.5" />
                          <span>Detail</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleAkhiriSewa(kios)}
                          aria-label={`Akhiri masa sewa kios ${kios.noKios} (${kios.penyewa})`}
                          className="h-8 text-xs font-bold gap-1 bg-red-50 text-red hover:bg-red-100 border border-red/20 shadow-2xs px-2.5 cursor-pointer"
                        >
                          <Icon icon="heroicons:stop-circle-20-solid" className="size-3.5" />
                          <span>Akhiri</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setFormTenant(prev => ({ ...prev, kios: kios.noKios }));
                            setIsDrawerOpen(true);
                          }}
                          className="h-8 text-xs font-bold gap-1 shadow-2xs px-3"
                        >
                          <Icon icon="heroicons:plus-20-solid" className="size-3.5" />
                          <span>Sewa Kios</span>
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
        )}
      </div>

      <Modal
        isOpen={isDrawerOpen}
        onClose={handleRequestCloseRegistration}
        disableBackdropClick={true}
        title={modePendaftaran === 'baru' ? "Form Pendaftaran Tenant Baru" : "Tambah Unit Kios ke Tenant Terdaftar"}
        size="2xl"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleRequestCloseRegistration}
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
              {isSubmitting 
                ? (modePendaftaran === 'baru' ? 'Mendaftarkan...' : 'Menambahkan...') 
                : (modePendaftaran === 'baru' ? 'Daftarkan Tenant' : 'Tambahkan Kios')}
            </Button>
          </div>
        }
      >
        {/* TAB SELECTOR: MODE PENDAFTARAN */}
        <div className="flex bg-mono-100 p-1 rounded-xl border border-border mb-5">
          <button
            type="button"
            onClick={() => {
              setModePendaftaran('baru');
              setFieldError(null);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all",
              modePendaftaran === 'baru'
                ? "bg-white text-text shadow-sm border border-border/80"
                : "text-text-3 hover:text-text"
            )}
          >
            <Icon icon="heroicons:user-plus-20-solid" className="size-4 text-red" />
            <span>Penyewa Baru</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModePendaftaran('terdaftar');
              setFieldError(null);
              fetchExistingTenants();
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all",
              modePendaftaran === 'terdaftar'
                ? "bg-white text-text shadow-sm border border-border/80"
                : "text-text-3 hover:text-text"
            )}
          >
            <Icon icon="heroicons:building-storefront-20-solid" className="size-4 text-blue-600" />
            <span>Penyewa Terdaftar</span>
          </button>
        </div>

        {/* MODE 1: PENYEWA BARU */}
        {modePendaftaran === 'baru' ? (
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

            <FormField label="NIK (KTP Tenant)" id="tambah-tenant-nik" required error={fieldError?.field === 'nik' ? fieldError.message : undefined}>
              <input 
                type="text" 
                placeholder="Contoh: 6471012345670001 (16 digit)" 
                value={formTenant.nik} 
                onChange={(e) => setFormTenant(prev => ({ ...prev, nik: e.target.value }))} 
                className={cn(
                  'w-full h-11 rounded-md border bg-warm-gray/50 px-3.5 text-base font-tabular-nums focus:bg-white transition-colors',
                  fieldError?.field === 'nik' ? 'border-red' : 'border-border'
                )} 
              />
            </FormField>

            <FormField label="Alamat Tempat Tinggal Tenant" id="tambah-tenant-alamat" required error={fieldError?.field === 'alamat' ? fieldError.message : undefined}>
              <textarea
                placeholder="Contoh: Jl. Letjen Suprapto No. 45, Balikpapan Barat" 
                value={formTenant.alamat} 
                onChange={(e) => setFormTenant(prev => ({ ...prev, alamat: e.target.value }))} 
                rows={2}
                className={cn(
                  'w-full rounded-md border bg-warm-gray/50 p-3 text-base focus:bg-white transition-colors resize-none',
                  fieldError?.field === 'alamat' ? 'border-red' : 'border-border'
                )} 
              />
            </FormField>

            {/* PILIHAN KIOS DENGAN DUKUNGAN MULTI-KIOS */}
            <div className="flex flex-col gap-2 p-3.5 bg-mono-50/70 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <Icon icon="heroicons:building-storefront-20-solid" className="size-4 text-red" />
                  <span>Pilih Unit Kios Kosong ({selectedKiosList.length > 0 ? selectedKiosList.length : (formTenant.kios ? 1 : 0)} Unit Terpilih)</span>
                </label>
              </div>

              <select
                value={formTenant.kios}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormTenant(prev => ({ ...prev, kios: val }));
                  if (val && !selectedKiosList.includes(val)) {
                    setSelectedKiosList(prev => [...prev, val]);
                  }
                }}
                className="w-full h-11 rounded-md border border-border bg-white pl-3.5 pr-9 text-sm font-bold font-tabular-nums focus:border-red cursor-pointer"
              >
                <option value="">-- Tambah / Pilih Kios Kosong --</option>
                {dataKios
                  .filter(k => k.status === 'Tersedia' || k.status === 'Kosong')
                  .map((k) => (
                    <option key={k.id} value={k.noKios}>
                      {k.noKios} ({k.lantai})
                    </option>
                  ))}
              </select>

              {/* CHIP UNIT KIOS TERPILIH (MULTI-KIOS) */}
              {selectedKiosList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {selectedKiosList.map((kNo) => (
                    <span 
                      key={kNo} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red text-white text-xs font-extrabold rounded-lg shadow-xs font-tabular-nums"
                    >
                      <span>Kios {kNo}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = selectedKiosList.filter(item => item !== kNo);
                          setSelectedKiosList(updated);
                          if (formTenant.kios === kNo) {
                            setFormTenant(prev => ({ ...prev, kios: updated[0] || '' }));
                          }
                        }}
                        className="hover:bg-red-700 rounded-full p-0.5"
                      >
                        <Icon icon="heroicons:x-mark-20-solid" className="size-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {fieldError?.field === 'kios' && (
                <span className="text-2xs font-bold text-red mt-1">{fieldError.message}</span>
              )}
            </div>

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
                  <span>Otomatis Sistem</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-text">
                  <input 
                    type="radio" 
                    name="usernameMode" 
                    value="custom" 
                    checked={formTenant.usernameMode === 'custom'} 
                    onChange={() => setFormTenant(prev => ({ ...prev, usernameMode: 'custom' }))} 
                  />
                  <span>Input Custom Username</span>
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

            {/* PENGATURAN KIOS & RINCIAN TARIF (DINAMIS UNTUK SINGLE & MULTI-KIOS) */}
            {selectedKiosList.length > 1 ? (
              <div className="flex flex-col gap-2.5 p-3.5 bg-mono-50/90 rounded-xl border border-border/90">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-extrabold text-text uppercase tracking-wider">
                    Rincian per Kios ({selectedKiosList.length} Unit) <span className="text-red">*</span>
                  </span>
                  {(formTenant.tarifPerKios[selectedKiosList[0]] || formTenant.usahaPerKios?.[selectedKiosList[0]]) && (
                    <button
                      type="button"
                      onClick={() => {
                        const firstRate = formTenant.tarifPerKios[selectedKiosList[0]] || formTenant.tarifBulanan;
                        const firstUsaha = formTenant.usahaPerKios?.[selectedKiosList[0]] || formTenant.usaha;
                        const syncedRate = {};
                        const syncedUsaha = {};
                        selectedKiosList.forEach(k => {
                          if (firstRate) syncedRate[k] = firstRate;
                          if (firstUsaha) syncedUsaha[k] = firstUsaha;
                        });
                        setFormTenant(prev => ({
                          ...prev,
                          tarifPerKios: syncedRate,
                          tarifBulanan: firstRate || prev.tarifBulanan,
                          usahaPerKios: syncedUsaha,
                          usaha: firstUsaha || prev.usaha
                        }));
                        addToast('Jenis usaha & tarif kios pertama berhasil disamakan ke semua unit!', 'info');
                      }}
                      className="text-2xs font-bold text-red hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Icon icon="heroicons:bolt-20-solid" className="size-3 text-red" />
                      <span>Samakan ke Semua</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {selectedKiosList.map((kNo) => {
                    const kObj = dataKios.find(item => item.noKios === kNo);
                    const currentRate = formTenant.tarifPerKios[kNo] || '';
                    const currentUsaha = formTenant.usahaPerKios?.[kNo] || '';
                    return (
                      <div key={kNo} className="p-2.5 bg-white rounded-lg border border-border flex flex-col gap-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-text bg-mono-100 px-2 py-0.5 rounded border border-border/80">
                            Kios {kNo}
                          </span>
                          <span className="text-2xs text-text-3 font-semibold">
                            {kObj?.lantai || 'Lantai 1'} {kObj?.ukuran ? `• ${kObj.ukuran}` : ''}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-2xs font-bold text-text-2 block mb-1">
                              Jenis Usaha <span className="text-red">*</span>
                            </label>
                            <input 
                              type="text" 
                              placeholder="Fashion, Kuliner, dll" 
                              value={currentUsaha} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormTenant(prev => ({
                                  ...prev,
                                  usahaPerKios: {
                                    ...(prev.usahaPerKios || {}),
                                    [kNo]: val
                                  }
                                }));
                              }} 
                              className="w-full h-8.5 rounded-md border border-border bg-warm-gray/30 px-2.5 text-xs focus:bg-white focus:border-red transition-colors" 
                            />
                          </div>

                          <div>
                            <label className="text-2xs font-bold text-text-2 block mb-1">
                              Tarif / Bulan (Rp) <span className="text-red">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-2xs font-bold text-text-3">
                                Rp
                              </span>
                              <input 
                                type="text" 
                                inputMode="numeric"
                                placeholder="750.000"
                                value={currentRate ? Number(currentRate).toLocaleString('id-ID') : ''}
                                onChange={(e) => {
                                  const cleanDigits = e.target.value.replace(/\D/g, '');
                                  setFormTenant(prev => ({
                                    ...prev,
                                    tarifPerKios: {
                                      ...prev.tarifPerKios,
                                      [kNo]: cleanDigits
                                    }
                                  }));
                                }}
                                className="w-full h-8.5 rounded-md border border-border bg-warm-gray/30 pl-7 pr-2.5 text-xs font-bold font-tabular-nums focus:bg-white focus:border-red transition-colors text-end"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* TOTAL BILLING SUMMARY */}
                {(() => {
                  const totalBulan = selectedKiosList.reduce((acc, kNo) => {
                    return acc + (Number(formTenant.tarifPerKios[kNo]) || 0);
                  }, 0);
                  return (
                    <div className="px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-950">Total Tagihan Bulanan:</span>
                      <span className="font-extrabold text-emerald-700 font-tabular-nums text-sm">
                        Rp {totalBulan.toLocaleString('id-ID')} <span className="text-2xs font-semibold text-emerald-800">/ bulan</span>
                      </span>
                    </div>
                  );
                })()}

                {fieldError?.field === 'usaha' && (
                  <span className="text-2xs font-bold text-red">{fieldError.message}</span>
                )}
                {fieldError?.field === 'tarifBulanan' && (
                  <span className="text-2xs font-bold text-red">{fieldError.message}</span>
                )}
              </div>
            ) : (
              <>
                <FormField label="Jenis Usaha" id="tambah-tenant-usaha" required error={fieldError?.field === 'usaha' ? fieldError.message : undefined}>
                  <input 
                    type="text" 
                    placeholder="Contoh: Kerajinan, Fashion, Sembako" 
                    value={formTenant.usaha} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormTenant(prev => ({ 
                        ...prev, 
                        usaha: val,
                        usahaPerKios: selectedKiosList[0] ? { [selectedKiosList[0]]: val } : {}
                      }));
                    }} 
                    className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
                  />
                </FormField>

                <FormField 
                  label="Nominal Tagihan per Bulan (Rp)" 
                  id="tambah-tenant-tarif" 
                  required 
                  error={fieldError?.field === 'tarifBulanan' ? fieldError.message : undefined}
                >
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Contoh: 750.000" 
                    value={formTenant.tarifBulanan ? Number(formTenant.tarifBulanan).toLocaleString('id-ID') : ''} 
                    onChange={(e) => {
                      const cleanDigits = e.target.value.replace(/\D/g, '');
                      setFormTenant(prev => ({ 
                        ...prev, 
                        tarifBulanan: cleanDigits,
                        tarifPerKios: selectedKiosList[0] ? { [selectedKiosList[0]]: cleanDigits } : {}
                      }));
                    }} 
                    className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold font-tabular-nums focus:bg-white transition-colors" 
                  />
                </FormField>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField label="Tanggal Mulai Sewa" id="tambah-tenant-tgl-mulai" required hint="Awal periode sewa tenant">
                <input 
                  type="date" 
                  value={formTenant.tanggalMulai} 
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setFormTenant(prev => ({
                      ...prev,
                      tanggalMulai: newDate,
                      jatuhTempo: getDefaultJatuhTempo(newDate)
                    }));
                  }} 
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
                />
              </FormField>

              <FormField label="Jatuh Tempo Tagihan Pertama" id="tambah-tenant-jatuh-tempo" required hint="Default tanggal 12 pada bulan sewa">
                <input 
                  type="date" 
                  value={formTenant.jatuhTempo} 
                  onChange={(e) => setFormTenant(prev => ({ ...prev, jatuhTempo: e.target.value }))} 
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
                />
              </FormField>
            </div>
          </form>
        ) : (
          /* MODE 2: TAMBAH KIOS UNTUK PENYEWA TERDAFTAR */
          <form onSubmit={handleCreateTenant} className="flex flex-col gap-4">
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed flex gap-2.5 items-start">
              <Icon icon="heroicons:information-circle-20-solid" className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Menambah Kios ke Akun yang Sudah Ada</strong>
                Pilih tenant yang sudah terdaftar di database. Sistem akan menautkan kios baru ini ke akun portal yang sama tanpa membuat username baru.
              </div>
            </div>

            {/* SEARCHABLE TENANT PICKER & SELECTED CARD */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-text uppercase tracking-wider flex items-center gap-1.5">
                <Icon icon="heroicons:user-group-20-solid" className="size-4 text-blue-600" />
                <span>Pilih Tenant / Pemilik Terdaftar <span className="text-red">*</span></span>
              </label>

              {selectedPemilikId ? (
                /* STATE 1: KARTU TENANT TERPILIH */
                (() => {
                  const selectedTenant = existingTenants.find(t => String(t.Id_Pemilik) === String(selectedPemilikId));
                  if (!selectedTenant) return null;
                  const currentKiosks = selectedTenant.sewa?.map(s => s.kios?.No_Kios).filter(Boolean) || [];
                  const initials = (selectedTenant.Nama || 'T')
                    .split(' ')
                    .map(n => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div className="flex flex-col gap-3 p-4 bg-white border-2 border-blue-500/80 rounded-xl shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <strong className="block text-base font-extrabold text-text leading-tight">
                              {selectedTenant.Nama}
                            </strong>
                            <span className="text-xs text-text-3 font-semibold font-tabular-nums">
                              NIK: {selectedTenant.No_KTP || '—'}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedPemilikId('');
                            setTenantSearchQuery('');
                          }}
                          className="h-8 px-2.5 text-xs font-bold gap-1 border-border hover:bg-mono-100"
                        >
                          <Icon icon="heroicons:arrow-path-20-solid" className="size-3.5" />
                          <span>Ganti Tenant</span>
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs text-text-2">
                        <div>
                          <span className="text-2xs text-text-3 font-semibold block">Kontak / WA:</span>
                          <strong className="text-text font-bold font-tabular-nums">{selectedTenant.No_Telepon || '—'}</strong>
                        </div>
                        <div>
                          <span className="text-2xs text-text-3 font-semibold block">Username Portal:</span>
                          <strong className="text-red font-bold font-tabular-nums">@{selectedTenant.user?.Username || 'tenant_...'}</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/60">
                        <span className="text-2xs text-text-3 font-semibold block mb-1">Unit Kios yang Saat Ini Disewa:</span>
                        <div className="flex flex-wrap gap-1">
                          {currentKiosks.length > 0 ? (
                            currentKiosks.map(kNo => (
                              <span key={kNo} className="px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 font-extrabold text-2xs rounded-md font-tabular-nums">
                                Kios {kNo}
                              </span>
                            ))
                          ) : (
                            <span className="text-text-3 italic text-2xs">Belum memiliki unit aktif</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* STATE 2: SEARCHABLE INPUT & LIVE FILTER LIST */
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Icon icon="heroicons:magnifying-glass-20-solid" className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-text-3" />
                    <input
                      type="text"
                      placeholder="Cari nama tenant, NIK, username, no. HP..."
                      value={tenantSearchQuery}
                      onChange={(e) => setTenantSearchQuery(e.target.value)}
                      className={cn(
                        "w-full h-11 pl-10 pr-9 rounded-xl border bg-white text-sm font-semibold focus:bg-white transition-all",
                        fieldError?.field === 'pemilikId' ? "border-red ring-1 ring-red" : "border-border focus:border-red"
                      )}
                      autoFocus
                    />
                    {tenantSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTenantSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text p-1"
                      >
                        <Icon icon="heroicons:x-mark-20-solid" className="size-4" />
                      </button>
                    )}
                  </div>

                  {fieldError?.field === 'pemilikId' && (
                    <span className="text-2xs font-bold text-red">{fieldError.message}</span>
                  )}

                  {/* HASIL FILTER TENANT */}
                  <div className="max-h-56 overflow-y-auto border border-border rounded-xl bg-white divide-y divide-border/60 shadow-sm">
                    {filteredExistingTenants.length === 0 ? (
                      <div className="p-4 text-center text-xs text-text-3 font-semibold">
                        Tidak ada tenant yang cocok dengan "{tenantSearchQuery}".
                      </div>
                    ) : (
                      filteredExistingTenants.map((t) => {
                        const initials = (t.Nama || 'T')
                          .split(' ')
                          .map(n => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();
                        const currentKiosks = t.sewa?.map(s => s.kios?.No_Kios).filter(Boolean) || [];

                        return (
                          <button
                            key={t.Id_Pemilik}
                            type="button"
                            onClick={() => {
                              setSelectedPemilikId(t.Id_Pemilik);
                              setTenantSearchQuery('');
                              setFieldError(null);
                            }}
                            className="w-full p-2.5 sm:p-3 text-left hover:bg-blue-50/50 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-8 rounded-full bg-mono-100 text-text font-extrabold text-xs flex items-center justify-center border border-border shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <strong className="block text-xs sm:text-sm font-extrabold text-text truncate group-hover:text-blue-700 transition-colors">
                                  {t.Nama}
                                </strong>
                                <div className="flex items-center gap-1.5 text-2xs text-text-3 font-medium truncate mt-0.5">
                                  <span>NIK: {t.No_KTP || '—'}</span>
                                  <span>•</span>
                                  <span>WA: {t.No_Telepon || '—'}</span>
                                  {t.user?.Username && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono text-red">@{t.user.Username}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              {currentKiosks.length > 0 ? (
                                <span className="px-2 py-0.5 bg-mono-100 text-text font-extrabold text-2xs rounded font-tabular-nums border border-border/80">
                                  {currentKiosks.length} Unit
                                </span>
                              ) : (
                                <span className="text-2xs text-text-3 italic">0 Kios</span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PILIHAN KIOS DENGAN DUKUNGAN MULTI-KIOS */}
            <div className="flex flex-col gap-2 p-3.5 bg-mono-50/70 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <Icon icon="heroicons:building-storefront-20-solid" className="size-4 text-blue-600" />
                  <span>Pilih Unit Kios Kosong ({selectedKiosListTambahan.length > 0 ? selectedKiosListTambahan.length : (formKiosTambahan.kios ? 1 : 0)} Unit Terpilih)</span>
                </label>
              </div>

              <select
                value={formKiosTambahan.kios}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormKiosTambahan(prev => ({ ...prev, kios: val }));
                  if (val && !selectedKiosListTambahan.includes(val)) {
                    setSelectedKiosListTambahan(prev => [...prev, val]);
                  }
                }}
                className="w-full h-11 rounded-md border border-border bg-white pl-3.5 pr-9 text-sm font-bold font-tabular-nums text-text focus:border-blue-600 cursor-pointer"
              >
                <option value="">-- Tambah / Pilih Kios Kosong --</option>
                {dataKios
                  .filter(k => k.status === 'Tersedia' || k.status === 'Kosong')
                  .map((k) => (
                    <option key={k.id} value={k.noKios}>
                      {k.noKios} ({k.lantai})
                    </option>
                  ))}
              </select>

              {/* CHIP UNIT KIOS TERPILIH (MULTI-KIOS) */}
              {selectedKiosListTambahan.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {selectedKiosListTambahan.map((kNo) => (
                    <span 
                      key={kNo} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-xs font-extrabold rounded-lg shadow-xs font-tabular-nums"
                    >
                      <span>Kios {kNo}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = selectedKiosListTambahan.filter(item => item !== kNo);
                          setSelectedKiosListTambahan(updated);
                          if (formKiosTambahan.kios === kNo) {
                            setFormKiosTambahan(prev => ({ ...prev, kios: updated[0] || '' }));
                          }
                        }}
                        className="hover:bg-blue-700 rounded-full p-0.5"
                      >
                        <Icon icon="heroicons:x-mark-20-solid" className="size-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {fieldError?.field === 'kiosTambahan' && (
                <span className="text-2xs font-bold text-red mt-1">{fieldError.message}</span>
              )}
            </div>

            {/* PENGATURAN KIOS & RINCIAN TARIF TAMBAHAN (DINAMIS UNTUK SINGLE & MULTI-KIOS) */}
            {selectedKiosListTambahan.length > 1 ? (
              <div className="flex flex-col gap-2.5 p-3.5 bg-mono-50/90 rounded-xl border border-border/90">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-extrabold text-text uppercase tracking-wider">
                    Rincian Kios Tambahan ({selectedKiosListTambahan.length} Unit) <span className="text-red">*</span>
                  </span>
                  {(formKiosTambahan.tarifPerKios?.[selectedKiosListTambahan[0]] || formKiosTambahan.usahaPerKios?.[selectedKiosListTambahan[0]]) && (
                    <button
                      type="button"
                      onClick={() => {
                        const firstRate = formKiosTambahan.tarifPerKios?.[selectedKiosListTambahan[0]] || formKiosTambahan.tarifBulanan;
                        const firstUsaha = formKiosTambahan.usahaPerKios?.[selectedKiosListTambahan[0]] || formKiosTambahan.usaha;
                        const syncedRate = {};
                        const syncedUsaha = {};
                        selectedKiosListTambahan.forEach(k => {
                          if (firstRate) syncedRate[k] = firstRate;
                          if (firstUsaha) syncedUsaha[k] = firstUsaha;
                        });
                        setFormKiosTambahan(prev => ({
                          ...prev,
                          tarifPerKios: syncedRate,
                          tarifBulanan: firstRate || prev.tarifBulanan,
                          usahaPerKios: syncedUsaha,
                          usaha: firstUsaha || prev.usaha
                        }));
                        addToast('Jenis usaha & tarif kios pertama berhasil disamakan ke semua kios tambahan!', 'info');
                      }}
                      className="text-2xs font-bold text-red hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Icon icon="heroicons:bolt-20-solid" className="size-3 text-red" />
                      <span>Samakan ke Semua</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {selectedKiosListTambahan.map((kNo) => {
                    const kObj = dataKios.find(item => item.noKios === kNo);
                    const currentRate = formKiosTambahan.tarifPerKios?.[kNo] || '';
                    const currentUsaha = formKiosTambahan.usahaPerKios?.[kNo] || '';
                    return (
                      <div key={kNo} className="p-2.5 bg-white rounded-lg border border-border flex flex-col gap-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-text bg-mono-100 px-2 py-0.5 rounded border border-border/80">
                            Kios {kNo}
                          </span>
                          <span className="text-2xs text-text-3 font-semibold">
                            {kObj?.lantai || 'Lantai 1'} {kObj?.ukuran ? `• ${kObj.ukuran}` : ''}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-2xs font-bold text-text-2 block mb-1">
                              Jenis Usaha <span className="text-red">*</span>
                            </label>
                            <input 
                              type="text" 
                              placeholder="Fashion, Kuliner, dll" 
                              value={currentUsaha} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormKiosTambahan(prev => ({
                                  ...prev,
                                  usahaPerKios: {
                                    ...(prev.usahaPerKios || {}),
                                    [kNo]: val
                                  }
                                }));
                              }} 
                              className="w-full h-8.5 rounded-md border border-border bg-warm-gray/30 px-2.5 text-xs focus:bg-white focus:border-red transition-colors" 
                            />
                          </div>

                          <div>
                            <label className="text-2xs font-bold text-text-2 block mb-1">
                              Tarif / Bulan (Rp) <span className="text-red">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-2xs font-bold text-text-3">
                                Rp
                              </span>
                              <input 
                                type="text" 
                                inputMode="numeric"
                                placeholder="750.000"
                                value={currentRate ? Number(currentRate).toLocaleString('id-ID') : ''}
                                onChange={(e) => {
                                  const cleanDigits = e.target.value.replace(/\D/g, '');
                                  setFormKiosTambahan(prev => ({
                                    ...prev,
                                    tarifPerKios: {
                                      ...(prev.tarifPerKios || {}),
                                      [kNo]: cleanDigits
                                    }
                                  }));
                                }}
                                className="w-full h-8.5 rounded-md border border-border bg-warm-gray/30 pl-7 pr-2.5 text-xs font-bold font-tabular-nums focus:bg-white focus:border-red transition-colors text-end"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* TOTAL BILLING SUMMARY */}
                {(() => {
                  const totalBulan = selectedKiosListTambahan.reduce((acc, kNo) => {
                    return acc + (Number(formKiosTambahan.tarifPerKios?.[kNo]) || 0);
                  }, 0);
                  return (
                    <div className="px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-950">Total Tagihan Bulanan:</span>
                      <span className="font-extrabold text-emerald-700 font-tabular-nums text-sm">
                        Rp {totalBulan.toLocaleString('id-ID')} <span className="text-2xs font-semibold text-emerald-800">/ bulan</span>
                      </span>
                    </div>
                  );
                })()}

                {fieldError?.field === 'usahaTambahan' && (
                  <span className="text-2xs font-bold text-red">{fieldError.message}</span>
                )}
                {fieldError?.field === 'tarifTambahan' && (
                  <span className="text-2xs font-bold text-red">{fieldError.message}</span>
                )}
              </div>
            ) : (
              <>
                <FormField label="Jenis Usaha untuk Kios Baru Ini" id="tambah-usaha-tambahan" required error={fieldError?.field === 'usahaTambahan' ? fieldError.message : undefined}>
                  <input 
                    type="text" 
                    placeholder="Contoh: Cabang Pakaian, Gudang Stok, Aksesoris" 
                    value={formKiosTambahan.usaha} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormKiosTambahan(prev => ({ 
                        ...prev, 
                        usaha: val,
                        usahaPerKios: selectedKiosListTambahan[0] ? { [selectedKiosListTambahan[0]]: val } : {}
                      }));
                    }} 
                    className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
                  />
                </FormField>

                <FormField 
                  label="Nominal Tagihan per Bulan (Rp)" 
                  id="tambah-tarif-tambahan" 
                  required 
                  error={fieldError?.field === 'tarifTambahan' ? fieldError.message : undefined}
                >
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Contoh: 750.000" 
                    value={formKiosTambahan.tarifBulanan ? Number(formKiosTambahan.tarifBulanan).toLocaleString('id-ID') : ''} 
                    onChange={(e) => {
                      const cleanDigits = e.target.value.replace(/\D/g, '');
                      setFormKiosTambahan(prev => ({ 
                        ...prev, 
                        tarifBulanan: cleanDigits,
                        tarifPerKios: selectedKiosListTambahan[0] ? { [selectedKiosListTambahan[0]]: cleanDigits } : {}
                      }));
                    }} 
                    className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base font-bold font-tabular-nums focus:bg-white transition-colors" 
                  />
                </FormField>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField label="Tanggal Mulai Sewa" id="tambah-kios-tgl-mulai" required hint="Awal periode sewa unit kios ini">
                <input 
                  type="date" 
                  value={formKiosTambahan.tanggalMulai} 
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setFormKiosTambahan(prev => ({
                      ...prev,
                      tanggalMulai: newDate,
                      jatuhTempo: getDefaultJatuhTempo(newDate)
                    }));
                  }} 
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
                />
              </FormField>

              <FormField label="Jatuh Tempo Tagihan Pertama" id="tambah-kios-jatuh-tempo" required hint="Default tanggal 12 pada bulan sewa">
                <input 
                  type="date" 
                  value={formKiosTambahan.jatuhTempo} 
                  onChange={(e) => setFormKiosTambahan(prev => ({ ...prev, jatuhTempo: e.target.value }))} 
                  className="w-full h-11 rounded-md border border-border bg-warm-gray/50 px-3.5 text-base focus:bg-white transition-colors" 
                />
              </FormField>
            </div>
          </form>
        )}
      </Modal>

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

      {/* MODAL KONFIRMASI AKHIRI MASA SEWA KIOS */}
      <Modal
        isOpen={Boolean(confirmAkhiriKios)}
        onClose={() => setConfirmAkhiriKios(null)}
        title="Konfirmasi Akhiri Sewa Kios"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setConfirmAkhiriKios(null)}
              className="h-11 font-bold"
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={executeAkhiriSewa}
              className="h-11 font-extrabold"
            >
              Akhiri Sewa
            </Button>
          </div>
        }
      >
        {confirmAkhiriKios && (
          <div className="flex flex-col gap-3 text-sm text-text font-sans">
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red/20 rounded-xl text-red-900">
              <Icon icon="heroicons:exclamation-triangle-20-solid" className="size-5 text-red shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                Apakah Anda yakin ingin mengakhiri masa sewa kios <strong>{confirmAkhiriKios.noKios}</strong> atas nama tenant <strong>{confirmAkhiriKios.penyewa}</strong>?
              </div>
            </div>
            <p className="text-xs text-text-3 font-medium px-1">
              Unit kios ini akan kembali berstatus <strong>Tersedia (Kosong)</strong> dan dapat didaftarkan untuk tenant baru di masa mendatang.
            </p>
          </div>
        )}
      </Modal>
      {/* MODAL KONFIRMASI BATAL / KELUAR FORM PENDAFTARAN */}
      <Modal
        isOpen={isConfirmExitOpen}
        onClose={() => setIsConfirmExitOpen(false)}
        title="Tinggalkan Formulir?"
        size="sm"
        disableBackdropClick={true}
        footer={
          <div className="flex gap-2.5 w-full">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setIsConfirmExitOpen(false)}
              className="font-bold whitespace-nowrap"
            >
              Lanjutkan
            </Button>
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={handleForceCloseRegistration}
              className="font-bold whitespace-nowrap"
            >
              Ya, Keluar
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-2 leading-relaxed font-sans py-1">
          Data formulir yang sudah Anda ketik belum disimpan. Yakin ingin keluar?
        </p>
      </Modal>
    </div>
  );
}

export default KetersediaanKios;
