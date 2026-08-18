import React from 'react';

const FIFOPreview = React.memo(function FIFOPreview({ allocations = [], nominal = 0 }) {
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(val) || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Lunas':
        return { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Lunas' };
      case 'Dicicil':
        return { bg: 'var(--orange-bg)', color: 'var(--orange)', label: 'Dicicil' };
      default:
        return { bg: 'var(--warm-gray)', color: 'var(--text-3)', label: 'Belum Terbayar' };
    }
  };

  if (!nominal || Number(nominal) <= 0) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--warm-gray)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border)',
        fontSize: '14px',
        color: 'var(--text-3)',
        textAlign: 'center'
      }}>
        Masukkan nominal pembayaran di atas untuk melihat rincian alokasi.
      </div>
    );
  }

  return (
    <div
      data-slot="fifo-preview"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--warm-gray)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px'
      }}
      className="page-fade-in"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
          Rincian Tagihan
        </span>
        <span className="font-tabular-nums" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--red)' }}>
          {formatRupiah(nominal)}
        </span>
      </div>

      {allocations.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-2)', margin: 0 }} className="text-pretty">
          Semua tagihan sewa Anda sudah lunas. Nominal ini akan dicatat sebagai pembayaran di muka.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {allocations.map((item, idx) => {
            const badge = getStatusBadge(item.statusAkhir);
            return (
              <div
                key={item.idTagihan || idx}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
                className="bg-white"
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>
                    Periode: <span className="font-tabular-nums">{item.periode}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>
                    Teralokasi: <strong className="font-tabular-nums" style={{ color: 'var(--green)' }}>{formatRupiah(item.nominalTeralokasi)}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'end' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: badge.bg,
                    color: badge.color,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {badge.label}
                  </span>
                  {item.sisaTagihan > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--orange)', marginTop: '2px' }} className="font-tabular-nums">
                      Sisa: {formatRupiah(item.sisaTagihan)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default FIFOPreview;
export { FIFOPreview };
