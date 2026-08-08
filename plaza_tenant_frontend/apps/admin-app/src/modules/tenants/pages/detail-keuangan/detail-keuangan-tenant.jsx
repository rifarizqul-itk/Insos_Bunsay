import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon, Card, Button, Badge, Table, AlokasiBreakdown, EmptyState } from '@bunsay/shared-ui';

function DetailKeuanganTenant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tenant] = useState({
    id: id || 'B-1001',
    nama: 'Hj. Yuliana',
    kios: id || 'B-1001',
    usaha: 'Sembako & Kelontong',
    statusPembayaran: 'Dicicil',
    tunggakan: 3500000,
    rincianTunggakan: 'Sewa Mei 2026 kurang Rp 3.500.000',
    riwayat: [
      {
        id: 'TRX-1090',
        tanggal: '10 Mei 2026',
        tipe: 'Setoran Cicilan Sewa Mei',
        nominal: 500000,
        metode: 'Tunai Kasir',
        status: 'Lunas',
        alokasi: [{ idTagihan: 101, periode: '2026-05', nominalTeralokasi: 500000, totalTagihan: 4000000, statusAkhir: 'Dicicil' }]
      }
    ]
  });

  const tableHeaders = [
    { label: 'ID Transaksi' },
    { label: 'Tanggal' },
    { label: 'Jenis / Ket' },
    { label: 'Nominal Bayar' },
    { label: 'Metode' },
    { label: 'Rincian Cicilan' },
    { label: 'Status' }
  ];

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/admin/kios')}
          className="mb-4 gap-2 font-bold"
        >
          <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
          <span>Kembali ke Ketersediaan Kios</span>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
              Detail Keuangan: {tenant.nama}
            </h1>
            <p className="text-text-2 text-sm sm:text-base font-medium mt-1">
              Nomor Kios: <strong className="font-tabular-nums text-red">{tenant.kios}</strong> — {tenant.usaha}
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-extrabold self-start sm:self-auto">
            <Icon icon="heroicons:shield-check-20-solid" width="18" height="18" className="text-emerald-600" />
            <span>Kalkulasi Status Otomatis (Ledger Real-Time)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Card variant="elevated" className="p-5 flex flex-col justify-between">
            <span className="label-micro text-text-3">Status Pembayaran Bulan Ini</span>
            <div className="mt-2">
              <Badge status={tenant.statusPembayaran} />
            </div>
          </Card>

          <Card variant="elevated" className="p-5 flex flex-col justify-between">
            <span className="label-micro text-text-3">Total Tunggakan Akumulatif</span>
            <div className={`text-2xl sm:text-3xl font-extrabold font-tabular-nums mt-1 ${tenant.tunggakan > 0 ? 'text-orange' : 'text-green'}`}>
              Rp {tenant.tunggakan.toLocaleString('id-ID')}
            </div>
          </Card>
        </div>

        <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-text tracking-tight">
            Riwayat Transaksi Tenant
          </h3>

          {tenant.riwayat.length === 0 ? (
            <EmptyState
              icon="heroicons:receipt-refund-20-solid"
              title="Belum Ada Transaksi"
              description="Tenant ini belum memiliki riwayat transaksi pembayaran."
            />
          ) : (
            <Table
              caption={`Riwayat Transaksi Keuangan Kios ${tenant.kios}`}
              headers={tableHeaders}
              colSpan={7}
            >
              {tenant.riwayat.map((row, idx) => (
                <tr key={row.id || idx} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                  <th scope="row" className="font-tabular-nums font-bold p-3 text-text text-left">
                    {row.id}
                  </th>
                  <td className="p-3 text-text-2 font-medium font-tabular-nums">
                    {row.tanggal}
                  </td>
                  <td className="p-3 text-text font-semibold">
                    {row.tipe}
                  </td>
                  <td className="font-tabular-nums font-extrabold p-3 text-text">
                    Rp {row.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-text-3 font-semibold text-xs">
                    {row.metode}
                  </td>
                  <td className="p-3">
                    <AlokasiBreakdown alokasiList={row.alokasi} compact={true} />
                  </td>
                  <td className="p-3">
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

export default DetailKeuanganTenant;
