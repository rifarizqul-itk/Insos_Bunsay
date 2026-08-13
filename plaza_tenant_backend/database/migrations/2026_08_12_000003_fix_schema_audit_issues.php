<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Migrasi perbaikan dari hasil schema audit 2026-08-12.
 *
 * Fix A1: Perbaiki presisi DECIMAL di 5 kolom keuangan.
 *   - Sebelum: DECIMAL(12)   → presisi 0 desimal (tidak bisa simpan Rp 500.500,50)
 *   - Sesudah: DECIMAL(15,2) → presisi 2 desimal, nilai maks Rp 9.999.999.999.999,99
 *   - Data yang sudah ada TIDAK terpengaruh (MySQL expand, bukan truncate).
 *
 * Fix A2: Ubah FK dokumen.Id_Kios dari CASCADE DELETE ke RESTRICT.
 *   - Sebelum: Jika kios dihapus, dokumen legal (PPJB, AJB, Sertifikat) ikut terhapus.
 *   - Sesudah: Kios tidak bisa dihapus jika masih ada dokumen yang terikat.
 *   - Audit trail dokumen legal terlindungi.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ============================================================
        // FIX A1: Perbaiki presisi DECIMAL di tabel tagihan
        // ============================================================
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Tarif_Sewa DECIMAL(15, 2) NULL");
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Hutang_Tunggakan DECIMAL(15, 2) NULL DEFAULT 0.00");
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Total_Tagihan DECIMAL(15, 2) NULL");
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Sisa_Tagihan DECIMAL(15, 2) NULL COMMENT 'Sisa hutang setelah pembayaran parsial. NULL = belum diinisialisasi (sama dengan Total_Tagihan)'");

        // ============================================================
        // FIX A1: Perbaiki presisi DECIMAL di tabel pembayaran
        // ============================================================
        DB::statement("ALTER TABLE pembayaran MODIFY COLUMN Total_Bayar DECIMAL(15, 2) NULL");

        // ============================================================
        // FIX A2: Ubah FK dokumen.Id_Kios dari CASCADE ke RESTRICT
        // Dokumen legal TIDAK boleh ikut terhapus jika kios dihapus.
        // ============================================================
        try {
            // Drop FK lama dulu
            DB::statement("ALTER TABLE dokumen DROP FOREIGN KEY dokumen_ibfk_2");
        } catch (\Throwable $e) {
            // FK mungkin sudah tidak ada, lanjutkan
        }

        // Pasang FK baru dengan ON DELETE RESTRICT
        DB::statement("
            ALTER TABLE dokumen
            ADD CONSTRAINT dokumen_ibfk_2
            FOREIGN KEY (Id_Kios) REFERENCES kios(Id_Kios)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
        ");
    }

    public function down(): void
    {
        // Rollback: kembalikan ke DECIMAL(12) tanpa presisi
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Tarif_Sewa DECIMAL(12) NULL");
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Hutang_Tunggakan DECIMAL(12) NULL DEFAULT 0");
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Total_Tagihan DECIMAL(12) NULL");
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Sisa_Tagihan DECIMAL(12, 2) NULL");
        DB::statement("ALTER TABLE pembayaran MODIFY COLUMN Total_Bayar DECIMAL(12) NULL");

        // Rollback: kembalikan FK ke CASCADE
        try {
            DB::statement("ALTER TABLE dokumen DROP FOREIGN KEY dokumen_ibfk_2");
        } catch (\Throwable $e) {}

        DB::statement("
            ALTER TABLE dokumen
            ADD CONSTRAINT dokumen_ibfk_2
            FOREIGN KEY (Id_Kios) REFERENCES kios(Id_Kios)
            ON UPDATE CASCADE
            ON DELETE CASCADE
        ");
    }
};
