<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Cabut Foreign Key dan Unique Index 'id_sewa' pada tabel tagihan, lalu pasang kembali Foreign Key dengan Normal Index
        try {
            DB::statement("ALTER TABLE tagihan DROP FOREIGN KEY tagihan_ibfk_1");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE tagihan DROP INDEX id_sewa");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE tagihan DROP INDEX tagihan_id_sewa_unique");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE tagihan ADD INDEX idx_id_sewa (Id_Sewa)");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE tagihan ADD CONSTRAINT tagihan_ibfk_1 FOREIGN KEY (Id_Sewa) REFERENCES sewa(Id_Sewa) ON UPDATE CASCADE ON DELETE CASCADE");
        } catch (\Throwable $e) {}

        // 2. Cabut Foreign Key dan Unique Index 'id_tagihan' pada tabel pembayaran, lalu pasang kembali Foreign Key dengan Normal Index
        try {
            DB::statement("ALTER TABLE pembayaran DROP FOREIGN KEY pembayaran_ibfk_1");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE pembayaran DROP INDEX id_tagihan");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE pembayaran DROP INDEX pembayaran_id_tagihan_unique");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE pembayaran ADD INDEX idx_id_tagihan (Id_Tagihan)");
        } catch (\Throwable $e) {}

        try {
            DB::statement("ALTER TABLE pembayaran ADD CONSTRAINT pembayaran_ibfk_1 FOREIGN KEY (Id_Tagihan) REFERENCES tagihan(Id_Tagihan) ON UPDATE CASCADE ON DELETE CASCADE");
        } catch (\Throwable $e) {}

        // 3. Ubah kolom Bukti_Pembayaran di database menjadi LONGTEXT agar dapat menyimpan Base64 foto bukti transfer
        try {
            DB::statement("ALTER TABLE pembayaran MODIFY COLUMN Bukti_Pembayaran LONGTEXT NULL");
        } catch (\Throwable $e) {}
    }

    public function down(): void
    {
        // Rollback opsional
    }
};
