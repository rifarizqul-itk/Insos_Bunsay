<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Menambahkan index performa berdasarkan pola query nyata di codebase.
 *
 * Hanya 4 index — dipilih ketat berdasarkan:
 *   1. Frekuensi kolom muncul di WHERE/JOIN pada controller
 *   2. Kardinalitas tinggi agar index efektif dipakai optimizer MySQL
 *   3. Tabel yang tumbuh besar: tagihan, pembayaran, activity_logs, notifications
 *
 * Yang TIDAK diindex (sengaja):
 *   - kios.Status         → hanya 2 nilai ('Kosong'/'Terisi'), Full Scan lebih cepat
 *   - sewa.Status         → hanya 2 nilai, sama
 *   - users.sub_role      → 3-4 nilai, low cardinality
 *   - pemilik.Status_Pemilik → tidak ada filter WHERE langsung di controller
 */
return new class extends Migration
{
    public function up(): void
    {
        // INDEX 1: Composite (Id_Sewa, Status_Tagihan) — tabel tagihan
        // Covers: TagihanController@tenantTagihan & DashboardController@tenantDashboard
        // WHERE Id_Sewa=X AND Status_Tagihan='Belum Bayar'
        // Composite karena Status_Tagihan sendiri (4 nilai) akan di-skip optimizer.
        Schema::table('tagihan', function (Blueprint $table) {
            if (!$this->indexExists('tagihan', 'idx_tagihan_sewa_status')) {
                $table->index(['Id_Sewa', 'Status_Tagihan'], 'idx_tagihan_sewa_status');
            }
        });

        // INDEX 2: Tanggal_Bayar — tabel pembayaran
        // Covers: DashboardController "whereDate('Tanggal_Bayar', today())"
        //         dan ekspor laporan range bulan/tahun di PembayaranController
        // High cardinality (date field) → index sangat efektif.
        Schema::table('pembayaran', function (Blueprint $table) {
            if (!$this->indexExists('pembayaran', 'idx_pembayaran_tanggal')) {
                $table->index('Tanggal_Bayar', 'idx_pembayaran_tanggal');
            }
        });

        // INDEX 3: created_at — tabel activity_logs
        // Covers: ActivityLogController "->latest()->get()" dan filter tanggal audit
        // Tabel append-only (tidak pernah UPDATE), tumbuh setiap aksi admin.
        Schema::table('activity_logs', function (Blueprint $table) {
            if (!$this->indexExists('activity_logs', 'idx_log_created')) {
                $table->index('created_at', 'idx_log_created');
            }
        });

        // INDEX 4: Composite (id_user, is_read) — tabel notifications
        // Covers: NotificationController "WHERE id_user=X AND is_read=0"
        // Composite memungkinkan index-only scan tanpa menyentuh disk row data.
        Schema::table('notifications', function (Blueprint $table) {
            if (!$this->indexExists('notifications', 'idx_notif_user_read')) {
                $table->index(['id_user', 'is_read'], 'idx_notif_user_read');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tagihan', fn(Blueprint $t) => $t->dropIndex('idx_tagihan_sewa_status'));
        Schema::table('pembayaran', fn(Blueprint $t) => $t->dropIndex('idx_pembayaran_tanggal'));
        Schema::table('activity_logs', fn(Blueprint $t) => $t->dropIndex('idx_log_created'));
        Schema::table('notifications', fn(Blueprint $t) => $t->dropIndex('idx_notif_user_read'));
    }

    private function indexExists(string $table, string $indexName): bool
    {
        if (DB::getDriverName() === 'mysql') {
            return !empty(DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$indexName]));
        }
        return false;
    }
};
