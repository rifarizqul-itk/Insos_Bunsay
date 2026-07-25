import { mockDelay } from './client';

// Initial Mock Datasets (ERD v4 Final Schema: Monthly Cycles, Accumulative AR & 3 Payment Methods)
let mockDashboard = {
  idPemilik: 1,
  nama: 'Hj. Yuliana',
  kios: 'B-1001, B-1002',
  kiosList: ['B-1001', 'B-1002'],
  statusPemilik: 'Aktif',
  siklusSewa: {
    idSewa: 501,
    periode: '2026-05',
    tanggalMulai: '2026-05-01',
    tanggalSelesai: '2026-05-31',
    jatuhTempo: '2026-05-12',
    jenisUsaha: 'Kerajinan & Aksesori'
  },
  tagihanBerjalan: {
    idTagihan: 101,
    tarifSewa: 7000000, // Rp 3.500.000 x 2 unit kios
    hutangTunggakan: 4500000,
    totalTagihan: 11500000,
    totalTerbayar: 0,
    statusTagihan: 'Belum Bayar'
  }
};

let mockTunggakanMap = {
  1: {
    idPemilik: 1,
    nama: 'Hj. Yuliana',
    statusPemilik: 'Aktif',
    totalHutangTunggakan: 4500000,
    tagihanMenunggak: [
      { idTagihan: 89, periode: '2026-03', jatuhTempo: '2026-03-12', tarifSewa: 4000000, hutangTunggakan: 0, totalTagihan: 4000000, totalTerbayar: 4000000, statusTagihan: 'Lunas' },
      { idTagihan: 95, periode: '2026-04', jatuhTempo: '2026-04-12', tarifSewa: 4000000, hutangTunggakan: 4000000, totalTagihan: 8000000, totalTerbayar: 3500000, statusTagihan: 'Dicicil' },
      { idTagihan: 101, periode: '2026-05', jatuhTempo: '2026-05-12', tarifSewa: 7000000, hutangTunggakan: 4500000, totalTagihan: 11500000, totalTerbayar: 0, statusTagihan: 'Belum Bayar' }
    ]
  },
  2: {
    idPemilik: 2,
    nama: 'Eva Tauresea',
    statusPemilik: 'Aktif',
    totalHutangTunggakan: 0,
    tagihanMenunggak: [
      { idTagihan: 102, periode: '2026-05', jatuhTempo: '2026-05-12', tarifSewa: 4000000, hutangTunggakan: 0, totalTagihan: 4000000, totalTerbayar: 0, statusTagihan: 'Menunggu Verifikasi' }
    ]
  },
  3: {
    idPemilik: 3,
    nama: 'H. Ahmad',
    statusPemilik: 'Aktif',
    totalHutangTunggakan: 2500000,
    tagihanMenunggak: [
      { idTagihan: 96, periode: '2026-04', jatuhTempo: '2026-04-12', tarifSewa: 4000000, hutangTunggakan: 0, totalTagihan: 4000000, totalTerbayar: 1500000, statusTagihan: 'Dicicil' },
      { idTagihan: 103, periode: '2026-05', jatuhTempo: '2026-05-12', tarifSewa: 4000000, hutangTunggakan: 2500000, totalTagihan: 6500000, totalTerbayar: 0, statusTagihan: 'Belum Bayar' }
    ]
  },
  4: {
    idPemilik: 4,
    nama: 'Toko Kalimantan',
    statusPemilik: 'Aktif',
    totalHutangTunggakan: 0,
    tagihanMenunggak: [
      { idTagihan: 104, periode: '2026-05', jatuhTempo: '2026-05-12', tarifSewa: 3500000, hutangTunggakan: 0, totalTagihan: 3500000, totalTerbayar: 3500000, statusTagihan: 'Lunas' }
    ]
  }
};

let mockProfile = {
  idPemilik: 1,
  nama: 'Hj. Yuliana',
  noKTP: '1751024607720005',
  kios: 'B-1001, B-1002',
  kiosList: ['B-1001', 'B-1002'],
  email: 'yuliana.bunsay@email.com',
  telepon: '0812-5564-593',
  alamat: 'Jl. Adil Makmur No. 42, Kec. Balikpapan Barat, Kota Balikpapan, Kaltim 76123',
  jenisUsaha: 'Kerajinan & Aksesori',
  statusPemilik: 'Aktif'
};

export const MockTenantAdapter = {
  async getDashboard() {
    return mockDelay({ ...mockDashboard });
  },

  async getTunggakan(idPemilik) {
    const ownerId = Number(idPemilik) || 1;
    const data = mockTunggakanMap[ownerId] || mockTunggakanMap[1];
    return mockDelay({ ...data });
  },

  async getProfile() {
    return mockDelay({ ...mockProfile });
  },

  async updateProfile(payload) {
    const { nama, email, telepon, alamat, jenisUsaha } = payload || {};

    if (telepon) {
      const cleanPhone = String(telepon).replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 13) {
        return mockDelay({
          success: false,
          message: 'Nomor telepon harus berisi 10 hingga 13 digit angka valid.',
          field: 'telepon'
        });
      }
    }

    if (email && (!email.includes('@') || !email.includes('.'))) {
      return mockDelay({
        success: false,
        message: 'Format email tidak valid (contoh: nama@domain.com).',
        field: 'email'
      });
    }

    if (!nama || nama.trim().length === 0) {
      return mockDelay({
        success: false,
        message: 'Nama lengkap tidak boleh kosong.',
        field: 'nama'
      });
    }

    mockProfile = {
      ...mockProfile,
      ...(nama && { nama }),
      ...(email && { email }),
      ...(telepon && { telepon }),
      ...(alamat && { alamat }),
      ...(jenisUsaha && { jenisUsaha })
    };

    mockDashboard.nama = mockProfile.nama;

    return mockDelay({
      success: true,
      message: 'Profil tenant berhasil diperbarui.',
      data: { ...mockProfile }
    });
  }
};

export const tenantPort = MockTenantAdapter;

export const getTenantDashboard = () => tenantPort.getDashboard();
export const getTunggakan = (idPemilik) => tenantPort.getTunggakan(idPemilik);
export const getTenantProfile = () => tenantPort.getProfile();
export const updateTenantProfile = (payload) => tenantPort.updateProfile(payload);

export const getTenantHistory = async () => {
  return mockDelay([
    {
      id: 'TX-4001',
      idTagihan: 78,
      tanggal: '10 Mei 2026',
      tipe: 'Cicilan Sewa (2026-04)',
      nominal: 3500000,
      metode: 'Midtrans',
      status: 'Lunas',
      alokasi: [
        { idTagihan: 95, periode: '2026-04', nominalTeralokasi: 3500000, totalTagihan: 4000000, statusAkhir: 'Dicicil' }
      ]
    },
    {
      id: 'TX-4002',
      idTagihan: 62,
      tanggal: '02 April 2026',
      tipe: 'Pelunasan Tagihan (2026-03)',
      nominal: 4000000,
      metode: 'Transfer',
      status: 'Lunas',
      alokasi: [
        { idTagihan: 89, periode: '2026-03', nominalTeralokasi: 4000000, totalTagihan: 4000000, statusAkhir: 'Lunas' }
      ]
    },
    {
      id: 'TX-4003',
      idTagihan: 101,
      tanggal: '19 Mei 2026',
      tipe: 'Pembayaran Total Tagihan & Akumulasi Tunggakan',
      nominal: 11500000,
      metode: 'Transfer',
      status: 'Menunggu Verifikasi',
      alokasi: [
        { idTagihan: 95, periode: '2026-04', nominalTeralokasi: 500000, totalTagihan: 4000000, statusAkhir: 'Lunas' },
        { idTagihan: 101, periode: '2026-05', nominalTeralokasi: 7000000, totalTagihan: 7000000, statusAkhir: 'Lunas' }
      ]
    }
  ]);
};

export const createPayment = async (payload) => {
  return mockDelay({
    success: true,
    id: `TRX-${Date.now()}`,
    status: payload.metode === 'Midtrans' || payload.metode === 'midtrans_gateway' ? 'Lunas' : 'Menunggu Verifikasi'
  });
};
