<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle Réglages — Configuration dynamique du site (§5.3 / §12 Lot A3).
 *
 * DevSecOps :
 * - $fillable explicite (anti mass-assignment) ;
 * - value castée en array JSON ;
 * - scope public pour ne jamais exposer les clés internes sensibles ;
 * - whitelist des clés reconnues pour empêcher la pollution de configuration.
 */
class Setting extends Model
{
    use HasFactory;

    /**
     * Clés de réglages autorisées dans l'application.
     */
    public const ALLOWED_KEYS = [
        'general' => [
            'store_name',
            'contact_email',
            'contact_phone',
            'whatsapp_number',
            'address',
            'default_currency',
            'social_links',
        ],
        'shipping' => [
            'default_shipping_cost',
            'free_shipping_threshold',
            'estimated_delivery_delay',
        ],
        'seo' => [
            'meta_title',
            'meta_description',
            'keywords',
            'og_image_url',
        ],
    ];

    /**
     * Clés autorisées à être exposées publiquement via l'API.
     */
    public const PUBLIC_KEYS = [
        'store_name',
        'contact_email',
        'contact_phone',
        'whatsapp_number',
        'address',
        'default_currency',
        'social_links',
        'default_shipping_cost',
        'free_shipping_threshold',
        'estimated_delivery_delay',
        'meta_title',
        'meta_description',
        'og_image_url',
    ];

    protected $fillable = [
        'key',
        'value',
        'is_public',
        'description',
    ];

    protected $casts = [
        'value' => 'array',
        'is_public' => 'boolean',
    ];

    public function scopePublicOnly($query)
    {
        return $query->where('is_public', true);
    }

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::query()->where('key', $key)->first();

        return $setting ? $setting->value : $default;
    }
}
