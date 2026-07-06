import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

function DetailTenantAdmin({ tenantName, onBack }) {
  const tenantsMockDatabase = {
    'Hj. Yuliana': {
      kios: 'B-1001', ktp: '175102.460772.0005', alamat: 'Jl. Adil Makmur No. 42 Balikpapan',
      kontak: '0812-5564-593', sp: '423 / 5 Mei 2008', ppjb: '423 / 5 Mei 2008',
      bast: '1 Januari 2010', ukuran: '6 Meter Persegi', usaha: 'Kerajinan',
      sertifikat: '422 / 12 April 2012', keterangan: 'Sertifikat diambil BPD Syariah',
      statusTagihan: 'Lunas', tunggakan: 'Rp 13.219.998', rincianTunggakan: 'Tunggakan pembukuan historis lama terhitung s/d September 2024',
      riwayat: [
        { id: 'TX-3011', tanggal: '10 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' },
        { id: 'TX-3010', tanggal: '02 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ]
    },
    'Eva Tauresea': {
      kios: 'B-1004', ktp: '175102.889712.0001', alamat: 'Jl. Letjen Suprapto No. 12 Balikpapan',
      kontak: '0813-4455-6677', sp: '112 / 10 Juni 2011', ppjb: '112 / 10 Juni 2011',
      bast: '15 Agustus 2011', ukuran: '12 Meter Persegi', usaha: 'Fashion',
      sertifikat: 'Belum Diambil', keterangan: 'Menunggu konfirmasi kedatangan pemilik di kantor pengelola',
      statusTagihan: 'Belum Bayar', tunggakan: 'Rp 0', rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-2088', tanggal: '01 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' }
      ]
    },
    'H. Ahmad': {
      kios: 'B-1013', ktp: '175102.112233.0004', alamat: 'Jl. Ahmad Yani No. 5 Balikpapan',
      kontak: '0852-1122-3344', sp: '301 / 2 Maret 2009', ppjb: '301 / 2 Maret 2009',
      bast: '1 Mei 2009', ukuran: '6 Meter Persegi', usaha: 'Perhiasan',
      sertifikat: 'Belum Dibuatkan', keterangan: 'Berkas penunjang pembuatan sertifikat belum lengkap',
      statusTagihan: 'Ada Tunggakan', tunggakan: 'Rp 5.500.000', rincianTunggakan: 'Service Charge Bulan Berjalan (Rp 4.000.000) + Akumulasi Denda (Rp 1.500.000)',
      riwayat: []
    },
    'Toko Kalimantan': {
      kios: 'A-1002', ktp: '175102.556677.0002', alamat: 'Jl. Jend Sudirman No. 88 Balikpapan',
      kontak: '0811-2233-4455', sp: '204 / 12 Desember 2015', ppjb: '204 / 12 Desember 2015',
      bast: '1 Januari 2016', ukuran: '12 Meter Persegi', usaha: 'Oleh-oleh',
      sertifikat: 'Sudah Diambil', keterangan: 'Diambil oleh perwakilan keluarga sah pemilik',
      statusTagihan: 'Lunas', tunggakan: 'Rp 0', rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-1044', tanggal: '28 April 2026', tipe: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ]
    }
  };

  const tenantData = tenantsMockDatabase[tenantName] || tenantsMockDatabase['Hj. Yuliana'];

  const statusBadgeClasses = {
    'Lunas': 'bg-green-bg text-green',
    'Belum Bayar': 'bg-red-100 text-red',
    'Ada Tunggakan': 'bg-orange-bg text-orange',
  };

  return (
    <div className="page-fade-in flex flex-col gap-8">
      <div>
        <Button variant="secondary" size="sm" onClick={onBack} className="mb-4">← Kembali ke Panel Kendali Admin</Button>
        <h2 className="text-2.5xl font-extrabold text-text tracking-tight">Profil Lengkap Tenant: {tenantName} (<span className="font-mono">Kios {tenantData.kios}</span>)</h2>
        <p className="text-sm text-text-2 mt-1">Informasi kepemilikan, status keuangan, dan riwayat transaksi.</p>
      </div>

      <div className="flex flex-col gap-7">
        <Card>
          <h3 className="text-lg font-bold text-text border-b border-border pb-3 mb-5">Dokumen Informasi Kepemilikan Properti Kios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-text-3">Nama Pemilik:</span> <div className="font-semibold mt-0.5">{tenantName}</div></div>
            <div><span className="text-text-3">Nomor KTP:</span> <div className="font-semibold mt-0.5">{tenantData.ktp}</div></div>
            <div><span className="text-text-3">Alamat:</span> <div className="font-semibold mt-0.5">{tenantData.alamat}</div></div>
            <div><span className="text-text-3">Kontak:</span> <div className="font-semibold mt-0.5">{tenantData.kontak}</div></div>
            <div><span className="text-text-3">No. SP / Tgl:</span> <div className="font-semibold mt-0.5">{tenantData.sp}</div></div>
            <div><span className="text-text-3">No. PPJB / Tgl:</span> <div className="font-semibold mt-0.5">{tenantData.ppjb}</div></div>
            <div><span className="text-text-3">Tgl BAST:</span> <div className="font-semibold mt-0.5">{tenantData.bast}</div></div>
            <div><span className="text-text-3">Ukuran:</span> <div className="font-semibold mt-0.5">{tenantData.ukuran}</div></div>
            <div><span className="text-text-3">Jenis Usaha:</span> <div className="font-semibold mt-0.5">{tenantData.usaha}</div></div>
            <div><span className="text-text-3">Sertifikat / Tgl Ambil:</span> <div className="font-semibold mt-0.5">{tenantData.sertifikat}</div></div>
            <div className="sm:col-span-2"><span className="text-text-3">Keterangan Arsip:</span><div className="font-semibold mt-0.5 text-text-2">{tenantData.keterangan}</div></div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-text border-b border-border pb-3 mb-5">Status Rekapitulasi Keuangan Berjalan & Tunggakan AR</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="bg-warm-gray p-4 rounded-md"><span className="text-text-3 text-xs font-bold uppercase tracking-wide">Status Service Charge</span><div className="mt-1.5"><span className={`inline-block px-3 py-1 rounded font-bold text-xs ${statusBadgeClasses[tenantData.statusTagihan] || 'bg-warm-gray text-text-2'}`}>{tenantData.statusTagihan}</span></div></div>
            <div className="bg-warm-gray p-4 rounded-md"><span className="text-text-3 text-xs font-bold uppercase tracking-wide">Tunggakan AR</span><div className={`text-base font-extrabold mt-1.5 font-mono ${tenantData.tunggakan !== 'Rp 0' ? 'text-orange' : 'text-text'}`}>{tenantData.tunggakan}</div></div>
          </div>
          <div><span className="text-text-3 text-xs font-semibold">Rincian Tunggakan:</span><div className="font-semibold text-sm mt-0.5 text-text-2">{tenantData.rincianTunggakan}</div></div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-text mb-4">Riwayat Transaksi Pelaporan Terdahulu</h3>
          <div className="border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr className="bg-warm-gray border-b-2 border-border">
                    <th className="px-3 py-2 text-left text-xs font-bold text-text-2">ID</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-text-2">Tanggal</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-text-2">Jenis</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-text-2">Nominal</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-text-2">Metode</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-text-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantData.riwayat.length === 0 ? (
                    <tr><td colSpan="6" className="py-6 text-center text-text-3 text-sm">Belum ada riwayat transaksi.</td></tr>
                  ) : (
                    tenantData.riwayat.map((row, idx) => (
                      <tr key={row.id} className={`border-b border-border ${idx % 2 === 0 ? 'bg-white' : 'bg-warm-gray'}`}>
                        <td data-label="ID" className="px-3 py-2 font-semibold text-sm font-mono">{row.id}</td>
                        <td data-label="Tanggal" className="px-3 py-2 text-text-2 text-sm">{row.tanggal}</td>
                        <td data-label="Jenis" className="px-3 py-2 text-text-2 text-sm">{row.tipe}</td>
                        <td data-label="Nominal" className="px-3 py-2 font-semibold text-sm font-mono">{row.nominal}</td>
                        <td data-label="Metode" className="px-3 py-2 text-text-3 font-semibold text-sm">{row.metode}</td>
                        <td data-label="Status" className="px-3 py-2"><span className="bg-green-bg text-green px-2 py-0.5 rounded font-bold text-[11px]">{row.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DetailTenantAdmin;
