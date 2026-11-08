<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalMedia extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'journal_media';

    protected $fillable = [
        'check_in_id',
        'file_path',
        'media_type',
        'file_size_kb',
        'caption',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'file_size_kb' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function checkIn(): BelongsTo
    {
        return $this->belongsTo(CheckIn::class);
    }

    /**
     * Get the full public URL from Supabase Storage.
     */
    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://')) {
            return $this->file_path;
        }

        $supabaseUrl = rtrim(config('services.supabase.url', 'https://nruydgxivzixylaxoced.supabase.co'), '/');
        $bucket = config('services.supabase.bucket', 'destinations');

        return "{$supabaseUrl}/storage/v1/object/public/{$bucket}/" . ltrim($this->file_path, '/');
    }
}

