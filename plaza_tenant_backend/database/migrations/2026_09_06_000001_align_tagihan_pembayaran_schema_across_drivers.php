<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Membawa schema tagihan & pembayaran ke kondisi yang sama di MySQL maupun
 * SQLite, sehingga test suite (SQLite) memvalidasi schema yang sama dengan
 * produksi (MySQL).
 *
 * Latar belakang: migrasi 2026_08_07_000001 memakai SQL mentah khusus MySQL
 * di dalam try/catch kosong — di SQLite ia diam-diam tidak melakukan apa pun,
 * sehingga test masih menjalankan UNIQUE(Id_Sewa) / UNIQUE(Id_Tagihan) dan
 * enum lama (Metode_Bayar tanpa 'Tunai'/'Midtrans', Status_Tagihan tanpa
 * 'Dicicil') yang sudah tidak dipakai kode produksi.
 *
 * Operasi bersifat idempoten (probe dulu lewat Schema::getIndexes/getColumns).
 */
return new class extends Migration
{
    public function up(): void
    {
        $isSqlite = Schema::getConnection()->getDriverName() === 'sqlite';

        // 1. Cabut unique index lama, pasang index biasa (FIFO multi-tagihan & riwayat multi-pembayaran).
        $this->replaceUniqueWithNormalIndex('tagihan', 'Id_Sewa', 'idx_tagihan_id_sewa');
        $this->replaceUniqueWithNormalIndex('pembayaran', 'Id_Tagihan', 'idx_pembayaran_id_tagihan');

        // 2. Samakan enum dengan kode produksi.
        //    MySQL: hanya ALTER bila definisi saat ini berbeda (hindari MODIFY tabel di produksi tanpa perlu).
        //    SQLite: selalu jalankan change() (test database sekali pakai).
        if ($isSqlite || $this->columnTypeMissing('pembayaran', 'Metode_Bayar', ['Tunai', 'Midtrans'])) {
            Schema::table('pembayaran', function (Blueprint $table) {
                $table->enum('Metode_Bayar', ['Transfer', 'Tunai', 'Midtrans'])->change();
            });
        }

        if ($isSqlite || $this->columnTypeMissing('tagihan', 'Status_Tagihan', ['Dicicil'])) {
            Schema::table('tagihan', function (Blueprint $table) {
                $table->enum('Status_Tagihan', ['Lunas', 'Belum Bayar', 'Menunggu Verifikasi', 'Dicicil'])
                    ->nullable()
                    ->default('Belum Bayar')
                    ->change();
            });
        }
    }

    public function down(): void
    {
        // Sengaja tidak mengembalikan unique index / enum lama: kode produksi
        // sudah bergantung pada schema multi-tagihan & enum baru.
    }

    /**
     * Ganti unique index pada satu kolom dengan index biasa (portable).
     */
    private function replaceUniqueWithNormalIndex(string $table, string $column, string $indexName): void
    {
        $uniqueIndex = collect(Schema::getIndexes($table))->first(
            fn (array $index) => !($index['primary'] ?? false)
                && ($index['unique'] ?? false)
                && $index['columns'] === [$column]
        );

        if (!$uniqueIndex) {
            return;
        }

        Schema::table($table, function (Blueprint $t) use ($uniqueIndex, $column, $indexName) {
            $t->dropIndex($uniqueIndex['name']);
        });

        Schema::table($table, function (Blueprint $t) use ($column, $indexName) {
            $t->index($column, $indexName);
        });
    }

    /**
     * True bila tipe kolom enum tidak memuat salah satu nilai yang diharapkan.
     */
    private function columnTypeMissing(string $table, string $column, array $expectedValues): bool
    {
        $col = collect(Schema::getColumns($table))->firstWhere('name', $column);

        if (!$col) {
            return true;
        }

        $type = strtolower((string) ($col['type'] ?? $col['sql_type'] ?? ''));

        foreach ($expectedValues as $value) {
            if (!str_contains($type, strtolower($value))) {
                return true;
            }
        }

        return false;
    }
};
