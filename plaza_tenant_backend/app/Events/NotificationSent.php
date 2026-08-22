<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->notification->target_type === 'admin') {
            $channels[] = new Channel('admin-notifications');
        } else {
            if ($this->notification->id_user) {
                $channels[] = new Channel('tenant-notifications.' . $this->notification->id_user);
            }
            $channels[] = new Channel('tenant-notifications');
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id'          => $this->notification->id,
            'target_type' => $this->notification->target_type,
            'id_user'     => $this->notification->id_user,
            'title'       => $this->notification->title,
            'message'     => $this->notification->message,
            'type'        => $this->notification->type,
            'link'        => $this->notification->link,
            'is_read'     => (bool) $this->notification->is_read,
            'created_at'  => $this->notification->created_at ? (is_string($this->notification->created_at) ? $this->notification->created_at : $this->notification->created_at->toISOString()) : now()->toISOString(),
        ];
    }
}
