<?php

namespace App\Services;

use RuntimeException;

/**
 * Thrown when submitted payment evidence cannot be accepted.
 * Controllers catch this and convert it into an HTTP 422 response.
 */
class BuktiImageException extends RuntimeException
{
    public const MESSAGE_INVALID = 'Bukti pembayaran tidak valid. Gunakan berkas gambar JPG, JPEG, PNG, atau WEBP maksimal 5MB.';
    public const MESSAGE_TOO_LARGE = 'Ukuran bukti pembayaran melebihi 5MB. Kompres atau pilih berkas yang lebih kecil.';

    public static function invalid(?string $message = null): self
    {
        return new self($message ?? self::MESSAGE_INVALID);
    }

    public static function tooLarge(): self
    {
        return new self(self::MESSAGE_TOO_LARGE);
    }
}
