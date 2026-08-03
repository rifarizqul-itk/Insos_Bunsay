<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Mengubah ENUM di tabel pembayaran dan tagihan agar sesuai ERD v4 final:
 * - pembayaran.Metode_Bayar: ['Cash','Transfer'] → ['Transfer','Tunai','Midtrans']
 * - tagihan.Status_Tagihan: tambahkan nilai 'Dicicil'
 *
 * Catatan: Laravel Schema Builder tidak bisa alter ENUM secara portabel,
 * jadi kita pakai DB::statement dengan raw SQL MySQL.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ⚠️ URUTAN PENTING: UPDATE dulu sebelum ALTER.
        // MySQL akan error jika ENUM diubah saat masih ada data dengan nilai lama.

        // 1. Ganti data 'Cash' → 'Tunai' SEBELUM alter ENUM
        DB::statement("UPDATE pembayaran SET Metode_Bayar = 'Tunai' WHERE Metode_Bayar = 'Cash'");

        // 2. Baru alter ENUM Metode_Bayar — sekarang aman karena tidak ada 'Cash' lagi
        DB::statement("ALTER TABLE pembayaran MODIFY COLUMN Metode_Bayar ENUM('Transfer','Tunai','Midtrans') NOT NULL");

        // 3. Tambah 'Dicicil' ke ENUM Status_Tagihan di tabel tagihan
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Status_Tagihan ENUM('Lunas','Belum Bayar','Menunggu Verifikasi','Dicicil') NULL DEFAULT 'Belum Bayar'");
    }

    public function down(): void
    {
        // Rollback: kembalikan ke nilai awal
        DB::statement("UPDATE pembayaran SET Metode_Bayar = 'Transfer' WHERE Metode_Bayar = 'Midtrans'");
        DB::statement("UPDATE pembayaran SET Metode_Bayar = 'Cash' WHERE Metode_Bayar = 'Tunai'");
        DB::statement("ALTER TABLE pembayaran MODIFY COLUMN Metode_Bayar ENUM('Cash','Transfer') NOT NULL");
        DB::statement("UPDATE tagihan SET Status_Tagihan = 'Belum Bayar' WHERE Status_Tagihan = 'Dicicil'");
        DB::statement("ALTER TABLE tagihan MODIFY COLUMN Status_Tagihan ENUM('Lunas','Belum Bayar','Menunggu Verifikasi') NULL DEFAULT 'Belum Bayar'");
    }
};
