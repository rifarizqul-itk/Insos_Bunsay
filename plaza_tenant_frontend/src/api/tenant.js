import { httpClient } from './client';

export const RealTenantAdapter = {
  async getDashboard() {
    try {
      const data = await httpClient.get('/dashboard/tenant');
      return data;
    } catch (err) {
      console.error('Error fetching tenant dashboard:', err);
      throw err;
    }
  },

  async getTunggakan(idPemilik) {
    try {
      const data = await httpClient.get(`/tagihan?Id_Pemilik=${idPemilik}`);
      const tagihan = Array.isArray(data) ? data : (data.data || []);
      const menunggak = tagihan.filter(t => t.Status_Tagihan !== 'Lunas');
      const totalHutang = menunggak.reduce((sum, t) => sum + parseFloat(t.Hutang_Tunggakan || 0), 0);

      return {
        idPemilik,
        totalHutangTunggakan: totalHutang,
        tagihanMenunggak: menunggak.map(t => ({
          idTagihan: t.Id_Tagihan,
          periode: t.Periode,
          jatuhTempo: t.Jatuh_Tempo,
          tarifSewa: parseFloat(t.Tarif_Sewa || 0),
          hutangTunggakan: parseFloat(t.Hutang_Tunggakan || 0),
          totalTagihan: parseFloat(t.Total_Tagihan || 0),
          totalTerbayar: 0, 
          statusTagihan: t.Status_Tagihan,
        }))
      };
    } catch (err) {
      console.error('Error fetching tunggakan:', err);
      throw err;
    }
  },

  async getProfile() {
    try {
      const stored = localStorage.getItem('auth') || sessionStorage.getItem('auth');
      const parsed = stored ? JSON.parse(stored) : null;
      const idUser = parsed?.user?.Id_user;

      const allPemilik = await httpClient.get('/pemilik');
      const list = Array.isArray(allPemilik) ? allPemilik : (allPemilik?.data || []);
      const data = list.find(p => p.Id_User === idUser);

      if (!data) throw new Error('Profil pemilik tidak ditemukan di database.');

      return {
        idPemilik: data.Id_Pemilik,
        nama: data.Nama,
        noKTP: data.No_KTP,
        kios: data.sewa?.map(s => s.kios?.No_Kios).join(', ') || '—',
        email: data.user?.Email || parsed?.user?.email || '—',
        telepon: data.No_Telepon,
        alamat: data.Alamat,
        jenisUsaha: data.sewa?.[0]?.Jenis_Usaha || 'Umum',
        statusPemilik: data.Status_Pemilik,
      };
    } catch (err) {
      console.error('Error fetching profile:', err);
      throw err;
    }
  },

  async updateProfile(payload) {
    try {
      const stored = localStorage.getItem('auth') || sessionStorage.getItem('auth');
      const parsed = stored ? JSON.parse(stored) : null;
      const idUser = parsed?.user?.Id_user;
      
      const allPemilik = await httpClient.get('/pemilik');
      const list = Array.isArray(allPemilik) ? allPemilik : (allPemilik?.data || []);
      const data = list.find(p => p.Id_User === idUser);
      
      if(!data) throw new Error('Pemilik tidak ditemukan');

      await httpClient.put(`/pemilik/${data.Id_Pemilik}`, {
        Nama: payload.nama,
        No_Telepon: payload.telepon,
        Alamat: payload.alamat,
      });
      return {
        success: true,
        message: 'Profil berhasil diperbarui.',
        data: {
          idPemilik: data.Id_Pemilik,
          nama: payload.nama,
          telepon: payload.telepon,
          alamat: payload.alamat,
          email: payload.email,
          kios: data.sewa?.map(s => s.kios?.No_Kios).join(', ') || '—',
          jenisUsaha: data.sewa?.[0]?.Jenis_Usaha || 'Umum'
        }
      };
    } catch (err) {
      return { success: false, message: err?.message || 'Gagal memperbarui profil.', field: err?.field };
    }
  }
};

export const tenantPort = RealTenantAdapter;

export const getTenantDashboard = () => tenantPort.getDashboard();
export const getTunggakan = (idPemilik) => tenantPort.getTunggakan(idPemilik);
export const getTenantProfile = () => tenantPort.getProfile();
export const updateTenantProfile = (payload) => tenantPort.updateProfile(payload);

export const getTenantHistory = async () => {
  try {
    const data = await httpClient.get('/pembayaran');
    const list = Array.isArray(data) ? data : (data.data || []);

    return list.map(p => ({
      id: `TRX-${p.Id_Pembayaran}`,
      tanggal: p.Tanggal_Bayar,
      nominal: parseFloat(p.Total_Bayar || 0),
      nominalAngka: parseFloat(p.Total_Bayar || 0),
      metode: p.Metode_Bayar,
      status: p.Verifikasi_Pembayaran === 'Diterima' ? 'Lunas'
             : p.Verifikasi_Pembayaran === 'Ditolak' ? 'Ditolak'
             : 'Menunggu Verifikasi',
      alokasi: [], 
    }));
  } catch (err) {
    console.error('Error fetching tenant history:', err);
    return [];
  }
};

export const createPayment = async (payload) => {
  try {
    const result = await httpClient.post('/pembayaran', {
      Id_Tagihan: payload.idTagihan,
      Tanggal_Bayar: new Date().toISOString().split('T')[0],
      Total_Bayar: payload.nominal,
      Metode_Bayar: payload.metode, 
      Bukti_Pembayaran: payload.berkas || null,
      Verifikasi_Pembayaran: payload.metode === 'Midtrans' ? 'Diterima' : 'Menunggu',
    });
    return {
      success: true,
      id: `TRX-${result.Id_Pembayaran}`,
      status: payload.metode === 'Midtrans' ? 'Lunas' : 'Menunggu Verifikasi'
    };
  } catch (err) {
    return { success: false, message: err?.message || 'Gagal menyimpan pembayaran.' };
  }
};
