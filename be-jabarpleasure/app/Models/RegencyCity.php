<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegencyCity extends Model
{
    use HasFactory;

    protected $table = 'regencies_cities';

    protected $fillable = [
        'name',
        'alt_name',
        'geom',
    ];

    public function destinations(): HasMany
    {
        return $this->hasMany(Destination::class, 'regency_id');
    }
}

