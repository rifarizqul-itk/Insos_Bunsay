import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useTenantDashboard } from '../../hooks/useTenant';

function DashboardTenant() {
  const navigate = useNavigate();
  const { setBayar, addToast } = useUI();
  const { data, loading, error, refetch } = useTenantDashboard();


  if (loading) {
    return (
      <div className="page-fade-in flex flex-col gap-8">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-warm-gray/70 animate-pulse rounded-md"></div>
          <div className="h-5 w-96 max-w-full bg-warm-gray/50 animate-pulse rounded-md"></div>
        </div>
        <div className="h-32 w-full bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-36 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
          <div className="h-36 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
          <div className="h-36 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--red)', fontWeight: '600' }}>Gagal memuat data. Silakan coba lagi.</p>
        <button onClick={refetch} style={{ marginTop: '16px', backgroundColor: 'var(--red)', color: '#fff', padding: '0 24px', height: '44px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' }}>
          Muat Ulang
        </button>
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Data tidak tersedia.</div>;
  }

  const { nama, kios, serviceCharge, tunggakan } = data;
  const memilikiTagihan = tunggakan && tunggakan.nominal > 0;

  const handleBayar = (nominal, jenis) => {
    setBayar(String(nominal), jenis);
    navigate('/tenant/pembayaran');
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px' }}>
          Halo, {nama}
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '16px', fontWeight: '600', marginTop: '6px' }}>
          Pemilik Sah Kios <span className="font-tabular-nums font-bold">{kios}</span> — Selamat datang di panel administrasi mandiri Anda.
        </p>
      </div>

      {memilikiTagihan && (
        <div 
          role="alert"
          className="p-5 sm:p-7 md:p-8"
          style={{
            backgroundColor: 'var(--red-50)',
            border: '2px solid var(--red)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 className="label-micro" style={{ color: 'var(--red)', margin: 0, fontSize: '13px' }}>
              Pemberitahuan Tagihan Belum Lunas
            </h3>
            <p style={{ fontSize: '16px', color: 'var(--text)', fontWeight: '700', margin: '8px 0 0 0', lineHeight: '1.6' }}>
              Sistem mendeteksi Anda masih memiliki kewajiban {tunggakan.label} sebesar <span className="font-tabular-nums font-bold">Rp {tunggakan.nominal.toLocaleString('id-ID')}</span>. Silakan klik tombol untuk melangsungkan pelaporan bayar.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <button
              onClick={() => handleBayar(tunggakan.nominal, 'Cicilan Tunggakan (Piutang)')}
              className="w-full md:w-auto"
              style={{
                backgroundColor: 'var(--red)',
                color: '#ffffff',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: '800',
                border: '2px solid var(--red-dark)',
                height: '52px',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Bayar Tagihan Sekarang
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        <div 
          className="p-5 sm:p-6 md:p-7"
          style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <span className="label-micro">Masa Aktif Service Charge</span>
          <div className="font-tabular-nums" style={{ fontSize: '26px', fontWeight: '800', lineHeight: '1.4', margin: '12px 0 8px 0', color: 'var(--text)' }}>{serviceCharge.dueDate}</div>
          <span style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: '600' }}>Tenggat biaya fasilitas & pengelolaan kios</span>
        </div>

        <div 
          className="p-5 sm:p-6 md:p-7"
          style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <span className="label-micro">Service Charge Bulan Ini</span>
          <div style={{ margin: '12px 0 8px 0', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ backgroundColor: 'var(--green-bg)', color: 'var(--green)', padding: '6px 14px', borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '14px', border: '2px solid var(--green)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span aria-hidden="true">✓</span> {serviceCharge.status}
            </span>
            <div className="font-tabular-nums" style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)', lineHeight: '1.2' }}>Rp {serviceCharge.nominal.toLocaleString('id-ID')}</div>
          </div>
          <span style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: '600' }}>Fasilitas & utilitas pasar</span>
        </div>

        <div 
          className="p-5 sm:p-6 md:p-7"
          style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <span className="label-micro">Tunggakan Historis</span>
          <div className="font-tabular-nums" style={{ fontSize: '26px', fontWeight: '800', lineHeight: '1.4', margin: '12px 0 8px 0', color: 'var(--orange)' }}>Rp {tunggakan.nominal.toLocaleString('id-ID')}</div>
          <span style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: '600' }}>Data terarsip s/d Sept 2024</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardTenant;
