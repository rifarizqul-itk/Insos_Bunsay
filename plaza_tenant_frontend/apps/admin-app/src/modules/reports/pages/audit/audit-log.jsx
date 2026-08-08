import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon, Table, Card, Badge, Button, Modal, EmptyState, SkeletonTable } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../../auth/useAdminAuth';

function AuditLogPage() {
  const { httpClient } = useAdminAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModul, setFilterModul] = useState('Semua');
  const [filterRole, setFilterRole] = useState('Semua');
  const [selectedLog, setSelectedLog] = useState(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

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
      aksi: 'Verifikasi Terima',
      deskripsi: 'Admin memverifikasi status pembayaran TRX-20 menjadi Diterima.',
      ip_address: '127.0.0.1',
      created_at: '2026-08-07 22:30:00'
    },
    {
      id: 103,
      username: 'superadmin',
      role: 'superadmin',
      modul: 'User',
      aksi: 'Tambah Staf',
      deskripsi: 'Menambahkan staf baru Lisa Anggraini (@kasir_lisa) dengan role kasir.',
      ip_address: '127.0.0.1',
      created_at: '2026-08-07 20:15:00'
    }
  ];

  const tableHeaders = [
    { label: 'ID Log', sortKey: 'id' },
    { label: 'Waktu & IP', sortKey: 'created_at' },
    { label: 'Pengelola (User)', sortKey: 'username' },
    { label: 'Modul', sortKey: 'modul' },
    { label: 'Jenis Aksi', sortKey: 'aksi' },
    { label: 'Detail Deskripsi', sortKey: 'deskripsi' },
    { label: 'Aksi', align: 'center', sortable: false }
  ];

  const filteredLogs = useMemo(() => {
    let list = logs.filter((log) => {
      const matchModul = filterModul === 'Semua' || log.modul === filterModul;
      const matchRole = filterRole === 'Semua' || log.role === filterRole;
      const q = searchQuery.toLowerCase();
      const matchSearch = String(log.username || '').toLowerCase().includes(q) ||
                          String(log.deskripsi || '').toLowerCase().includes(q) ||
                          String(log.aksi || '').toLowerCase().includes(q);
      return matchModul && matchRole && matchSearch;
    });

    const { key, direction } = sortConfig;
    return list.sort((a, b) => {
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [logs, filterModul, filterRole, searchQuery, sortConfig]);

  return (
    <div className="page-fade-in flex flex-col gap-6 sm:gap-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight text-balance">
            Log Aktivitas Pengelola (Audit Trail)
          </h1>
          <p className="text-text-2 text-sm sm:text-base font-medium mt-1">
            Rekam jejak audit digital seluruh aktivitas sensitif staf pengelola di Plaza Kebun Sayur.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchLogs}
          className="gap-2 font-bold self-start sm:self-auto"
        >
          <Icon icon="heroicons:arrow-path-20-solid" width="16" height="16" />
          <span>Refresh Log</span>
        </Button>
      </div>

      <Card variant="elevated" className="p-4 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-extrabold text-text tracking-tight">
            Riwayat Aktivitas Staf ({filteredLogs.length} Entri)
          </h3>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari admin / aksi / deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 px-3.5 rounded-md border border-border bg-white text-sm font-medium w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-red"
            />
            <select
              value={filterModul}
              onChange={(e) => setFilterModul(e.target.value)}
              className="h-10 px-3 rounded-md border border-border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red"
            >
              <option value="Semua">Semua Modul</option>
              <option value="Pembayaran">Pembayaran</option>
              <option value="Setoran">Setoran Tunai</option>
              <option value="Kios">Kios & Sewa</option>
              <option value="User">Staf Admin</option>
              <option value="Auth">Login / Autentikasi</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-10 px-3 rounded-md border border-border bg-white text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-red"
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
          >
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-border/80 bg-white hover:bg-warm-gray/20 transition-colors">
                <td className="p-3 font-extrabold text-text font-tabular-nums text-xs">
                  #{log.id}
                </td>
                <td className="p-3 text-xs text-text-2 font-medium">
                  <div>{log.created_at}</div>
                  <div className="text-[10px] text-text-3 font-mono">{log.ip_address || '127.0.0.1'}</div>
                </td>
                <td className="p-3 font-bold text-text text-sm">
                  <div>@{log.username}</div>
                  <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-extrabold uppercase tracking-wider text-slate-700">
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
                    Detail Log
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
