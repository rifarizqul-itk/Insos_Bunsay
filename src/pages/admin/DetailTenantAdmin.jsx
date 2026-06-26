import React from 'react';

function DetailTenantAdmin({ tenantName, onBack }) {
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
      statusTagihan: 'Lunas',
      tunggakan: 'Rp 13.219.998',
      rincianTunggakan: 'Tunggakan pembukuan historis lama terhitung s/d September 2024',
      riwayat: [
        { id: 'TX-3011', tanggal: '10 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' },
        { id: 'TX-3010', tanggal: '02 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ]
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
      statusTagihan: 'Belum Bayar',
      tunggakan: 'Rp 0',
      rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-2088', tanggal: '01 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' }
      ]
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
      keterangan: 'Berkas penunjang pembuatan sertifikat belum lengkap',
      statusTagihan: 'Ada Tunggakan',
      tunggakan: 'Rp 5.500.000',
      rincianTunggakan: 'Service Charge Bulan Berjalan (Rp 4.000.000) + Akumulasi Denda (Rp 1.500.000)',
      riwayat: []
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
      statusTagihan: 'Lunas',
      tunggakan: 'Rp 0',
      rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-1044', tanggal: '28 April 2026', tipe: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ]
    }
  };

  const tenantData = tenantsMockDatabase[tenantName] || tenantsMockDatabase['Hj. Yuliana'];

  const getStatusBadgeStyle = (status) => {
    const styles = {
      'Lunas': { bg: 'var(--green-bg)', color: 'var(--green)' },
      'Belum Bayar': { bg: 'var(--red-100)', color: 'var(--red)' },
      'Ada Tunggakan': { bg: 'var(--orange-bg)', color: 'var(--orange)' }
    };
    return styles[status] || styles['Belum Bayar'];
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <button
          onClick={onBack}
          style={{
            backgroundColor: 'var(--warm-gray)',
            color: 'var(--text)',
            padding: '0 20px',
            fontSize: '14px',
            marginBottom: '16px',
            height: '44px',
            fontWeight: '600',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          ← Kembali ke Panel Kendali Admin
        </button>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Profil Lengkap Tenant: {tenantName}
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Informasi kepemilikan, status keuangan, dan riwayat transaksi.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Dokumen Kepemilikan */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '28px',
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)'
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', color: 'var(--text)' }}>
            Dokumen Informasi Kepemilikan Properti Kios
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: '15px' }}>
            <div><span style={{ color: 'var(--text-3)' }}>Nama Pemilik:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantName}</div></div>
            <div><span style={{ color: 'var(--text-3)' }}>Nomor KTP:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.ktp}</div></div>
            <div><span style={{ color: 'var(--text-3)' }}>Alamat:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.alamat}</div></div>
            <div><span style={{ color: 'var(--text-3)' }}>Kontak:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.kontak}</div></div>
            <div><span style={{ color: 'var(--text-3)' }}>No. SP / Tgl:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.sp}</div></div>
            <div><span style={{ color: 'var(--text-3)' }}>No. PPJB / Tgl:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.ppjb}</div></div>
            <div><span style={{ color: 'var(--text-3)' }}>Tgl BAST:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.bast}</div></div>
            <div><span style={{ color: 'var(--text-3)' }}>Ukuran:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.ukuran}</div></div>
            <div><span style={{ color: 'var(--text-3)' }}>Jenis Usaha:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.usaha}</div></div>
            <div><span style={{ color: 'var(--text-3)' }}>Sertifikat / Tgl Ambil:</span> <div style={{ fontWeight: '600', marginTop: '2px' }}>{tenantData.sertifikat}</div></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: 'var(--text-3)' }}>Keterangan Arsip:</span>
              <div style={{ fontWeight: '600', marginTop: '2px', color: 'var(--text-2)' }}>{tenantData.keterangan}</div>
            </div>
          </div>
        </div>

        {/* Status Keuangan - Gabung jadi satu */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '28px',
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)'
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', color: 'var(--text)' }}>
            Status Rekapitulasi Keuangan Berjalan & Tunggakan AR
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Status Service Charge</span>
              <div style={{ marginTop: '6px' }}>
                <span
                  style={{
                    backgroundColor: getStatusBadgeStyle(tenantData.statusTagihan).bg,
                    color: getStatusBadgeStyle(tenantData.statusTagihan).color,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}
                >
                  {tenantData.statusTagihan}
                </span>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Tunggakan AR</span>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px', color: tenantData.tunggakan !== 'Rp 0' ? 'var(--orange)' : 'var(--text)' }}>
                {tenantData.tunggakan}
              </div>
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-3)', fontSize: '13px', fontWeight: '600' }}>Rincian Tunggakan:</span>
            <div style={{ fontWeight: '600', fontSize: '14px', marginTop: '2px', color: 'var(--text-2)' }}>{tenantData.rincianTunggakan}</div>
          </div>
        </div>

        {/* Riwayat Transaksi */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '28px',
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)'
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
            Riwayat Transaksi Pelaporan Terdahulu
          </h3>
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--warm-gray)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>ID</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Tanggal</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Jenis</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Nominal</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Metode</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenantData.riwayat.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
                      Belum ada riwayat transaksi.
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
    </div>
  );
}

export default DetailTenantAdmin;