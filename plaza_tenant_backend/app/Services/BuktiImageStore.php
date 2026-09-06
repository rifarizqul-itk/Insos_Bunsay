<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Single owner for persisting payment evidence (bukti) images.
 *
 * Accepts three mutually-exclusive sources, in priority order:
 *  1. Multipart UploadedFile (whitelisted image extensions)
 *  2. Base64 data URI string "data:image/<ext>;base64,..." (≤ 5 MB decoded)
 *  3. Raw path/reference string stored as-is
 *
 * Rejections are explicit: invalid or oversized evidence throws
 * BuktiImageException, which controllers surface as HTTP 422.
 */
class BuktiImageStore
{
    public const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
    public const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

    /** Directory relative to the public disk root. */
    private const DIR = 'storage/bukti';

    /**
     * Persist the evidence and return the stored path, or null when no
     * evidence was provided. Throws BuktiImageException on invalid input.
     *
     * $prefix names the file family, e.g. 'bukti' or 'sanggahan'.
     */
    public function store($source, string $prefix = 'bukti'): ?string
    {
        if ($source instanceof UploadedFile) {
            if (!$source->isValid()) {
                throw BuktiImageException::invalid();
            }

            $ext = strtolower($source->getClientOriginalExtension() ?: '');
            if (!in_array($ext, self::ALLOWED_EXTENSIONS, true)) {
                throw BuktiImageException::invalid(
                    'Format bukti tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.'
                );
            }

            if ($source->getSize() > self::MAX_BYTES) {
                throw BuktiImageException::tooLarge();
            }

            $moved = $source->move($this->ensureDir(), $this->filename($prefix, $ext));

            return str_replace(['\\', public_path() . DIRECTORY_SEPARATOR], ['/', ''], $moved->getPathname());
        }

        if (is_string($source) && str_starts_with($source, 'data:image/')) {
            if (!preg_match('/^data:image\/(?<type>[a-zA-Z0-9_-]+);base64,(?<data>.+)$/', $source, $m)) {
                throw BuktiImageException::invalid('Format data URI bukti tidak valid.');
            }

            $rawType = strtolower($m['type'] ?? 'png');
            if (!in_array($rawType, self::ALLOWED_EXTENSIONS, true)) {
                throw BuktiImageException::invalid(
                    'Format bukti tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.'
                );
            }
            $ext = $rawType === 'jpeg' ? 'jpg' : $rawType;

            $imageData = base64_decode($m['data'], true);
            if ($imageData === false || $imageData === '') {
                throw BuktiImageException::invalid('Isi bukti base64 tidak dapat dibaca.');
            }
            if (strlen($imageData) > self::MAX_BYTES) {
                throw BuktiImageException::tooLarge();
            }

            $path = $this->ensureDir() . DIRECTORY_SEPARATOR . $this->filename($prefix, $ext);
            if (file_put_contents($path, $imageData) === false) {
                throw BuktiImageException::invalid('Gagal menyimpan berkas bukti.');
            }

            return str_replace(['\\', public_path() . DIRECTORY_SEPARATOR], ['/', ''], $path);
        }

        if (is_string($source)) {
            return $source !== '' ? $source : null;
        }

        return null;
    }

    private function filename(string $prefix, string $ext): string
    {
        return $prefix . '_' . time() . '_' . Str::random(6) . '.' . $ext;
    }

    private function ensureDir(): string
    {
        $dir = public_path(self::DIR);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        return $dir;
    }
}
