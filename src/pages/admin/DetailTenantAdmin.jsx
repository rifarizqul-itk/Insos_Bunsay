import React, { useState } from 'react';

function DetailTenantAdmin({ tenantName, onBack }) {
  // Simulasi basis data arsip riil dari excel untuk sinkronisasi multi-tenant reaktif
  const tenantsMockDatabase = {
    'Hj. Yuliana': {
      kios: 'B-1001',
      ktp: '175102.460772.0005',
      alamat: 'Jl. Adil Makmur No. 42 Balikpapan',
      kontak: '0812-5564-593',
      sp: '423 / 5 Mei 2008',
      ppjb: '423 / 5 Mei 2008',
      bast: '1 Januari 2010',
      ukuran: '6 Meter Persegi',
      usaha: 'Kerajinan',
      sertifikat: '422 / 12 April 2012',
      keterangan: 'Sertifikat diambil BPD Syariah',
      gedung: 'Lunas',
      service: 'Lunas',
      tunggakan: 'Rp 13.219.998',
      rincianTunggakan: 'Tunggakan pembukuan historis lama terhitung s/d September 2024',
      riwayat: [
        { id: 'TX-3011', tanggal: '10 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' },
        { id: 'TX-3010', tanggal: '02 Mei 2026', tipe: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ],
      pendingVerifikasi: { id: 'TRX-1092', tagihan: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (BNI)', waktu: '19 Mei 2026, 14:20 WITA' }
    },
    'Eva Tauresea': {
      kios: 'B-1004',
      ktp: '175102.889712.0001',
      alamat: 'Jl. Letjen Suprapto No. 12 Balikpapan',
      kontak: '0813-4455-6677',
      sp: '112 / 10 Juni 2011',
      ppjb: '112 / 10 Juni 2011',
      bast: '15 Agustus 2011',
      ukuran: '12 Meter Persegi',
      usaha: 'Fashion',
      sertifikat: 'Belum Diambil',
      keterangan: 'Menunggu konfirmasi kedatangan pemilik di kantor pengelola',
      gedung: 'Belum Bayar',
      service: 'Lunas',
      tunggakan: 'Rp 0',
      rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-2088', tanggal: '01 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' }
      ],
      pendingVerifikasi: { id: 'TRX-1093', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', waktu: '19 Mei 2026, 15:05 WITA' }
    },
    'H. Ahmad': {
      kios: 'B-1013',
      ktp: '175102.112233.0004',
      alamat: 'Jl. Ahmad Yani No. 5 Balikpapan',
      kontak: '0852-1122-3344',
      sp: '301 / 2 Maret 2009',
      ppjb: '301 / 2 Maret 2009',
      bast: '1 Mei 2009',
      ukuran: '6 Meter Persegi',
      usaha: 'Perhiasan',
      sertifikat: 'Belum Dibuatkan',
      keterangan: 'Berkas berkas penunjang pembuatan sertifikat belum lengkap',
      gedung: 'Ada Tunggakan',
      service: 'Belum Bayar',
      tunggakan: 'Rp 5.500.000',
      rincianTunggakan: 'Sewa Bulan Berjalan (Rp 4.000.000) + Akumulasi Denda Keterlambatan Kantor (Rp 1.500.000)',
      riwayat: [],
      pendingVerifikasi: null
    },
    'Toko Kalimantan': {
      kios: 'A-1002',
      ktp: '175102.556677.0002',
      alamat: 'Jl. Jend Sudirman No. 88 Balikpapan',
      kontak: '0811-2233-4455',
      sp: '204 / 12 Desember 2015',
      ppjb: '204 / 12 Desember 2015',
      bast: '1 Januari 2016',
      ukuran: '12 Meter Persegi',
      usaha: 'Oleh-oleh',
      sertifikat: 'Sudah Diambil',
      keterangan: 'Diambil oleh perwakilan keluarga sah pemilik',
      gedung: 'Lunas',
      service: 'Belum Bayar',
      tunggakan: 'Rp 0',
      rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-1044', tanggal: '28 April 2026', tipe: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ],
      pendingVerifikasi: null
    }
  };

  const tenantData = tenantsMockDatabase[tenantName] || tenantsMockDatabase['Hj. Yuliana'];

  const [nominalTunai, setNominalTunai] = useState('');
  const [jenisTagihan, setJenisTagihan] = useState('Sewa Gedung');
  const [antreanPending, setAntreanPending] = useState(tenantData.pendingVerifikasi);

  const handleSimpanTunai = (e) => {
    e.preventDefault();
    alert(`Berhasil mencatat setoran tunai manual kantor untuk tagihan ${jenisTagihan} sebesar Rp ${nominalTunai}`);
    setNominalTunai('');
  };

  const handleVerifikasiPembayaran = (id, status) => {
    alert(`Pembayaran mandiri penyewa dengan nomor transaksi ${id} berhasil di-${status === 'konfirmasi' ? 'setujui dan dibukukan lunas' : 'tolak'}.`);
    setAntreanPending(null);
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Navigasi Kembali - Tinggi Area Klik Minimal 44px */}
      <div>
        <button 
          onClick={onBack} 
          style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '0 20px', fontSize: '14px', marginBottom: '16px', height: '44px', fontWeight: '600', border: '1px solid var(--border)' }}
        >
          ← Kembali ke Panel Kendali Admin
        </button>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Profil Legalitas & Keuangan: {tenantName}</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Arsip terintegrasi Surat Perjanjian (SP), status keuangan bulan berjalan, serta loket penanganan konfirmasi setoran tagihan.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* KOLOM KIRI: DOKUMEN ARSIP FISIK & STATUS KEUANGAN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Card 1: Dokumen Kepemilikan Kios */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', color: 'var(--text)' }}>
              Dokumen Informasi Kepemilikan Properti Kios
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: '15px' }}>
              <div><span style={{ color: 'var(--text-3)' }}>Nama Pemilik Berkas:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantName}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Nomor KTP Terarsip:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.ktp}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Alamat Lengkap Pemilik:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.alamat}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Nomor Kontak Aktif:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.kontak}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>No. SP / Tanggal Surat Perjanjian:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.sp}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>No. PPJB / Tanggal Perjanjian Jual Beli:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.ppjb}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Tanggal Serah Terima Berita Acara (BAST):</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.bast}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Ukuran Dimensi Unit Properti:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.ukuran}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Status Nomor Sertifikat / Tgl Ambil:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.sertifikat}</div></div>
              <div><span style={{ color: 'var(--text-3)' }}>Catatan Keterangan Tambahan Arsip:</span> <div style={{ fontWeight: '600', marginTop: '2px', color: 'var(--text-2)' }}>{tenantData.keterangan}</div></div>
            </div>
          </div>

          {/* Card 2: Status Pembayaran Aktif & Tunggakan AR */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', color: 'var(--text)' }}>
              Status Rekapitulasi Keuangan Berjalan & Tunggakan AR
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Sewa Gedung Bulan Ini</span>
                <div style={{ marginTop: '6px' }}>
                  <span style={{ backgroundColor: tenantData.gedung === 'Lunas' ? 'var(--green-bg)' : 'var(--red-100)', color: tenantData.gedung === 'Lunas' ? 'var(--green)' : 'var(--red)', padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '13px' }}>
                    {tenantData.gedung}
                  </span>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Service Charge Bulan Ini</span>
                <div style={{ marginTop: '6px' }}>
                  <span style={{ backgroundColor: tenantData.service === 'Lunas' ? 'var(--green-bg)' : 'var(--red-100)', color: tenantData.service === 'Lunas' ? 'var(--green)' : 'var(--red)', padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '13px' }}>
                    {tenantData.service}
                  </span>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Nilai Tunggakan AR</span>
                <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px', color: tenantData.tunggakan !== 'Rp 0' ? 'var(--orange)' : 'var(--text)' }}>
                  {tenantData.tunggakan}
                </div>
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-3)', fontSize: '13px', fontWeight: '600' }}>Rincian Komponen Tunggakan Dokumen Administrasi Lama:</span>
              <div style={{ fontWeight: '600', fontSize: '14px', marginTop: '2px', color: 'var(--text-2)' }}>{tenantData.rincianTunggakan}</div>
            </div>
          </div>

          {/* Card 3: Tabel Riwayat Pembayaran */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
              Riwayat Transaksi Pelaporan Terdahulu
            </h3>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--warm-gray)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>ID Transaksi</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Tanggal</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Jenis Kewajiban</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Nominal</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Metode</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantData.riwayat.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
                        Belum ada riwayat transaksi pembayaran digital yang terekam lunas.
                      </td>
                    </tr>
                  ) : (
                    tenantData.riwayat.map((row, idx) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--warm-gray)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '600' }}>{row.id}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{row.tanggal}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{row.tipe}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '600' }}>{row.nominal}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-3)', fontWeight: '600' }}>{row.metode}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ backgroundColor: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '11px' }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN: PANEL VERIFIKASI PENDING & LOKET TUNAI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Card 1: PANEL VERIFIKASI KHUSUS TENANT INI (FITUR BARU) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              Verifikasi Pembayaran Tertunda
            </h3>
            
            {antreanPending ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '14px', backgroundColor: 'var(--orange-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div><span style={{ color: 'var(--text-2)' }}>ID Transaksi:</span> <strong>{antreanPending.id}</strong></div>
                  <div style={{ marginTop: '2px' }}><span style={{ color: 'var(--text-2)' }}>Kewajiban:</span> <strong>{antreanPending.tagihan}</strong></div>
                  <div style={{ marginTop: '2px' }}><span style={{ color: 'var(--text-2)' }}>Nominal:</span> <strong style={{ color: 'var(--orange)' }}>{antreanPending.nominal}</strong></div>
                  <div style={{ marginTop: '2px' }}><span style={{ color: 'var(--text-2)' }}>Kanal:</span> <strong>{antreanPending.metode}</strong></div>
                  <div style={{ marginTop: '2px' }}><span style={{ color: 'var(--text-2)' }}>Waktu:</span> <strong style={{ fontSize: '12px', color: 'var(--text-3)' }}>{antreanPending.waktu}</strong></div>
                </div>

                {/* Simulasi Lampiran Bukti Gambar */}
                <div style={{ width: '100%', height: '140px', backgroundColor: 'var(--warm-gray)', border: '1px dashed var(--border)', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                    [Lampiran Lampiran_Bukti_{antreanPending.id}.jpg]
                  </span>
                </div>

                {/* Tombol Aksi Tinggi Minimal 44px */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleVerifikasiPembayaran(antreanPending.id, 'konfirmasi')}
                    style={{ flex: 1, backgroundColor: 'var(--green)', color: '#ffffff', padding: '10px', fontSize: '13px', fontWeight: '700', height: '44px', border: 'none' }}
                  >
                    Setujui Lunas
                  </button>
                  <button 
                    onClick={() => handleVerifikasiPembayaran(antreanPending.id, 'tolak')}
                    style={{ flex: 1, backgroundColor: 'var(--warm-gray)', color: 'var(--red)', padding: '10px', fontSize: '13px', fontWeight: '700', height: '44px', border: '1px solid var(--border)' }}
                  >
                    Tolak Bukti
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-3)', fontSize: '14px', border: '1px dashed var(--border)', borderRadius: '6px' }}>
                Tidak ada antrean pembayaran mandiri yang menunggu verifikasi khusus dari tenant ini.
              </div>
            )}
          </div>

          {/* Card 2: Loket Pembayaran Tunai Manual Kantor */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              Loket Pembayaran Tunai
            </h3>
            <form onSubmit={handleSimpanTunai} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Jenis Tagihan Kantor</label>
                <select value={jenisTagihan} onChange={(e) => setJenisTagihan(e.target.value)} style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 10px' }}>
                  <option value="Sewa Gedung">Sewa Gedung</option>
                  <option value="Service Charge">Service Charge</option>
                  <option value="Tunggakan AR">Tunggakan Historis (AR)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>Nominal Tunai Setoran (Rp)</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 1500000" 
                  value={nominalTunai} 
                  onChange={(e) => setNominalTunai(e.target.value)} 
                  style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
                  required 
                />
              </div>
              <button type="submit" style={{ backgroundColor: 'var(--red)', color: '#ffffff', padding: '12px', fontSize: '14px', fontWeight: '700', width: '100%', height: '44px', border: 'none', marginTop: '4px' }}>
                Simpan Setoran Tunai
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

export default DetailTenantAdmin;