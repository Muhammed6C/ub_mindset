<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Bibliothèque d'uploads centralisée (§5.3).
 *
 * `created_by` n'est jamais mass-assignable : il est forcé côté serveur (§9.4).
 */
class Media extends Model
{
    use HasFactory;

    /**
     * Table explicite (le pluriel de « media » est ambigu).
     */
    protected $table = 'media';

    protected $fillable = [
        'disk',
        'path',
        'mime',
        'size',
        'width',
        'height',
        'is_public',
    ];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'is_public' => 'boolean',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function productImages(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function isImage(): bool
    {
        return str_starts_with((string) $this->mime, 'image/');
    }
}
