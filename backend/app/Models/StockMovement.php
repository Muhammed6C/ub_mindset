<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Historique des mouvements de stock (§5.3) — traçabilité §9.14.
 *
 * `user_id` n'est jamais mass-assignable : forcé côté serveur.
 */
class StockMovement extends Model
{
    use HasFactory;

    public const TYPE_IN = 'in';

    public const TYPE_OUT = 'out';

    public const TYPE_ADJUST = 'adjust';

    /**
     * @var array<int, string>
     */
    public const TYPES = [self::TYPE_IN, self::TYPE_OUT, self::TYPE_ADJUST];

    protected $fillable = [
        'product_variant_id',
        'type',
        'quantity',
        'reason',
        'reference',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
