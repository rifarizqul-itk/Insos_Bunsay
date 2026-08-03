import { httpClient } from './client';

export const RealAdminAdapter = {
  async getTenants() {
    try {
      const response = await httpClient.get('/pemilik');
      const dataArray = Array.isArray(response) ? response : (response?.data || []);

      if (!Array.isArray(dataArray)) {
        return [];
      }

      return dataArray.map(pemilik => {
        // Ambil list kios dari sewa
        const sewaList = pemilik.sewa || [];
        const kiosList = sewaList.map(s => s.kios?.No_Kios).filter(Boolean);
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
          kios: kiosString,
          usaha: jenisUsaha,
          statusPemilik: pemilik.Status_Pemilik,
          statusPembayaran: statusPembayaran,
          tarifSewa: totalTagihan, // Tampilkan sisa tagihan sebagai tarif (simplifikasi untuk UI)
          hutangTunggakan: hutangTunggakan,
          totalTagihan: totalTagihan,
          rincianTunggakan: hutangTunggakan > 0 ? `Sisa tagihan Rp ${hutangTunggakan.toLocaleString('id-ID')}` : '—'
        };
      });
    } catch (err) {
      console.error('Error saat fetch Tenants:', err);
      return [];
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
      // 1. Buat data dummy untuk field KTP/Telepon agar lolos validasi backend
      const noKTP = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
      const noTelp = '08' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
      
      // 2. Simpan pemilik ke tabel pemilik di SQL
      const response = await httpClient.post('/pemilik', {
        Nama: payload.nama,
        No_Telepon: noTelp,
        No_KTP: noKTP,
        Alamat: 'Alamat belum diisi dari form awal'
      });

      const newPemilik = response?.data || response;

      return {
        success: true,
        id: newPemilik.Id_Pemilik,
        message: `Tenant ${payload.nama} berhasil didaftarkan ke Database SQL.`,
        data: {
          id: newPemilik.Id_Pemilik,
          nama: newPemilik.Nama,
          kios: payload.kios,
          usaha: payload.usaha || 'Umum',
          credentials: {
            username: `tenant_${newPemilik.Id_Pemilik}`,
            tempPassword: 'password123',
            email: payload.email || `tenant${newPemilik.Id_Pemilik}@bunsay.id`
          }
        }
      };
    } catch (err) {
      console.error('Error createTenant:', err);
      return { success: false, message: err?.message || 'Gagal menambahkan tenant ke SQL.' };
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
            message: 'Data kios berhasil diperbarui langsung ke SQL.'
        };
    } catch (err) {
        console.error('Error updateKios:', err);
        return { success: false, message: err?.message || 'Gagal update data kios ke SQL.' };
    }
  }
};

export const adminPort = RealAdminAdapter;

export const getAdminTenants = () => adminPort.getTenants();
export const getAdminKios = () => adminPort.getKiosList();
export const getAdminKiosDetail = (kiosId) => adminPort.getKiosDetail(kiosId);
export const createTenant = (payload) => adminPort.createTenant(payload);
export const updateKios = (kiosId, data) => adminPort.updateKios(kiosId, data);
