import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon, Table, Card, Badge, Button, Modal, EmptyState, SkeletonTable, Pagination, formatDateTimeLocal } from '@bunsay/shared-ui';
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
    <div data-slot="audit-log-page" className="page-fade-in flex flex-col gap-4 sm:gap-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text text-balance">
          Log Aktivitas
        </h1>
      </div>

      {/* Main Audit Log Table (Seamless Edge-to-Edge Surface) */}
      <div className="w-full bg-white rounded-2xl border border-border/80 shadow-xs overflow-hidden flex flex-col">
        <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/80 bg-white">
          <h2 className="text-sm sm:text-base font-bold text-text">
            Riwayat Aktivitas ({filteredLogs.length})
          </h2>

          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <input
              type="text"
              aria-label="Cari admin, aksi, atau deskripsi aktivitas"
              placeholder="Cari admin / aksi / deskripsi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-border bg-mono-50/70 text-xs sm:text-sm font-medium w-full sm:w-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red shadow-xs"
            />
            <select
              aria-label="Filter berdasarkan modul sistem"
              value={filterModul}
              onChange={(e) => {
                setFilterModul(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-border bg-white text-xs sm:text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red cursor-pointer shadow-xs"
            >
              <option value="Semua">Semua Modul</option>
              <option value="Pembayaran">Pembayaran</option>
              <option value="Setoran">Setoran Tunai</option>
              <option value="Kios">Kios &amp; Sewa</option>
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
              className="h-9 px-3 rounded-lg border border-border bg-white text-xs sm:text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red cursor-pointer shadow-xs"
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
          <div className="p-6">
            <SkeletonTable rows={5} cols={7} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="heroicons:document-magnifying-glass-20-solid"
              title="Belum ada aktivitas"
              description="Tidak ada aktivitas yang sesuai dengan filter atau kata kunci pencarian."
              actionLabel={searchQuery || filterModul !== 'Semua' || filterRole !== 'Semua' ? "Reset Semua Filter" : undefined}
              onAction={searchQuery || filterModul !== 'Semua' || filterRole !== 'Semua' ? () => { setSearchQuery(''); setFilterModul('Semua'); setFilterRole('Semua'); setCurrentPage(1); } : undefined}
            />
          </div>
        ) : (
          <Table
            className="border-0 rounded-none shadow-none"
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
                <tr key={log.id} className="border-b border-border/80 last:border-b-0 hover:bg-red-50/20 transition-colors">
                  <th scope="row" className="p-3 font-mono font-bold text-text text-start text-xs">
                    #{log.id}
                  </th>
                  <td className="p-3 text-xs text-text-2 font-medium text-start">
                    {(() => {
                      const formattedWaktu = formatDateTimeLocal(log.created_at);
                      return (
                        <div className="font-tabular-nums text-text font-semibold" title={formattedWaktu.fullTitle}>
                          {formattedWaktu.formatted}
                        </div>
                      );
                    })()}
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
                  <td className="p-3 text-center whitespace-nowrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      aria-label={`Lihat detail log nomor ${log.id}`}
                      className="h-8 px-3 text-xs font-bold shadow-2xs"
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
        )}
      </div>

      {/* Modal Detail Audit Log */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Detail Audit Log #${selectedLog?.id}`}
        subtitle={selectedLog?.created_at ? `Waktu: ${formatDateTimeLocal(selectedLog.created_at).formatted}` : '-'}
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
