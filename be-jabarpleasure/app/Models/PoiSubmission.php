<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class PoiSubmission extends Model
{
    use HasFactory;

    protected $table = 'poi_submissions';

    protected $fillable = [
        'user_id',
        'category_id',
        'regency_id',
        'name',
        'description',
        'price_range',
        'opening_hours',
        'proposed_location',
        'evidence_image',
        'status',
        'admin_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function regency(): BelongsTo
    {
        return $this->belongsTo(RegencyCity::class, 'regency_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope query to select latitude and longitude from PostGIS Point.
     */
    public function scopeWithCoordinates(Builder $query): Builder
    {
        return $query->addSelect([
            'poi_submissions.*',
            DB::raw('ST_Y(proposed_location::geometry) as latitude'),
            DB::raw('ST_X(proposed_location::geometry) as longitude'),
        ]);
    }
}

