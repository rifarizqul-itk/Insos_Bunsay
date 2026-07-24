import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Icon from '../../components/ui/Icon';
import EmptyState from '../../components/ui/EmptyState';

function DetailTenantAdmin({ tenantName, onBack }) {
  const tenantsMockDatabase = {
    'Hj. Yuliana': {
      kios: 'B-1001', ktp: '175102.460772.0005', alamat: 'Jl. Adil Makmur No. 42 Balikpapan',
      kontak: '0812-5564-593', sp: '423 / 5 Mei 2008', ppjb: '423 / 5 Mei 2008',
      bast: '1 Januari 2010', ukuran: '6 Meter Persegi', usaha: 'Kerajinan',
      sertifikat: '422 / 12 April 2012', keterangan: 'Sertifikat diambil BPD Syariah',
      statusTagihan: 'Lunas', tunggakan: 'Rp 0', rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-3011', tanggal: '10 Mei 2026', tipe: 'Pelunasan Masa Sewa Kios', nominal: 'Rp 3.500.000', metode: 'Midtrans', status: 'Lunas' },
        { id: 'TX-3010', tanggal: '02 Mei 2026', tipe: 'Pelunasan Masa Sewa Kios', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ]
    },
    'Eva Tauresea': {
      kios: 'B-1004', ktp: '175102.889712.0001', alamat: 'Jl. Letjen Suprapto No. 12 Balikpapan',
      kontak: '0813-4455-6677', sp: '112 / 10 Juni 2011', ppjb: '112 / 10 Juni 2011',
      bast: '15 Agustus 2011', ukuran: '12 Meter Persegi', usaha: 'Fashion',
      sertifikat: 'Belum Diambil', keterangan: 'Menunggu konfirmasi kedatangan pemilik di kantor pengelola',
      statusTagihan: 'Belum Bayar', tunggakan: 'Rp 0', rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-2088', tanggal: '01 Mei 2026', tipe: 'Pelunasan Masa Sewa Kios', nominal: 'Rp 3.500.000', metode: 'Midtrans', status: 'Lunas' }
      ]
    },
    'H. Ahmad': {
      kios: 'B-1013', ktp: '175102.112233.0004', alamat: 'Jl. Ahmad Yani No. 5 Balikpapan',
      kontak: '0852-1122-3344', sp: '301 / 2 Maret 2009', ppjb: '301 / 2 Maret 2009',
      bast: '1 Mei 2009', ukuran: '6 Meter Persegi', usaha: 'Perhiasan',
      sertifikat: 'Belum Dibuatkan', keterangan: 'Berkas penunjang pembuatan sertifikat belum lengkap',
      statusTagihan: 'Dicicil', tunggakan: 'Rp 2.500.000', rincianTunggakan: 'Sewa Bulan Berjalan (Rp 4.000.000) + Akumulasi Tunggakan (Rp 2.500.000)',
      riwayat: []
    },
    'Toko Kalimantan': {
      kios: 'A-1002', ktp: '175102.556677.0002', alamat: 'Jl. Jend Sudirman No. 88 Balikpapan',
      kontak: '0811-2233-4455', sp: '204 / 12 Desember 2015', ppjb: '204 / 12 Desember 2015',
      bast: '1 Januari 2016', ukuran: '12 Meter Persegi', usaha: 'Oleh-oleh',
      sertifikat: 'Sudah Diambil', keterangan: 'Diambil oleh perwakilan keluarga sah pemilik',
      statusTagihan: 'Lunas', tunggakan: 'Rp 0', rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-1044', tanggal: '28 April 2026', tipe: 'Pelunasan Masa Sewa Kios', nominal: 'Rp 3.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ]
    }
  };

  const tenantData = tenantsMockDatabase[tenantName] || tenantsMockDatabase['Hj. Yuliana'];

  const tableHeaders = [
    { label: 'ID Transaksi' },
    { label: 'Tanggal' },
    { label: 'Jenis' },
    { label: 'Nominal' },
    { label: 'Metode' },
    { label: 'Status' },
  ];

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <Button variant="secondary" size="sm" onClick={onBack} className="mb-4 gap-2 font-bold">
          <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
          <span>Kembali ke Panel Kendali Admin</span>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Profil Lengkap Tenant: {tenantName} (<span className="font-tabular-nums text-red">Kios {tenantData.kios}</span>)
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1">Informasi kepemilikan, status keuangan, dan riwayat transaksi.</p>
      </div>

      <div className="flex flex-col gap-6">
        <Card variant="elevated" className="p-6 sm:p-7">
          <h3 className="text-lg font-extrabold text-text tracking-tight border-b border-border pb-3 mb-5">
            Dokumen Informasi Kepemilikan Properti Kios
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-text-3 font-semibold">Nama Pemilik:</span> <div className="font-bold text-text mt-0.5">{tenantName}</div></div>
            <div><span className="text-text-3 font-semibold">Nomor KTP:</span> <div className="font-bold text-text font-tabular-nums mt-0.5">{tenantData.ktp}</div></div>
            <div><span className="text-text-3 font-semibold">Alamat:</span> <div className="font-semibold text-text mt-0.5">{tenantData.alamat}</div></div>
            <div><span className="text-text-3 font-semibold">Kontak HP:</span> <div className="font-bold text-text font-tabular-nums mt-0.5">{tenantData.kontak}</div></div>
            <div><span className="text-text-3 font-semibold">No. SP / Tgl:</span> <div className="font-bold text-text font-tabular-nums mt-0.5">{tenantData.sp}</div></div>
            <div><span className="text-text-3 font-semibold">No. PPJB / Tgl:</span> <div className="font-bold text-text font-tabular-nums mt-0.5">{tenantData.ppjb}</div></div>
            <div><span className="text-text-3 font-semibold">Tgl BAST:</span> <div className="font-bold text-text font-tabular-nums mt-0.5">{tenantData.bast}</div></div>
            <div><span className="text-text-3 font-semibold">Ukuran Unit:</span> <div className="font-bold text-text font-tabular-nums mt-0.5">{tenantData.ukuran}</div></div>
            <div><span className="text-text-3 font-semibold">Jenis Usaha:</span> <div className="font-bold text-text mt-0.5">{tenantData.usaha}</div></div>
            <div><span className="text-text-3 font-semibold">Sertifikat / Tgl Ambil:</span> <div className="font-bold text-text font-tabular-nums mt-0.5">{tenantData.sertifikat}</div></div>
            <div className="sm:col-span-2">
              <span className="text-text-3 font-semibold block mb-1">Keterangan Arsip:</span>
              <Card variant="inset" className="p-3 text-xs text-text leading-relaxed">
                {tenantData.keterangan}
              </Card>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 sm:p-7">
          <h3 className="text-lg font-extrabold text-text tracking-tight border-b border-border pb-3 mb-5">
            Status Rekapitulasi Keuangan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
            <Card variant="inset" className="p-4 flex flex-col justify-between">
              <span className="label-micro text-text-3">Status Tagihan Sewa</span>
              <div className="mt-1.5">
                <Badge status={tenantData.statusTagihan} />
              </div>
            </Card>
            <Card variant="inset" className="p-4 flex flex-col justify-between">
              <span className="label-micro text-text-3">Total Tunggakan</span>
              <div className={`text-xl font-extrabold font-tabular-nums mt-1 ${tenantData.tunggakan !== 'Rp 0' ? 'text-orange' : 'text-text'}`}>
                {tenantData.tunggakan}
              </div>
            </Card>
          </div>
          <div>
            <span className="text-text-3 text-xs font-semibold block mb-1">Rincian Tunggakan:</span>
            <div className="font-semibold text-sm text-text-2">{tenantData.rincianTunggakan}</div>
          </div>
        </Card>

        <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-text tracking-tight">
            Riwayat Transaksi Pelaporan Terdahulu
          </h3>

          {tenantData.riwayat.length === 0 ? (
            <EmptyState
              icon="heroicons:receipt-refund-20-solid"
              title="Belum Ada Transaksi"
              description="Belum ada catatan transaksi pelaporan terdahulu."
            />
          ) : (
            <Table
              caption="Riwayat Transaksi Pelaporan Terdahulu"
              ariaLabel="Tabel Riwayat Transaksi Pelaporan Terdahulu Tenant"
              headers={tableHeaders}
              colSpan={6}
            >
              {tenantData.riwayat.map((row, idx) => (
                <tr key={row.id || idx} className={`border-b border-border/80 ${idx % 2 === 0 ? 'bg-white' : 'bg-warm-gray/30'}`}>
                  <td data-label="ID" className="font-tabular-nums font-bold p-3 text-text-2">
                    {row.id}
                  </td>
                  <td data-label="Tanggal" className="p-3 text-text-2 font-medium font-tabular-nums">
                    {row.tanggal}
                  </td>
                  <td data-label="Jenis" className="p-3 text-text font-semibold">
                    {row.tipe}
                  </td>
                  <td data-label="Nominal" className="font-tabular-nums font-extrabold p-3 text-text">
                    {row.nominal}
                  </td>
                  <td data-label="Metode" className="p-3 text-text-3 font-semibold text-xs">
                    {row.metode}
                  </td>
                  <td data-label="Status" className="p-3">
                    <Badge status={row.status} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}

export default DetailTenantAdmin;
