<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
    protected $table = 'notifications';
    public $timestamps = false;
    protected $guarded = [];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];

    /**
     * Send notification to a specific tenant or to all admin staff.
     */
    public static function send(string $targetType, ?int $idUser, string $title, string $message, string $type = 'info', ?string $link = null): self
    {
        return self::create([
            'target_type' => $targetType,
            'id_user'     => $idUser,
            'title'       => $title,
            'message'     => $message,
            'type'        => $type,
            'is_read'     => false,
            'link'        => $link,
            'created_at'  => now(),
        ]);
    }
}
