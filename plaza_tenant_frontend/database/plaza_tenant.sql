-- ============================================================
-- ARSIP SQL DUMP LEGACY — PLAZA KEBUN SAYUR (24 JULI 2026)
--
-- PERHATIAN:
-- Skema database aktif saat ini dikelola secara modern via Laravel Migrations
-- & Seeders di direktori `plaza_tenant_backend/database/migrations`.
-- Untuk membangun database terbaru (ERD V6 - 11 Tabel & 252+ Tenant):
-- Jalankan: `php artisan migrate:fresh --seed` di folder `plaza_tenant_backend`.
-- File .sql ini hanya dipertahankan sebagai arsip historis pra-migrasi.
-- ============================================================

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 24, 2026 at 09:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;

--
-- Database: `plaza_tenant`
--
CREATE DATABASE IF NOT EXISTS `plaza_tenant` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `plaza_tenant`;

-- --------------------------------------------------------

--
-- Table structure for table `dokumen`
--

DROP TABLE IF EXISTS `dokumen`;

CREATE TABLE `dokumen` (
    `Id_Dokumen` int(11) NOT NULL,
    `Id_Pemilik` int(11) NOT NULL,
    `Id_Kios` int(11) NOT NULL,
    `Jenis_Dokumen` enum(
        'Sertifikat',
        'SP',
        'PPJB',
        'AJB'
    ) NOT NULL,
    `Nomor_Dokumen` varchar(100) DEFAULT NULL,
    `Tanggal` date DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Dumping data for table `dokumen`
--

INSERT INTO
    `dokumen` (
        `Id_Dokumen`,
        `Id_Pemilik`,
        `Id_Kios`,
        `Jenis_Dokumen`,
        `Nomor_Dokumen`,
        `Tanggal`
    )
VALUES (
        1,
        1,
        1,
        'Sertifikat',
        'DOC001',
        '2023-01-01'
    ),
    (
        2,
        2,
        2,
        'SP',
        'DOC002',
        '2023-01-01'
    ),
    (
        3,
        3,
        3,
        'PPJB',
        'DOC003',
        '2023-01-01'
    ),
    (
        4,
        4,
        4,
        'AJB',
        'DOC004',
        '2023-01-01'
    ),
    (
        5,
        5,
        5,
        'Sertifikat',
        'DOC005',
        '2023-01-01'
    ),
    (
        6,
        6,
        6,
        'SP',
        'DOC006',
        '2023-01-01'
    ),
    (
        7,
        7,
        7,
        'PPJB',
        'DOC007',
        '2023-01-01'
    ),
    (
        8,
        8,
        8,
        'AJB',
        'DOC008',
        '2023-01-01'
    ),
    (
        9,
        9,
        9,
        'Sertifikat',
        'DOC009',
        '2023-01-01'
    ),
    (
        10,
        10,
        10,
        'SP',
        'DOC010',
        '2023-01-01'
    ),
    (
        11,
        11,
        11,
        'PPJB',
        'DOC011',
        '2023-01-01'
    ),
    (
        12,
        12,
        12,
        'AJB',
        'DOC012',
        '2023-01-01'
    ),
    (
        13,
        13,
        13,
        'Sertifikat',
        'DOC013',
        '2023-01-01'
    ),
    (
        14,
        14,
        14,
        'SP',
        'DOC014',
        '2023-01-01'
    ),
    (
        15,
        15,
        15,
        'PPJB',
        'DOC015',
        '2023-01-01'
    ),
    (
        16,
        16,
        16,
        'AJB',
        'DOC016',
        '2023-01-01'
    ),
    (
        17,
        17,
        17,
        'Sertifikat',
        'DOC017',
        '2023-01-01'
    ),
    (
        18,
        18,
        18,
        'SP',
        'DOC018',
        '2023-01-01'
    ),
    (
        19,
        19,
        19,
        'PPJB',
        'DOC019',
        '2023-01-01'
    ),
    (
        20,
        20,
        20,
        'AJB',
        'DOC020',
        '2023-01-01'
    );

-- --------------------------------------------------------

--
-- Table structure for table `kios`
--

DROP TABLE IF EXISTS `kios`;

CREATE TABLE `kios` (
    `Id_Kios` int(11) NOT NULL,
    `No_Kios` varchar(10) NOT NULL,
    `Lantai` int(11) DEFAULT NULL,
    `Ukuran` varchar(20) DEFAULT NULL,
    `Status` enum('Terisi', 'Kosong') DEFAULT 'Kosong'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Dumping data for table `kios`
--

INSERT INTO
    `kios` (
        `Id_Kios`,
        `No_Kios`,
        `Lantai`,
        `Ukuran`,
        `Status`
    )
VALUES (
        1,
        'B-1001',
        1,
        '4x4 m',
        'Terisi'
    ),
    (
        2,
        'B-1002',
        1,
        '3x3 m',
        'Terisi'
    ),
    (
        3,
        'B-1003',
        1,
        '3x4 m',
        'Terisi'
    ),
    (
        4,
        'B-1004',
        1,
        '4x5 m',
        'Terisi'
    ),
    (
        5,
        'B-1005',
        1,
        '4x5 m',
        'Terisi'
    ),
    (
        6,
        'B-1006',
        1,
        '4x4 m',
        'Terisi'
    ),
    (
        7,
        'B-1007',
        1,
        '3x3 m',
        'Terisi'
    ),
    (
        8,
        'B-1008',
        1,
        '3x4 m',
        'Terisi'
    ),
    (
        9,
        'B-1009',
        1,
        '4x5 m',
        'Terisi'
    ),
    (
        10,
        'B-1010',
        1,
        '4x5 m',
        'Terisi'
    ),
    (
        11,
        'B-1011',
        1,
        '4x4 m',
        'Terisi'
    ),
    (
        12,
        'B-1012',
        1,
        '3x3 m',
        'Terisi'
    ),
    (
        13,
        'B-1013',
        1,
        '3x4 m',
        'Terisi'
    ),
    (
        14,
        'B-1014',
        1,
        '4x5 m',
        'Terisi'
    ),
    (
        15,
        'B-1015',
        1,
        '4x5 m',
        'Terisi'
    ),
    (
        16,
        'B-1016',
        1,
        '4x4 m',
        'Terisi'
    ),
    (
        17,
        'B-1017',
        1,
        '3x3 m',
        'Terisi'
    ),
    (
        18,
        'B-1018',
        1,
        '3x4 m',
        'Terisi'
    ),
    (
        19,
        'B-1019',
        1,
        '4x5 m',
        'Kosong'
    ),
    (
        20,
        'B-1020',
        1,
        '4x5 m',
        'Kosong'
    );

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--

DROP TABLE IF EXISTS `pembayaran`;

CREATE TABLE `pembayaran` (
    `Id_Pembayaran` int(11) NOT NULL,
    `Id_Tagihan` int(11) NOT NULL,
    `Tanggal_Bayar` date DEFAULT NULL,
    `Total_Bayar` decimal(12, 2) DEFAULT NULL,
    `Metode_Bayar` enum('Cash', 'Transfer') DEFAULT NULL,
    `Bukti_Pembayaran` varchar(255) DEFAULT NULL,
    `Verifikasi_Pembayaran` enum(
        'Menunggu',
        'Diterima',
        'Ditolak'
    ) DEFAULT 'Menunggu'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Dumping data for table `pembayaran`
--

INSERT INTO
    `pembayaran` (
        `Id_Pembayaran`,
        `Id_Tagihan`,
        `Tanggal_Bayar`,
        `Total_Bayar`,
        `Metode_Bayar`,
        `Bukti_Pembayaran`,
        `Verifikasi_Pembayaran`
    )
VALUES (
        1,
        1,
        '2025-04-05',
        500000.00,
        'Transfer',
        'bukti001.jpg',
        'Diterima'
    ),
    (
        2,
        2,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        3,
        3,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        4,
        4,
        '2025-04-07',
        700000.00,
        'Transfer',
        'bukti004.jpg',
        'Diterima'
    ),
    (
        5,
        5,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        6,
        6,
        '2025-04-06',
        550000.00,
        'Transfer',
        'bukti006.jpg',
        'Diterima'
    ),
    (
        7,
        7,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        8,
        8,
        '2025-04-08',
        700000.00,
        'Transfer',
        'bukti008.jpg',
        'Diterima'
    ),
    (
        9,
        9,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        10,
        10,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        11,
        11,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        12,
        12,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        13,
        13,
        '2025-04-09',
        500000.00,
        'Transfer',
        'bukti013.jpg',
        'Diterima'
    ),
    (
        14,
        14,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        15,
        15,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        16,
        16,
        '2025-04-10',
        700000.00,
        'Transfer',
        'bukti016.jpg',
        'Diterima'
    ),
    (
        17,
        17,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        18,
        18,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        19,
        19,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    ),
    (
        20,
        20,
        NULL,
        0.00,
        'Cash',
        '-',
        'Menunggu'
    );

-- --------------------------------------------------------

--
-- Table structure for table `pemilik`
--

DROP TABLE IF EXISTS `pemilik`;

CREATE TABLE `pemilik` (
    `Id_Pemilik` int(11) NOT NULL,
    `Id_User` int(11) NOT NULL,
    `Nama` varchar(50) NOT NULL,
    `No_Telepon` varchar(20) DEFAULT NULL,
    `No_KTP` char(16) DEFAULT NULL,
    `Alamat` text DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Dumping data for table `pemilik`
--

INSERT INTO
    `pemilik` (
        `Id_Pemilik`,
        `Id_User`,
        `Nama`,
        `No_Telepon`,
        `No_KTP`,
        `Alamat`
    )
VALUES (
        1,
        1,
        'Ahmad Rizki',
        '081234567801',
        '6471010101010001',
        'Jl. Adil Makmur No.01'
    ),
    (
        2,
        2,
        'Budi Santoso',
        '081234567802',
        '6471010101010002',
        'Jl. Adil Makmur No.02'
    ),
    (
        3,
        3,
        'Citra Lestari',
        '081234567803',
        '6471010101010003',
        'Jl. Adil Makmur No.03'
    ),
    (
        4,
        4,
        'Dedi Irawan',
        '081234567804',
        '6471010101010004',
        'Jl. Adil Makmur No.04'
    ),
    (
        5,
        5,
        'Eka Putri',
        '081234567805',
        '6471010101010005',
        'Jl. Adil Makmur No.05'
    ),
    (
        6,
        6,
        'Fajar Hadi',
        '081234567806',
        '6471010101010006',
        'Jl. Adil Makmur No.06'
    ),
    (
        7,
        7,
        'Gita Sari',
        '081234567807',
        '6471010101010007',
        'Jl. Adil Makmur No.07'
    ),
    (
        8,
        8,
        'Hendra Wijaya',
        '081234567808',
        '6471010101010008',
        'Jl. Adil Makmur No.08'
    ),
    (
        9,
        9,
        'Indah Permata',
        '081234567809',
        '6471010101010009',
        'Jl. Adil Makmur No.09'
    ),
    (
        10,
        10,
        'Joko Saputra',
        '081234567810',
        '6471010101010010',
        'Jl. Adil Makmur No.10'
    ),
    (
        11,
        11,
        'Karin Ayu',
        '081234567811',
        '6471010101010011',
        'Jl. Adil Makmur No.11'
    ),
    (
        12,
        12,
        'Lukman Hakim',
        '081234567812',
        '6471010101010012',
        'Jl. Adil Makmur No.12'
    ),
    (
        13,
        13,
        'Maya Sari',
        '081234567813',
        '6471010101010013',
        'Jl. Adil Makmur No.13'
    ),
    (
        14,
        14,
        'Nanda Putra',
        '081234567814',
        '6471010101010014',
        'Jl. Adil Makmur No.14'
    ),
    (
        15,
        15,
        'Oki Ramadhan',
        '081234567815',
        '6471010101010015',
        'Jl. Adil Makmur No.15'
    ),
    (
        16,
        16,
        'Putri Amelia',
        '081234567816',
        '6471010101010016',
        'Jl. Adil Makmur No.16'
    ),
    (
        17,
        17,
        'Rian Kurnia',
        '081234567817',
        '6471010101010017',
        'Jl. Adil Makmur No.17'
    ),
    (
        18,
        18,
        'Sinta Dewi',
        '081234567818',
        '6471010101010018',
        'Jl. Adil Makmur No.18'
    ),
    (
        19,
        19,
        'Taufik Hidayat',
        '081234567819',
        '6471010101010019',
        'Jl. Adil Makmur No.19'
    ),
    (
        20,
        20,
        'Vina Maharani',
        '081234567820',
        '6471010101010020',
        'Jl. Adil Makmur No.20'
    );

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
    `Id_roles` int(11) NOT NULL,
    `Nama_role` varchar(30) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO
    `roles` (`Id_roles`, `Nama_role`)
VALUES (1, 'Admin'),
    (2, 'Pemilik'),
    (3, 'Admin'),
    (4, 'Pemilik');

-- --------------------------------------------------------

--
-- Table structure for table `sewa`
--

DROP TABLE IF EXISTS `sewa`;

CREATE TABLE `sewa` (
    `Id_Sewa` int(11) NOT NULL,
    `Id_Pemilik` int(11) NOT NULL,
    `Id_Kios` int(11) NOT NULL,
    `Jenis_Usaha` varchar(100) DEFAULT NULL,
    `Tanggal_Mulai` date DEFAULT NULL,
    `Tanggal_Selesai` date DEFAULT NULL,
    `Keterangan` text DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Dumping data for table `sewa`
--

INSERT INTO
    `sewa` (
        `Id_Sewa`,
        `Id_Pemilik`,
        `Id_Kios`,
        `Jenis_Usaha`,
        `Tanggal_Mulai`,
        `Tanggal_Selesai`,
        `Keterangan`
    )
VALUES (
        1,
        1,
        1,
        'Kuliner',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        2,
        2,
        2,
        'Aksesoris',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        3,
        3,
        3,
        'Kelontong',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        4,
        4,
        4,
        'Fashion',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        5,
        5,
        5,
        'Kuliner',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        6,
        6,
        6,
        'Aksesoris',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        7,
        7,
        7,
        'Kelontong',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        8,
        8,
        8,
        'Fashion',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        9,
        9,
        9,
        'Kuliner',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        10,
        10,
        10,
        'Aksesoris',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        11,
        11,
        11,
        'Kelontong',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        12,
        12,
        12,
        'Fashion',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        13,
        13,
        13,
        'Kuliner',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        14,
        14,
        14,
        'Aksesoris',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        15,
        15,
        15,
        'Kelontong',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        16,
        16,
        16,
        'Fashion',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        17,
        17,
        17,
        'Kuliner',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        18,
        18,
        18,
        'Aksesoris',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        19,
        19,
        19,
        'Kelontong',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    ),
    (
        20,
        20,
        20,
        'Fashion',
        '2023-01-01',
        '2026-12-31',
        'Sewa aktif'
    );

-- --------------------------------------------------------

--
-- Table structure for table `tagihan`
--

DROP TABLE IF EXISTS `tagihan`;

CREATE TABLE `tagihan` (
    `Id_Tagihan` int(11) NOT NULL,
    `Id_Sewa` int(11) NOT NULL,
    `Periode` char(7) DEFAULT NULL,
    `Jatuh_Tempo` date DEFAULT NULL,
    `Tarif_Sewa` decimal(12, 2) DEFAULT NULL,
    `Hutang_Tunggakan` decimal(12, 2) DEFAULT 0.00,
    `Total_Tagihan` decimal(12, 2) DEFAULT NULL,
    `Status_Tagihan` enum(
        'Lunas',
        'Belum Bayar',
        'Menunggu Verifikasi'
    ) DEFAULT 'Belum Bayar'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Dumping data for table `tagihan`
--

INSERT INTO
    `tagihan` (
        `Id_Tagihan`,
        `Id_Sewa`,
        `Periode`,
        `Jatuh_Tempo`,
        `Tarif_Sewa`,
        `Hutang_Tunggakan`,
        `Total_Tagihan`,
        `Status_Tagihan`
    )
VALUES (
        1,
        1,
        '2025-04',
        '2025-04-10',
        500000.00,
        0.00,
        500000.00,
        'Belum Bayar'
    ),
    (
        2,
        2,
        '2025-04',
        '2025-04-10',
        500000.00,
        50000.00,
        550000.00,
        'Belum Bayar'
    ),
    (
        3,
        3,
        '2025-04',
        '2025-04-10',
        600000.00,
        0.00,
        600000.00,
        'Belum Bayar'
    ),
    (
        4,
        4,
        '2025-04',
        '2025-04-10',
        700000.00,
        0.00,
        700000.00,
        'Menunggu Verifikasi'
    ),
    (
        5,
        5,
        '2025-04',
        '2025-04-10',
        500000.00,
        100000.00,
        600000.00,
        'Belum Bayar'
    ),
    (
        6,
        6,
        '2025-04',
        '2025-04-10',
        550000.00,
        0.00,
        550000.00,
        'Lunas'
    ),
    (
        7,
        7,
        '2025-04',
        '2025-04-10',
        600000.00,
        0.00,
        600000.00,
        'Belum Bayar'
    ),
    (
        8,
        8,
        '2025-04',
        '2025-04-10',
        700000.00,
        0.00,
        700000.00,
        'Lunas'
    ),
    (
        9,
        9,
        '2025-04',
        '2025-04-10',
        500000.00,
        50000.00,
        550000.00,
        'Belum Bayar'
    ),
    (
        10,
        10,
        '2025-04',
        '2025-04-10',
        550000.00,
        0.00,
        550000.00,
        'Belum Bayar'
    ),
    (
        11,
        11,
        '2025-04',
        '2025-04-10',
        600000.00,
        0.00,
        600000.00,
        'Menunggu Verifikasi'
    ),
    (
        12,
        12,
        '2025-04',
        '2025-04-10',
        700000.00,
        0.00,
        700000.00,
        'Belum Bayar'
    ),
    (
        13,
        13,
        '2025-04',
        '2025-04-10',
        500000.00,
        0.00,
        500000.00,
        'Lunas'
    ),
    (
        14,
        14,
        '2025-04',
        '2025-04-10',
        550000.00,
        100000.00,
        650000.00,
        'Belum Bayar'
    ),
    (
        15,
        15,
        '2025-04',
        '2025-04-10',
        600000.00,
        0.00,
        600000.00,
        'Belum Bayar'
    ),
    (
        16,
        16,
        '2025-04',
        '2025-04-10',
        700000.00,
        0.00,
        700000.00,
        'Lunas'
    ),
    (
        17,
        17,
        '2025-04',
        '2025-04-10',
        500000.00,
        0.00,
        500000.00,
        'Belum Bayar'
    ),
    (
        18,
        18,
        '2025-04',
        '2025-04-10',
        550000.00,
        50000.00,
        600000.00,
        'Belum Bayar'
    ),
    (
        19,
        19,
        '2025-04',
        '2025-04-10',
        600000.00,
        0.00,
        600000.00,
        'Menunggu Verifikasi'
    ),
    (
        20,
        20,
        '2025-04',
        '2025-04-10',
        700000.00,
        0.00,
        700000.00,
        'Belum Bayar'
    );

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
    `Id_user` int(11) NOT NULL,
    `Id_roles` int(11) NOT NULL,
    `Username` varchar(50) NOT NULL,
    `Password` varchar(255) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO
    `user` (
        `Id_user`,
        `Id_roles`,
        `Username`,
        `Password`
    )
VALUES (1, 2, 'pemilik1', '123456'),
    (2, 2, 'pemilik2', '123456'),
    (3, 2, 'pemilik3', '123456'),
    (4, 2, 'pemilik4', '123456'),
    (5, 2, 'pemilik5', '123456'),
    (6, 2, 'pemilik6', '123456'),
    (7, 2, 'pemilik7', '123456'),
    (8, 2, 'pemilik8', '123456'),
    (9, 2, 'pemilik9', '123456'),
    (10, 2, 'pemilik10', '123456'),
    (11, 2, 'pemilik11', '123456'),
    (12, 2, 'pemilik12', '123456'),
    (13, 2, 'pemilik13', '123456'),
    (14, 2, 'pemilik14', '123456'),
    (15, 2, 'pemilik15', '123456'),
    (16, 2, 'pemilik16', '123456'),
    (17, 2, 'pemilik17', '123456'),
    (18, 2, 'pemilik18', '123456'),
    (19, 2, 'pemilik19', '123456'),
    (20, 2, 'pemilik20', '123456');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dokumen`
--
ALTER TABLE `dokumen`
ADD PRIMARY KEY (`Id_Dokumen`),
ADD KEY `Id_Pemilik` (`Id_Pemilik`),
ADD KEY `Id_Kios` (`Id_Kios`);

--
-- Indexes for table `kios`
--
ALTER TABLE `kios`
ADD PRIMARY KEY (`Id_Kios`),
ADD UNIQUE KEY `No_Kios` (`No_Kios`);

--
-- Indexes for table `pembayaran`
--
ALTER TABLE `pembayaran`
ADD PRIMARY KEY (`Id_Pembayaran`),
ADD UNIQUE KEY `Id_Tagihan` (`Id_Tagihan`);

--
-- Indexes for table `pemilik`
--
ALTER TABLE `pemilik`
ADD PRIMARY KEY (`Id_Pemilik`),
ADD UNIQUE KEY `Id_User` (`Id_User`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles` ADD PRIMARY KEY (`Id_roles`);

--
-- Indexes for table `sewa`
--
ALTER TABLE `sewa`
ADD PRIMARY KEY (`Id_Sewa`),
ADD KEY `Id_Pemilik` (`Id_Pemilik`),
ADD KEY `Id_Kios` (`Id_Kios`);

--
-- Indexes for table `tagihan`
--
ALTER TABLE `tagihan`
ADD PRIMARY KEY (`Id_Tagihan`),
ADD UNIQUE KEY `Id_Sewa` (`Id_Sewa`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
ADD PRIMARY KEY (`Id_user`),
ADD UNIQUE KEY `Username` (`Username`),
ADD KEY `Id_roles` (`Id_roles`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dokumen`
--
ALTER TABLE `dokumen`
MODIFY `Id_Dokumen` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 21;

--
-- AUTO_INCREMENT for table `kios`
--
ALTER TABLE `kios`
MODIFY `Id_Kios` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 21;

--
-- AUTO_INCREMENT for table `pembayaran`
--
ALTER TABLE `pembayaran`
MODIFY `Id_Pembayaran` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 21;

--
-- AUTO_INCREMENT for table `pemilik`
--
ALTER TABLE `pemilik`
MODIFY `Id_Pemilik` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 21;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
MODIFY `Id_roles` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 5;

--
-- AUTO_INCREMENT for table `sewa`
--
ALTER TABLE `sewa`
MODIFY `Id_Sewa` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 21;

--
-- AUTO_INCREMENT for table `tagihan`
--
ALTER TABLE `tagihan`
MODIFY `Id_Tagihan` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 21;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
MODIFY `Id_user` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 61;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `dokumen`
--
ALTER TABLE `dokumen`
ADD CONSTRAINT `dokumen_ibfk_1` FOREIGN KEY (`Id_Pemilik`) REFERENCES `pemilik` (`Id_Pemilik`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `dokumen_ibfk_2` FOREIGN KEY (`Id_Kios`) REFERENCES `kios` (`Id_Kios`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pembayaran`
--
ALTER TABLE `pembayaran`
ADD CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`Id_Tagihan`) REFERENCES `tagihan` (`Id_Tagihan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pemilik`
--
ALTER TABLE `pemilik`
ADD CONSTRAINT `pemilik_ibfk_1` FOREIGN KEY (`Id_User`) REFERENCES `user` (`Id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sewa`
--
ALTER TABLE `sewa`
ADD CONSTRAINT `sewa_ibfk_1` FOREIGN KEY (`Id_Pemilik`) REFERENCES `pemilik` (`Id_Pemilik`) ON UPDATE CASCADE,
ADD CONSTRAINT `sewa_ibfk_2` FOREIGN KEY (`Id_Kios`) REFERENCES `kios` (`Id_Kios`) ON UPDATE CASCADE;

--
-- Constraints for table `tagihan`
--
ALTER TABLE `tagihan`
ADD CONSTRAINT `tagihan_ibfk_1` FOREIGN KEY (`Id_Sewa`) REFERENCES `sewa` (`Id_Sewa`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`Id_roles`) REFERENCES `roles` (`Id_roles`) ON UPDATE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;