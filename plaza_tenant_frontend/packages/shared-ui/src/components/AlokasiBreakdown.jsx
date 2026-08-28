import React from 'react';

const AlokasiBreakdown = React.memo(function AlokasiBreakdown({ alokasiList = [], compact = false }) {
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(val) || 0);
  };

  if (!alokasiList || alokasiList.length === 0) {
    return (
      <span style={{ fontSize: '12px', color: 'var(--text-3)', italic: 'true' }}>
        —
      </span>
    );
  }

  if (compact) {
    return (
      <div data-slot="alokasi-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {alokasiList.map((item, idx) => (
          <div key={item.idTagihan || idx} style={{ fontSize: '12px', color: 'var(--text-2)' }}>
            <span className="font-tabular-nums font-bold" style={{ color: 'var(--text)' }}>{item.periode}</span>: {' '}
            <span className="font-tabular-nums" style={{ color: 'var(--green)', fontWeight: '700' }}>
              {formatRupiah(item.nominalTeralokasi)}
            </span>
            {item.statusAkhir && (
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                marginInlineStart: '6px',
                padding: '1px 5px',
                borderRadius: '3px',
                backgroundColor: item.statusAkhir === 'Lunas' ? 'var(--green-bg)' : 'var(--orange-bg)',
                color: item.statusAkhir === 'Lunas' ? 'var(--green)' : 'var(--orange)'
              }}>
                {item.statusAkhir}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      data-slot="alokasi-breakdown"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: 'var(--warm-gray)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px'
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-2)', textTransform: 'uppercase' }}>
        Alokasi Pelunasan
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {alokasiList.map((item, idx) => (
          <div
            key={item.idTagihan || idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface)',
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              fontSize: '13px'
            }}
            className="bg-white"
          >
            <span style={{ fontWeight: '700', color: 'var(--text)' }}>
              Periode <span className="font-tabular-nums">{item.periode}</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-tabular-nums" style={{ fontWeight: '800', color: 'var(--green)' }}>
                {formatRupiah(item.nominalTeralokasi)}
              </span>
              {item.statusAkhir && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: item.statusAkhir === 'Lunas' ? 'var(--green-bg)' : 'var(--orange-bg)',
                  color: item.statusAkhir === 'Lunas' ? 'var(--green)' : 'var(--orange)'
                }}>
                  {item.statusAkhir}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default AlokasiBreakdown;
export { AlokasiBreakdown };
