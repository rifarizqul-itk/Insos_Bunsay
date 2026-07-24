import { mockDelay } from './client';

let mockTenants = [
  { id: 1, idPemilik: 1, nama: 'Hj. Yuliana', kios: 'B-1001, B-1002', usaha: 'Kerajinan & Aksesori', statusPemilik: 'Aktif', statusPembayaran: 'Dicicil', tarifSewa: 7000000, hutangTunggakan: 4500000, totalTagihan: 11500000, rincianTunggakan: 'Telah dicicil Rp 3.500.000 (Sisa Rp 500.000 periode Apr 2026)' },
  { id: 2, idPemilik: 2, nama: 'Eva Tauresea', kios: 'B-1004', usaha: 'Fashion', statusPemilik: 'Aktif', statusPembayaran: 'Menunggu Verifikasi', tarifSewa: 4000000, hutangTunggakan: 0, totalTagihan: 4000000, rincianTunggakan: '—' },
  { id: 3, idPemilik: 3, nama: 'H. Ahmad', kios: 'B-1013', usaha: 'Perhiasan', statusPemilik: 'Aktif', statusPembayaran: 'Dicicil', tarifSewa: 4000000, hutangTunggakan: 2500000, totalTagihan: 6500000, rincianTunggakan: 'Telah dicicil Rp 1.500.000 periode Apr 2026' },
  { id: 4, idPemilik: 4, nama: 'Toko Kalimantan', kios: 'A-1002', usaha: 'Oleh-oleh', statusPemilik: 'Aktif', statusPembayaran: 'Lunas', tarifSewa: 3500000, hutangTunggakan: 0, totalTagihan: 3500000, rincianTunggakan: '—' },
  { id: 5, idPemilik: 99, nama: 'H. Syamsuddin (Ex-Tenant)', kios: 'B-1002 (Lama)', usaha: 'Elektronik', statusPemilik: 'Nonaktif', statusPembayaran: 'Lunas', tarifSewa: 0, hutangTunggakan: 0, totalTagihan: 0, rincianTunggakan: 'Pemilik lama sudah tidak berjualan' }
];

let mockKios = [
  { id: 1, lantai: 'Lt. 1', nomorKios: 'B-1001', statusKios: 'Terisi', tenant: 'Hj. Yuliana', idPemilik: 1, statusPemilik: 'Aktif', usaha: 'Kerajinan', catatan: 'Unit 1 Hj. Yuliana (Sertifikat di BPD Syariah)' },
  { id: 2, lantai: 'Lt. 1', nomorKios: 'B-1002', statusKios: 'Terisi', tenant: 'Hj. Yuliana', idPemilik: 1, statusPemilik: 'Aktif', usaha: 'Aksesori', catatan: 'Unit 2 Hj. Yuliana (Multi-Kios)' },
  { id: 3, lantai: 'Lt. 1', nomorKios: 'B-1004', statusKios: 'Terisi', tenant: 'Eva Tauresea', idPemilik: 2, statusPemilik: 'Aktif', usaha: 'Fashion', catatan: 'Unit aktif' },
  { id: 4, lantai: 'Lt. 1', nomorKios: 'B-1013', statusKios: 'Perlu Validasi', tenant: 'H. Ahmad', idPemilik: 3, statusPemilik: 'Aktif', usaha: 'Perhiasan', catatan: 'Dokumen PPJB & Sertifikat dalam proses validasi' },
  { id: 5, lantai: 'Lt. 2', nomorKios: 'A-2005', statusKios: 'Terisi', tenant: 'Toko Kalimantan', idPemilik: 4, statusPemilik: 'Aktif', usaha: 'Oleh-oleh', catatan: 'Data lengkap terverifikasi' },
  { id: 6, lantai: 'Lt. 3', nomorKios: 'C-3002', statusKios: 'Kosong', tenant: '—', idPemilik: null, statusPemilik: '—', usaha: '—', catatan: 'Unit sewa siap huni' }
];

export const MockAdminAdapter = {
  async getTenants() {
    return mockDelay([...mockTenants]);
  },

  async getKiosList() {
    return mockDelay([...mockKios]);
  },

  async getKiosDetail(kiosId) {
    const numericId = Number(kiosId);
    const cleanKiosCode = String(kiosId).split(' ')[0];
    const detail = mockKios.find(k => k.id === numericId || k.nomorKios === kiosId || k.nomorKios === cleanKiosCode);
    if (!detail) {
      throw new Error(`Data administrasi kios ${kiosId} tidak ditemukan.`);
    }

    let dokumenList = [];
    if (detail.nomorKios === 'B-1001') {
      dokumenList = [
        { idDokumen: 101, jenisDokumen: 'KTP', nomorDokumen: '1751024607720005', tanggal: null, keterangan: 'KTP Pemilik (Wajib)' },
        { idDokumen: 102, jenisDokumen: 'SP', nomorDokumen: '423 / 15-01-2022', tanggal: '2022-01-15', keterangan: 'Surat Perjanjian Sewa B-1001' },
        { idDokumen: 103, jenisDokumen: 'PPJB', nomorDokumen: '108 / 20-01-2022', tanggal: '2022-01-20', keterangan: 'Pengikatan Jual Beli / Sewa B-1001' },
        { idDokumen: 104, jenisDokumen: 'Sertifikat', nomorDokumen: '422 / 10-03-2023', tanggal: '2023-03-10', keterangan: 'Tersimpan di BPD Syariah' }
      ];
    } else if (detail.nomorKios === 'B-1002') {
      dokumenList = [
        { idDokumen: 105, jenisDokumen: 'KTP', nomorDokumen: '1751024607720005', tanggal: null, keterangan: 'KTP Pemilik (Hj. Yuliana - Multi Kios)' },
        { idDokumen: 106, jenisDokumen: 'SP', nomorDokumen: '424 / 15-01-2022', tanggal: '2022-01-15', keterangan: 'Surat Perjanjian Sewa B-1002' },
        { idDokumen: 107, jenisDokumen: 'PPJB', nomorDokumen: '109 / 20-01-2022', tanggal: '2022-01-20', keterangan: 'Pengikatan Jual Beli / Sewa B-1002' }
      ];
    } else if (detail.nomorKios === 'B-1013') {
      dokumenList = [
        { idDokumen: 108, jenisDokumen: 'KTP', nomorDokumen: '6471011203800001', tanggal: null, keterangan: 'KTP Pemilik H. Ahmad' },
        { idDokumen: 109, jenisDokumen: 'SP', nomorDokumen: '512 / 10-04-2026', tanggal: '2026-04-10', keterangan: 'Surat Perjanjian Sewa (Proses Validasi)' }
      ];
    } else if (detail.statusKios === 'Kosong') {
      dokumenList = [];
    } else {
      dokumenList = [
        { idDokumen: 110, jenisDokumen: 'KTP', nomorDokumen: '6471025508840003', tanggal: null, keterangan: 'KTP Pemilik' },
        { idDokumen: 111, jenisDokumen: 'SP', nomorDokumen: '301 / 01-02-2024', tanggal: '2024-02-01', keterangan: 'Surat Perjanjian Sewa' },
        { idDokumen: 112, jenisDokumen: 'PPJB', nomorDokumen: '205 / 05-02-2024', tanggal: '2024-02-05', keterangan: 'Pengikatan Jual Beli' }
      ];
    }

    const defaultAdmin = {
      ktp: detail.nomorKios === 'B-1013' ? '6471011203800001' : '1751024607720005',
      alamat: detail.nomorKios === 'B-1013' ? 'Jl. Kebun Sayur No. 12, Balikpapan' : 'Jl. Adil Makmur No. 42, Balikpapan',
      kontak: detail.nomorKios === 'B-1013' ? '0813-4700-112' : '0812-5564-593',
      ukuran: '12 Meter Persegi',
      statusPemilik: detail.statusPemilik || 'Aktif',
      keterangan: detail.catatan || 'Unit aktif',
      dokumenList: dokumenList
    };

    const fullDetail = {
      ...detail,
      detailAdministrasi: {
        ...defaultAdmin,
        ...(detail.detailAdministrasi || {})
      }
    };

    return mockDelay(fullDetail);
  },

  async createTenant(payload) {
    const { nama, kios, email, usaha } = payload || {};

    if (!nama || nama.trim().length === 0) {
      return mockDelay({
        success: false,
        message: 'Nama tenant wajib diisi.',
        field: 'nama'
      });
    }

    if (!kios || kios.trim().length === 0) {
      return mockDelay({
        success: false,
        message: 'Nomor kios wajib dipilih.',
        field: 'kios'
      });
    }

    if (email && (!email.includes('@') || !email.includes('.'))) {
      return mockDelay({
        success: false,
        message: 'Format email tidak valid (contoh: nama@domain.com).',
        field: 'email'
      });
    }

    const targetKios = mockKios.find(k => k.nomorKios === kios || String(k.id) === kios);
    if (targetKios && targetKios.statusKios === 'Terisi') {
      return mockDelay({
        success: false,
        message: `Kios ${targetKios.nomorKios} sudah terisi oleh ${targetKios.tenant}.`,
        field: 'kios'
      });
    }

    const newTenantId = Date.now();
    const newTenant = {
      id: newTenantId,
      nama: nama.trim(),
      kios: targetKios ? targetKios.nomorKios : kios,
      usaha: usaha || 'Umum',
      statusPembayaran: 'Belum Bayar',
      tunggakan: 0,
      rincianTunggakan: '—'
    };

    mockTenants.unshift(newTenant);

    if (targetKios) {
      targetKios.statusKios = 'Terisi';
      targetKios.tenant = nama.trim();
      targetKios.usaha = usaha || 'Umum';
    } else {
      mockKios.unshift({
        id: newTenantId,
        nomorKios: kios.trim().toUpperCase(),
        tenant: nama.trim(),
        lantai: 'Lt. 1',
        statusKios: 'Terisi',
        usaha: usaha || 'Umum',
        catatan: 'Unit baru terdaftar'
      });
    }

    const kiosClean = (targetKios ? targetKios.nomorKios : kios).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const tempUsername = `tenant_${kiosClean}`;
    const tempPassword = `Bunsay#${Math.floor(1000 + Math.random() * 9000)}`;

    return mockDelay({
      success: true,
      id: newTenantId,
      message: `Tenant ${nama} (${newTenant.kios}) berhasil didaftarkan.`,
      data: {
        ...newTenant,
        credentials: {
          username: tempUsername,
          tempPassword,
          email: email || `${tempUsername}@bunsay.id`
        }
      }
    });
  },

  async updateKios(kiosId, data) {
    const numericId = Number(kiosId);
    const targetIndex = mockKios.findIndex(k => k.id === numericId || k.nomorKios === kiosId);

    if (targetIndex === -1) {
      return mockDelay({
        success: false,
        message: `Kios ${kiosId} tidak ditemukan.`,
        field: 'kiosId'
      });
    }

    const currentKios = mockKios[targetIndex];
    const { tenant, statusKios, statusPemilik, usaha, catatan, ...adminDetails } = data || {};

    const updatedStatusPemilik = statusPemilik || adminDetails.statusPemilik || currentKios.statusPemilik;

    mockKios[targetIndex] = {
      ...currentKios,
      ...(tenant && { tenant }),
      ...(statusKios && { statusKios }),
      ...(updatedStatusPemilik && { statusPemilik: updatedStatusPemilik }),
      ...(usaha && { usaha }),
      ...(catatan !== undefined && { catatan }),
      detailAdministrasi: {
        ...(currentKios.detailAdministrasi || {}),
        ...adminDetails,
        ...(updatedStatusPemilik && { statusPemilik: updatedStatusPemilik })
      }
    };

    const tenantTarget = mockTenants.find(t => (currentKios.idPemilik && t.idPemilik === currentKios.idPemilik) || t.nama === currentKios.tenant);
    
    if (updatedStatusPemilik === 'Nonaktif') {
      if (tenantTarget) {
        tenantTarget.statusPemilik = 'Nonaktif';
        tenantTarget.rincianTunggakan = 'Pemilik lama sudah tidak berjualan';
      }
      
      const oldTenantName = currentKios.tenant;
      const oldOwnerId = currentKios.idPemilik;

      mockKios.forEach(k => {
        if ((oldOwnerId && k.idPemilik === oldOwnerId) || k.tenant === oldTenantName) {
          k.statusKios = 'Kosong';
          k.tenant = '—';
          k.idPemilik = null;
          k.statusPemilik = '—';
          k.usaha = '—';
          k.catatan = 'Unit sewa siap huni';
        }
      });
    } else if (statusKios === 'Kosong') {
      mockKios[targetIndex] = {
        ...mockKios[targetIndex],
        statusKios: 'Kosong',
        tenant: '—',
        idPemilik: null,
        statusPemilik: '—',
        usaha: '—',
        catatan: catatan || 'Unit sewa siap huni'
      };
    } else if (tenantTarget && updatedStatusPemilik) {
      tenantTarget.statusPemilik = updatedStatusPemilik;
    }

    return mockDelay({
      success: true,
      message: `Data administrasi kios ${currentKios.nomorKios} berhasil diperbarui.`
    });
  }
};

export const adminPort = MockAdminAdapter;

export const getAdminTenants = () => adminPort.getTenants();
export const getAdminKios = () => adminPort.getKiosList();
export const getAdminKiosDetail = (kiosId) => adminPort.getKiosDetail(kiosId);
export const createTenant = (payload) => adminPort.createTenant(payload);
export const updateKios = (kiosId, data) => adminPort.updateKios(kiosId, data);
