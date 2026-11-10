<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    /**
     * User recipient relation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope query to unread notifications.
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope query ordered by newest first.
     */
    public function scopeRecent(Builder $query): Builder
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(): bool
    {
        return $this->update(['read_at' => now()]);
    }
}

