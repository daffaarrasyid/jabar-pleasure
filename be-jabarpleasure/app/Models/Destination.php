<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Destination extends Model
{
    use HasFactory;

    protected $table = 'destinations';

    protected $fillable = [
        'regency_id',
        'category_id',
        'osm_id',
        'osm_type',
        'kategori_osm',
        'sub_kategori_osm',
        'tag_tambahan',
        'name',
        'slug',
        'description',
        'address',
        'postal_code',
        'elevation',
        'price_range',
        'opening_hours',
        'website',
        'phone',
        'wheelchair',
        'wikidata_id',
        'operator_name',
        'facilities',
        'cover_image',
        'location',
    ];

    protected $casts = [
        'facilities' => 'array',
        'elevation' => 'float',
    ];

    protected $appends = [
        'cover_image_url',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function regency(): BelongsTo
    {
        return $this->belongsTo(RegencyCity::class, 'regency_id');
    }

    /**
     * Get computed cover image URL from Supabase or default.
     */
    public function getCoverImageUrlAttribute(): ?string
    {
        if (empty($this->cover_image)) {
            return null;
        }

        if (str_starts_with($this->cover_image, 'http://') || str_starts_with($this->cover_image, 'https://')) {
            return $this->cover_image;
        }

        $supabaseUrl = rtrim(config('services.supabase.url', 'https://nruydgxivzixylaxoced.supabase.co'), '/');
        $bucket = config('services.supabase.bucket', 'destinations');

        return "{$supabaseUrl}/storage/v1/object/public/{$bucket}/" . ltrim($this->cover_image, '/');
    }

    /**
     * Scope query to select latitude and longitude from PostGIS Point.
     */
    public function scopeWithCoordinates(Builder $query): Builder
    {
        return $query->addSelect([
            'destinations.*',
            DB::raw('ST_Y(location::geometry) as latitude'),
            DB::raw('ST_X(location::geometry) as longitude'),
        ]);
    }

    /**
     * Scope query to search by name or address.
     */
    public function scopeSearch(Builder $query, ?string $keyword): Builder
    {
        if (empty($keyword)) {
            return $query;
        }

        return $query->where(function ($q) use ($keyword) {
            $q->where('destinations.name', 'ILIKE', "%{$keyword}%")
              ->orWhere('destinations.address', 'ILIKE', "%{$keyword}%");
        });
    }

    /**
     * Scope query by category slug or id.
     */
    public function scopeFilterCategory(Builder $query, ?string $category): Builder
    {
        if (empty($category) || strtolower($category) === 'semua') {
            return $query;
        }

        return $query->whereHas('category', function ($q) use ($category) {
            $q->where('slug', $category)->orWhere('name', 'ILIKE', $category);
        });
    }

    /**
     * Scope query to destinations within radius in KM from user coordinates.
     */
    public function scopeNearby(Builder $query, float $latitude, float $longitude, float $radiusKm = 5.0): Builder
    {
        // SRID 4326 uses geography for meter distance
        $radiusMeters = $radiusKm * 1000;

        return $query
            ->whereRaw(
                "ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)",
                [$longitude, $latitude, $radiusMeters]
            )
            ->selectRaw(
                "ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance_meters",
                [$longitude, $latitude]
            )
            ->orderBy('distance_meters', 'asc');
    }
}

