import { httpClient } from './client';

const mockTenantsList = [
  { id: 1, idPemilik: 1, nama: 'AHMAD SARONI', kios: 'B-1001', usaha: 'Pakaian & Tekstil', statusPemilik: 'Aktif', statusPembayaran: 'Lunas', totalTagihan: 0, hutangTunggakan: 0, rincianTunggakan: '—' },
  { id: 2, idPemilik: 2, nama: 'Budi Santoso', kios: 'B-1002', usaha: 'Elektronik & Hp', statusPemilik: 'Aktif', statusPembayaran: 'Belum Bayar', totalTagihan: 4000000, hutangTunggakan: 4000000, rincianTunggakan: 'Sisa tagihan Rp 4.000.000' },
  { id: 3, idPemilik: 3, nama: 'Citra Lestari', kios: 'B-1003', usaha: 'Kuliner Bunsay', statusPemilik: 'Aktif', statusPembayaran: 'Belum Bayar', totalTagihan: 4000000, hutangTunggakan: 4000000, rincianTunggakan: 'Sisa tagihan Rp 4.000.000' },
  { id: 4, idPemilik: 4, nama: 'Dedi Irawan', kios: 'B-1004', usaha: 'Aksesoris & Souvenir', statusPemilik: 'Aktif', statusPembayaran: 'Belum Bayar', totalTagihan: 4000000, hutangTunggakan: 4000000, rincianTunggakan: 'Sisa tagihan Rp 4.000.000' },
  { id: 5, idPemilik: 5, nama: 'Eka Putri', kios: 'B-1005', usaha: 'Salon & Kecantikan', statusPemilik: 'Aktif', statusPembayaran: 'Belum Bayar', totalTagihan: 3500000, hutangTunggakan: 3500000, rincianTunggakan: 'Sisa tagihan Rp 3.500.000' },
  { id: 6, idPemilik: 6, nama: 'Fajar Hadi', kios: 'B-1006', usaha: 'Sepatu & Tas', statusPemilik: 'Aktif', statusPembayaran: 'Belum Bayar', totalTagihan: 4000000, hutangTunggakan: 4000000, rincianTunggakan: 'Sisa tagihan Rp 4.000.000' },
  { id: 7, idPemilik: 7, nama: 'Gita Sari', kios: 'B-1007', usaha: 'Baju Anak', statusPemilik: 'Aktif', statusPembayaran: 'Belum Bayar', totalTagihan: 4000000, hutangTunggakan: 4000000, rincianTunggakan: 'Sisa tagihan Rp 4.000.000' },
  { id: 8, idPemilik: 8, nama: 'Hendra Wijaya', kios: 'B-1008', usaha: 'Komputer & Print', statusPemilik: 'Aktif', statusPembayaran: 'Belum Bayar', totalTagihan: 4000000, hutangTunggakan: 4000000, rincianTunggakan: 'Sisa tagihan Rp 4.000.000' },
  { id: 9, idPemilik: 9, nama: 'Indah Permata', kios: 'B-1009', usaha: 'Perhiasan & Jam', statusPemilik: 'Aktif', statusPembayaran: 'Belum Bayar', totalTagihan: 4000000, hutangTunggakan: 4000000, rincianTunggakan: 'Sisa tagihan Rp 4.000.000' }
];

export const RealAdminAdapter = {
  async getTenants() {
    try {
      const response = await httpClient.get('/pemilik');
      const dataArray = Array.isArray(response) ? response : (response?.data || []);

      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return mockTenantsList;
      }

      return dataArray.map(pemilik => {
        // Ambil list kios dari sewa
        const sewaList = pemilik.sewa || [];
        const kiosList = sewaList.map(s => s.kios?.No_Kios || s.kios?.Kode_Kios).filter(Boolean);
        const kiosString = kiosList.length > 0 ? kiosList.join(', ') : '—';
        const jenisUsaha = sewaList[0]?.Jenis_Usaha || 'Umum';

        // Hitung total tagihan dari semua sewa
        let hutangTunggakan = 0;
        let totalTagihan = 0;
        let adaDicicil = false;
        let adaBelumBayar = false;

        sewaList.forEach(sewa => {
          const tagihanList = sewa.tagihan || [];
          tagihanList.forEach(t => {
            if (t.Status_Tagihan !== 'Lunas') {
              hutangTunggakan += parseFloat(t.Hutang_Tunggakan || 0);
              totalTagihan += parseFloat(t.Total_Tagihan || 0);
              if (t.Status_Tagihan === 'Dicicil') adaDicicil = true;
              if (t.Status_Tagihan === 'Belum Bayar') adaBelumBayar = true;
            }
          });
        });

        let statusPembayaran = 'Lunas';
        if (adaBelumBayar) statusPembayaran = 'Belum Bayar';
        else if (adaDicicil) statusPembayaran = 'Dicicil';

        return {
          id: pemilik.Id_Pemilik,
          idPemilik: pemilik.Id_Pemilik,
          nama: pemilik.Nama,
          kios: kiosString !== '—' ? kiosString : `B-${1000 + pemilik.Id_Pemilik}`,
          usaha: jenisUsaha,
          statusPemilik: pemilik.Status_Pemilik || 'Aktif',
          statusPembayaran: statusPembayaran,
          tarifSewa: totalTagihan, // Tampilkan sisa tagihan sebagai tarif (simplifikasi untuk UI)
          hutangTunggakan: hutangTunggakan,
          totalTagihan: totalTagihan,
          rincianTunggakan: hutangTunggakan > 0 ? `Sisa tagihan Rp ${hutangTunggakan.toLocaleString('id-ID')}` : '—'
        };
      });
    } catch (err) {
      console.error('Error saat fetch Tenants:', err);
      return mockTenantsList;
    }
  },

  async getKiosList() {
    try {
      const response = await httpClient.get('/kios');
      const dataArray = Array.isArray(response) ? response : (response?.data || []);

      if (!Array.isArray(dataArray)) {
        return [];
      }

      return dataArray.map(kios => ({
        id: kios.Id_Kios || kios.id,
        lantai: kios.Lantai ? `Lt. ${kios.Lantai}` : 'Lt. 1',
        nomorKios: kios.No_Kios || kios.nomorKios || '-',
        statusKios: kios.Status || kios.statusKios || 'Kosong',
        tenant: kios.sewa?.pemilik?.Nama || '—',
        usaha: kios.sewa?.Jenis_Usaha || 'Umum',
        catatan: kios.Catatan || kios.catatan || '—'
      }));
    } catch (err) {
      console.error('Error saat fetch Kios:', err);
      return [];
    }
  },

  async getKiosDetail(kiosId) {
    try {
      // kiosId can be ID or No_Kios (string). We handle both.
      let kiosData;
      if (isNaN(kiosId)) {
        const allKios = await httpClient.get('/kios');
        const dataArray = Array.isArray(allKios) ? allKios : (allKios?.data || []);
        kiosData = dataArray.find(k => k.No_Kios === kiosId);
        if (kiosData) {
            const detailResponse = await httpClient.get(`/kios/${kiosData.Id_Kios}`);
            kiosData = detailResponse?.data || detailResponse;
        }
      } else {
        const response = await httpClient.get(`/kios/${kiosId}`);
        kiosData = response?.data || response;
      }

      if (!kiosData) {
         throw new Error('Kios tidak ditemukan di database.');
      }

      const pemilik = kiosData.sewa?.pemilik;
      const dokumenRaw = pemilik?.dokumen || [];
      
      const dokumenList = dokumenRaw.map(d => ({
        idDokumen: d.Id_Dokumen,
        jenisDokumen: d.Jenis_Dokumen,
        nomorDokumen: d.File_Path || '-', 
        tanggal: d.Tanggal_Upload,
        keterangan: d.Status_Validasi
      }));

      const defaultAdmin = {
        ktp: pemilik?.No_KTP || '—',
        alamat: pemilik?.Alamat || '—',
        kontak: pemilik?.No_Telepon || '—',
        ukuran: kiosData.Ukuran || '12 Meter Persegi',
        statusPemilik: pemilik?.Status_Pemilik || 'Aktif',
        keterangan: kiosData.Catatan || '—',
        dokumenList: dokumenList
      };

      return {
        id: kiosData.Id_Kios,
        lantai: kiosData.Lantai ? `Lt. ${kiosData.Lantai}` : 'Lt. 1',
        nomorKios: kiosData.No_Kios,
        statusKios: kiosData.Status,
        tenant: pemilik?.Nama || '—',
        idPemilik: pemilik?.Id_Pemilik || null,
        statusPemilik: pemilik?.Status_Pemilik || '—',
        usaha: kiosData.sewa?.Jenis_Usaha || 'Umum',
        catatan: kiosData.Catatan,
        detailAdministrasi: defaultAdmin
      };
    } catch (err) {
       console.error('Error getKiosDetail:', err);
       throw err;
    }
  },

  async createTenant(payload) {
    try {
      // 1. Buat data KTP/Telepon jika belum diisi dari form
      const noKTP = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
      const noTelp = payload.telepon || ('08' + Math.floor(1000000000 + Math.random() * 9000000000).toString());
      
      // 2. Simpan pemilik ke tabel pemilik di SQL
      const response = await httpClient.post('/pemilik', {
        Nama: payload.nama,
        No_Telepon: noTelp,
        No_KTP: noKTP,
        Alamat: 'Alamat belum diisi dari form awal'
      });

      const newPemilik = response?.data || response;
      const userObj = newPemilik.user || {};

      return {
        success: true,
        id: newPemilik.Id_Pemilik,
        message: `Tenant ${payload.nama} berhasil didaftarkan.`,
        data: {
          id: newPemilik.Id_Pemilik,
          nama: newPemilik.Nama,
          kios: payload.kios,
          usaha: payload.usaha || 'Umum',
          credentials: {
            username: userObj.Username || `tenant_${newPemilik.Id_Pemilik}`,
            tempPassword: userObj.plain_password || 'bunsay1234',
            email: payload.email || `tenant${newPemilik.Id_Pemilik}@bunsay.id`
          }
        }
      };
    } catch (err) {
      console.error('Error createTenant:', err);
      return { success: false, message: err?.message || 'Gagal menambahkan tenant.' };
    }
  },

  async updateKios(kiosId, data) {
    try {
        let actualId = kiosId;
        if (isNaN(kiosId)) {
            const allKios = await httpClient.get('/kios');
            const dataArray = Array.isArray(allKios) ? allKios : (allKios?.data || []);
            const found = dataArray.find(k => k.No_Kios === kiosId);
            if (found) actualId = found.Id_Kios;
            else throw new Error('Kios tidak ditemukan');
        }

        const response = await httpClient.put(`/kios/${actualId}`, {
            nomorKios: data.nomorKios,
            lantai: data.lantai,
            catatan: data.catatan,
            statusKios: data.statusKios,
            tenant: data.tenant
        });

        return {
            success: true,
            message: 'Data kios berhasil diperbarui.'
        };
    } catch (err) {
        console.error('Error updateKios:', err);
        return { success: false, message: err?.message || 'Gagal memperbarui data kios.' };
    }
  }
};

export const adminPort = RealAdminAdapter;

export const getAdminTenants = () => adminPort.getTenants();
export const getAdminKios = () => adminPort.getKiosList();
export const getAdminKiosDetail = (kiosId) => adminPort.getKiosDetail(kiosId);
export const createTenant = (payload) => adminPort.createTenant(payload);
export const updateKios = (kiosId, data) => adminPort.updateKios(kiosId, data);
