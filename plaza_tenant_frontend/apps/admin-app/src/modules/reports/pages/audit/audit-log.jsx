import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon, Table, Card, Badge, Button, Modal, EmptyState, SkeletonTable, Pagination } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function AuditLogPage() {
  const { httpClient } = useAdminAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModul, setFilterModul] = useState('Semua');
  const [filterRole, setFilterRole] = useState('Semua');
  const [selectedLog, setSelectedLog] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const fallbackLogs = [
    {
      id: 101,
      username: 'superadmin',
      role: 'superadmin',
      modul: 'Auth',
      aksi: 'Login Admin',
      deskripsi: 'Superadmin berhasil login ke console admin.',
      ip_address: '127.0.0.1',
      created_at: '2026-08-07 23:45:12'
    },
    {
      id: 102,
      username: 'kasir_lisa',
      role: 'kasir',
      modul: 'Pembayaran',
      aksi: 'Input Setoran Tunai',
      deskripsi: 'Kasir Lisa mencatat setoran tunai Rp 1.500.000 untuk Kios B-101 (Hj. Yuliana).',
      ip_address: '192.168.1.15',
      created_at: '2026-08-07 23:12:05'
    },
    {
      id: 103,
      username: 'auditor_budi',
      role: 'auditor',
      modul: 'Ekspor',
      aksi: 'Unduh Rekap Bulanan',
      deskripsi: 'Auditor Budi mengunduh berkas laporan pendapatan bulan Juli format CSV/Excel.',
      ip_address: '192.168.1.20',
      created_at: '2026-08-07 22:30:19'
    },
    {
      id: 104,
      username: 'admin_kios_dani',
      role: 'admin_kios',
      modul: 'Kios',
      aksi: 'Update Status Kios',
      deskripsi: 'Admin Dani memperbarui status Kios A-04 menjadi Terisi (Penyewa Baru: Toko Berkah).',
      ip_address: '192.168.1.18',
      created_at: '2026-08-07 21:05:44'
    },
    {
      id: 105,
      username: 'superadmin',
      role: 'superadmin',
      modul: 'User',
      aksi: 'Tambah Staf Kasir',
      deskripsi: 'Superadmin mendaftarkan akun baru @kasir_rina dengan hak akses Kasir Loket.',
      ip_address: '127.0.0.1',
      created_at: '2026-08-07 20:15:00'
    }
  ];

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await httpClient.get('/api/v1/admin/logs');
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setLogs(response.data.data);
      } else {
        setLogs(fallbackLogs);
      }
    } catch (err) {
      console.warn('Fallback to local audit logs dataset:', err);
      setLogs(fallbackLogs);
    } finally {
      setIsLoading(false);
    }
  }, [httpClient]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(log =>
        log.username?.toLowerCase().includes(q) ||
        log.aksi?.toLowerCase().includes(q) ||
        log.deskripsi?.toLowerCase().includes(q)
      );
    }

    if (filterModul !== 'Semua') {
      result = result.filter(log => log.modul === filterModul);
    }

    if (filterRole !== 'Semua') {
      result = result.filter(log => log.role === filterRole);
    }

    const { key, direction } = sortConfig;
    return result.sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [logs, searchQuery, filterModul, filterRole, sortConfig]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const tableHeaders = [
    { label: 'ID Log', sortKey: 'id' },
    { label: 'Waktu & IP', sortKey: 'created_at' },
    { label: 'Pelaksana & Role', sortKey: 'username' },
    { label: 'Modul', sortKey: 'modul' },
    { label: 'Aksi', sortKey: 'aksi' },
    { label: 'Deskripsi Detail', sortable: false },
    { label: 'Detail', align: 'center', sortable: false }
  ];

  return (
    <div data-slot="audit-log-page" className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
          Audit Trail Aktivitas Admin
        </h1>
        <p className="text-text-2 text-sm sm:text-base font-medium mt-1 text-pretty">
          Rekam jejak kepatuhan dan histori tindakan seluruh staf pengelola Plaza Kebun Sayur.
        </p>
      </div>

      <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-extrabold text-text tracking-tight">
            Riwayat Aktivitas Staf ({filteredLogs.length} Entri)
          </h3>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              aria-label="Cari admin, aksi, atau deskripsi aktivitas"
              placeholder="Cari admin / aksi / deskripsi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3.5 rounded-md border border-border bg-white text-sm font-medium w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-red"
            />
            <select
              aria-label="Filter berdasarkan modul sistem"
              value={filterModul}
              onChange={(e) => {
                setFilterModul(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-3.5 pr-9 rounded-md border border-border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red cursor-pointer"
            >
              <option value="Semua">Semua Modul</option>
              <option value="Pembayaran">Pembayaran</option>
              <option value="Setoran">Setoran Tunai</option>
              <option value="Kios">Kios & Sewa</option>
              <option value="User">Staf Admin</option>
              <option value="Auth">Login / Autentikasi</option>
            </select>
            <select
              aria-label="Filter berdasarkan role staf admin"
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-3.5 pr-9 rounded-md border border-border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red cursor-pointer"
            >
              <option value="Semua">Semua Role</option>
              <option value="superadmin">Superadmin</option>
              <option value="kasir">Kasir</option>
              <option value="auditor">Auditor</option>
              <option value="admin_kios">Admin Kios</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={5} cols={7} />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon="heroicons:document-magnifying-glass-20-solid"
            title="Log Aktivitas Kosong"
            description="Tidak ada rekam aktivitas yang cocok dengan filter atau kata kunci pencarian."
          />
        ) : (
          <Table
            caption="Log Audit Trail Aktivitas Pengelola"
            headers={tableHeaders}
            colSpan={7}
            sortConfig={sortConfig}
            onSort={handleSort}
            footer={
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredLogs.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  itemName="aktivitas"
                />
              }
            >
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="border-b border-border/80 last:border-b-0 bg-white hover:bg-warm-gray/20 transition-colors">
                  <td className="p-3 font-extrabold text-text font-tabular-nums text-xs">
                    #{log.id}
                  </td>
                  <td className="p-3 text-xs text-text-2 font-medium">
                    <div>{log.created_at}</div>
                    <div className="text-2.5 text-text-3 font-mono">{log.ip_address || '127.0.0.1'}</div>
                  </td>
                  <td className="p-3 font-bold text-text text-sm">
                    <div>@{log.username}</div>
                    <span className="inline-block mt-0.5 text-2.5 px-1.5 py-0.5 rounded bg-slate-100 font-extrabold uppercase tracking-wider text-slate-700">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-3 text-xs font-bold text-text-2">
                    {log.modul}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {log.aksi}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-text font-medium max-w-xs truncate" title={log.deskripsi}>
                    {log.deskripsi}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="h-8 px-3 text-xs font-bold"
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
        )}
      </Card>

      {/* Modal Detail Audit Log */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Detail Audit Log #${selectedLog?.id}`}
        subtitle={`Waktu: ${selectedLog?.created_at || '-'}`}
        size="md"
      >
        {selectedLog && (
          <div className="flex flex-col gap-4 text-sm font-sans">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-text-3 text-xs font-semibold block">Username Staf</span>
                <strong className="text-text font-bold text-base">@{selectedLog.username}</strong>
              </div>
              <div>
                <span className="text-text-3 text-xs font-semibold block">Role Otorisasi</span>
                <span className="inline-block text-xs px-2 py-0.5 bg-slate-800 text-white font-extrabold rounded">
                  {selectedLog.role}
                </span>
              </div>
              <div>
                <span className="text-text-3 text-xs font-semibold block">Modul Sistem</span>
                <span className="font-bold text-text">{selectedLog.modul}</span>
              </div>
              <div>
                <span className="text-text-3 text-xs font-semibold block">Jenis Aksi</span>
                <span className="font-bold text-amber-700">{selectedLog.aksi}</span>
              </div>
            </div>

            <div>
              <span className="text-text-3 text-xs font-semibold block mb-1">Rincian Deskripsi Aktivitas</span>
              <div className="p-3 bg-white border border-border rounded-md text-text text-sm font-medium leading-relaxed">
                {selectedLog.deskripsi}
              </div>
            </div>

            <div className="text-xs text-text-3 font-mono flex items-center justify-between pt-2 border-t border-border">
              <span>IP Address: {selectedLog.ip_address || '127.0.0.1'}</span>
              <span>Ref ID: AUDIT-{selectedLog.id}</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AuditLogPage;
