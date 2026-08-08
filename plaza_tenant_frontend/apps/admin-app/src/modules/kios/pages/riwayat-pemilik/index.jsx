import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Drawer, EmptyState, Icon, SkeletonTable } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function RiwayatPemilikKios() {
  const navigate = useNavigate();
  const { httpClient } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showLegalitasDrawer, setShowLegalitasDrawer] = useState(false);
  const [exTenants, setExTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const tableHeaders = [
    { label: 'Nama Pemilik (Ex-Tenant)' },
    { label: 'Unit Kios Terakhir' },
    { label: 'Jenis Usaha' },
    { label: 'Status Keanggotaan' },
    { label: 'Keterangan' },
    { label: 'Aksi', align: 'center' }
  ];

  useEffect(() => {
    async function fetchExTenants() {
      setIsLoading(true);
      try {
        const response = await httpClient.get('/api/v1/admin/pemilik');
        if (response?.data && Array.isArray(response.data.data || response.data)) {
          const raw = Array.isArray(response.data.data) ? response.data.data : response.data;
          const mapped = raw
            .filter(item => item.Status_Pemilik === 'Nonaktif' || item.statusPemilik === 'Nonaktif')
            .map((item, idx) => ({
              id: item.Id_Pemilik || idx + 1,
              nama: item.Nama || item.nama,
              kios: item.sewa?.[0]?.kios?.No_Kios || item.kios || 'Ex-Kios',
              usaha: item.sewa?.[0]?.Jenis_Usaha || item.usaha || 'Perdagangan Umum',
              statusPemilik: 'Nonaktif',
              rincianTunggakan: item.Catatan || 'Mantan Pemilik Kios',
              sp: 'SP-084/PLZ-BUNSAY/2024',
              ppjb: 'PPJB-1029',
              ukuran: '3 x 4 Meter',
              sertifikat: 'HGB Resmi Pemkot',
              telepon: item.No_HP || '081298765432'
            }));
          setExTenants(mapped);
        }
      } catch (err) {
        console.warn('Backend fetch ex-tenants error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExTenants();
  }, [httpClient]);

  const filteredExTenants = exTenants.filter(item => {
    return (item.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (item.kios || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleOpenLegalitas = (tenant) => {
    setSelectedTenant(tenant);
    setShowLegalitasDrawer(true);
  };

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/admin/kios')}
              className="min-h-[36px] h-9 px-3"
            >
              <Icon icon="heroicons:arrow-left-20-solid" width="18" height="18" />
              <span className="ml-1 text-xs font-bold">Kembali ke Kios</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
              Riwayat Pemilik Kios (Ex-Tenant)
            </h1>
          </div>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
            Arsip data mantan pemilik kios, rincian legalitas dokumen, dan riwayat keanggotaan.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari mantan pemilik / kios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 px-3.5 rounded-md border border-border bg-white text-sm font-medium w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-red"
          />
        </div>
      </div>

      <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-extrabold text-text tracking-tight">
            Daftar Mantan Pemilik Kios
          </h3>
          <Badge status="Arsip Baku" variant="neutral" />
        </div>

        {isLoading ? (
          <SkeletonTable rows={4} cols={6} />
        ) : filteredExTenants.length === 0 ? (
          <EmptyState
            icon="heroicons:user-minus-20-solid"
            title="Tidak Ada Riwayat Pemilik Nonaktif"
            description="Semua pemilik kios saat ini berstatus aktif menyewa unit."
          />
        ) : (
          <Table
            caption="Daftar Mantan Pemilik Kios Plaza Kebun Sayur"
            ariaLabel="Tabel Riwayat Pemilik Kios Nonaktif"
            headers={tableHeaders}
            colSpan={6}
          >
            {filteredExTenants.map((tenant, idx) => (
              <tr key={tenant.id || idx} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                <th scope="row" data-label="Nama Pemilik" className="p-3 font-bold text-left text-text">
                  {tenant.nama}
                </th>
                <td data-label="Unit Kios Terakhir" className="font-tabular-nums font-extrabold p-3 text-text">
                  {tenant.kios}
                </td>
                <td data-label="Jenis Usaha" className="p-3 text-text-2 font-medium">
                  {tenant.usaha}
                </td>
                <td data-label="Status Keanggotaan" className="p-3">
                  <Badge status="Nonaktif" />
                </td>
                <td data-label="Keterangan" className="p-3 text-text-3 text-xs font-semibold">
                  {tenant.rincianTunggakan}
                </td>
                <td data-label="Aksi" className="p-3 text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenLegalitas(tenant)}
                    className="min-h-[44px] sm:min-h-9 sm:h-9 px-4 text-xs font-bold"
                  >
                    Detail Legalitas
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Drawer
        isOpen={showLegalitasDrawer}
        onClose={() => { setShowLegalitasDrawer(false); setSelectedTenant(null); }}
        title="Detail Dokumen & Legalitas Ex-Tenant"
        subtitle={selectedTenant ? `${selectedTenant.nama} (Unit Terakhir ${selectedTenant.kios})` : ''}
        size="md"
      >
        {selectedTenant && (
          <div className="flex flex-col gap-6 text-sm">
            <Card variant="inset" className="p-4 flex flex-col gap-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-3">Identitas Ex-Tenant</h4>
              <div><span className="text-text-3 font-medium">Nama Pemilik:</span> <strong className="text-text font-bold">{selectedTenant.nama}</strong></div>
              <div><span className="text-text-3 font-medium">Kontak WhatsApp:</span> <strong className="text-text font-bold font-tabular-nums">{selectedTenant.telepon}</strong></div>
              <div><span className="text-text-3 font-medium">Jenis Usaha Terakhir:</span> <strong className="text-text font-bold">{selectedTenant.usaha}</strong></div>
              <div><span className="text-text-3 font-medium">Status Sewa:</span> <Badge status="Nonaktif" /></div>
            </Card>

            <Card variant="inset" className="p-4 flex flex-col gap-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-3">Arsip Legalitas Kios ({selectedTenant.kios})</h4>
              <div><span className="text-text-3 font-medium">Surat Perjanjian (SP):</span> <strong className="text-text font-bold">{selectedTenant.sp}</strong></div>
              <div><span className="text-text-3 font-medium">PPJB:</span> <strong className="text-text font-bold">{selectedTenant.ppjb}</strong></div>
              <div><span className="text-text-3 font-medium">Ukuran Kios:</span> <strong className="text-text font-bold">{selectedTenant.ukuran}</strong></div>
              <div><span className="text-text-3 font-medium">Status Sertifikat:</span> <strong className="text-text font-bold">{selectedTenant.sertifikat}</strong></div>
            </Card>

            <Card variant="inset" className="p-4 flex flex-col gap-2 border-l-4 border-l-orange">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange">Catatan Pengelola</h4>
              <p className="text-text font-medium text-xs leading-relaxed">
                {selectedTenant.rincianTunggakan}
              </p>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default RiwayatPemilikKios;
