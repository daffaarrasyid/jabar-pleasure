<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckIn extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'destination_id',
        'itinerary_id',
        'check_in_coord',
        'distance_deviation',
        'checked_in_at',
        'is_synced_from_offline',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'distance_deviation' => 'float',
            'checked_in_at' => 'datetime',
            'is_synced_from_offline' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function itinerary(): BelongsTo
    {
        return $this->belongsTo(Itinerary::class);
    }
}

