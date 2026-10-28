<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'categories';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'icon_url',
    ];

    /**
     * Users who selected this category preference.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_preferences', 'category_id', 'user_id')
            ->withPivot('created_at');
    }

    /**
     * Preference records associated with this category.
     */
    public function preferences(): HasMany
    {
        return $this->hasMany(UserPreference::class);
    }
}

