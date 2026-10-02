<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Promotion;
use App\Models\Setting;
use App\Models\ShippingZone;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

/**
 * Logique métier de création de commande (§9.4 — jamais de confiance au client).
 *
 * Le client ne fournit que des `variant_id` + `quantity` : les prix, le
 * sous-total, les frais de port, le total et le stock sont TOUS calculés et
 * vérifiés côté serveur, sous transaction et verrou pessimiste.
 */
class CatalogOrderService
{
    private const MAX_TOTAL_QUANTITY_PER_LINE = 20;

    private const FREE_SHIPPING_THRESHOLD = 50000.0;

    private const STANDARD_SHIPPING_COST = 3000.0;

    /**
     * @param  array{name: string, email: string, phone: string, address: string, city: string, shipping_zone_id?: int|null, payment_method?: string|null, notes?: string|null}  $customer
     * @param  array<int, array{variant_id: int|string, quantity: int|string}>  $items
     */
    public function create(
        array $customer,
        array $items,
        ?User $user = null,
        ?string $promoCode = null,
        ?string $notes = null
    ): Order {
        // 1. Agrégation par variante : neutralise la duplication d'une même ligne.
        $quantities = [];
        foreach ($items as $item) {
            $variantId = (int) $item['variant_id'];
            $quantities[$variantId] = min(
                self::MAX_TOTAL_QUANTITY_PER_LINE,
                ($quantities[$variantId] ?? 0) + (int) $item['quantity']
            );
        }

        return DB::transaction(function () use ($customer, $quantities, $user, $promoCode, $notes) {
            // 2. Verrou pessimiste : empêche la course au stock (oversell).
            $variants = ProductVariant::query()
                ->whereIn('id', array_keys($quantities))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // 3. Aucune variante inconnue tolérée.
            if (count($variants) !== count($quantities)) {
                throw ValidationException::withMessages([
                    'items' => 'Un ou plusieurs articles ne sont plus disponibles.',
                ]);
            }

            $subtotal = 0.0;
            $lines = [];

            foreach ($quantities as $variantId => $quantity) {
                /** @var ProductVariant $variant */
                $variant = $variants->get($variantId);
                $product = $variant->product;

                // 4. Produit actif obligatoire.
                if (! $product instanceof Product || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => 'Un ou plusieurs articles ne sont plus disponibles.',
                    ]);
                }

                // 5. Stock suffisant (vérifié sous verrou).
                if ((int) $variant->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Stock insuffisant pour « {$product->name} ».",
                    ]);
                }

                // 6. Prix serveur : jamais celui envoyé par le client.
                $unitPrice = (float) $variant->price;
                $lineTotal = round($unitPrice * $quantity, 2);
                $subtotal += $lineTotal;

                $lines[] = [$variant, $product, $quantity, $unitPrice, $lineTotal];
            }

            $subtotal = round($subtotal, 2);

            // 7. Calcul dynamique des frais de port
            $shippingZoneId = null;
            if (! empty($customer['shipping_zone_id'])) {
                /** @var ShippingZone|null $zone */
                $zone = ShippingZone::query()->where('is_active', true)->find($customer['shipping_zone_id']);
                if (! $zone) {
                    throw ValidationException::withMessages([
                        'customer.shipping_zone_id' => 'La zone de livraison sélectionnée n\'est pas disponible.',
                    ]);
                }
                $shippingZoneId = $zone->id;
                $shipping = $zone->calculateShippingCost($subtotal);
            } else {
                $rawThreshold = Setting::getValue('free_shipping_threshold', self::FREE_SHIPPING_THRESHOLD);
                $freeThreshold = is_numeric($rawThreshold) ? (float) $rawThreshold : self::FREE_SHIPPING_THRESHOLD;

                $rawCost = Setting::getValue('default_shipping_cost', self::STANDARD_SHIPPING_COST);
                $defaultCost = is_numeric($rawCost) ? (float) $rawCost : self::STANDARD_SHIPPING_COST;

                $shipping = ($freeThreshold > 0 && $subtotal >= $freeThreshold) ? 0.0 : $defaultCost;
            }

            // 8. Calcul de la réduction (code promo) sous verrou
            $discount = 0.0;
            $promotionId = null;
            $codeCandidate = $promoCode ?? $customer['promo_code'] ?? null;
            if (! empty($codeCandidate)) {
                $normalizedCode = strtoupper(trim((string) $codeCandidate));
                /** @var Promotion|null $promotion */
                $promotion = Promotion::query()
                    ->where('code', $normalizedCode)
                    ->lockForUpdate()
                    ->first();

                if (! $promotion || ! $promotion->isValidForAmount($subtotal)) {
                    throw ValidationException::withMessages([
                        'promo_code' => 'Le code promotionnel est invalide, expiré ou les conditions ne sont pas remplies.',
                    ]);
                }

                $discount = $promotion->calculateDiscount($subtotal);
                $promotionId = $promotion->id;
                $promotion->increment('used_count');
            }

            $total = round(max(0.0, $subtotal - $discount + $shipping), 2);

            // 9. Création de la commande : champs sensibles forcés côté serveur.
            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'tracking_token' => Str::random(64),
                'user_id' => $user?->id,
                'customer_name' => $customer['name'],
                'customer_email' => $customer['email'],
                'customer_phone' => $customer['phone'],
                'shipping_address' => $customer['address'],
                'shipping_city' => $customer['city'],
                'shipping_zone_id' => $shippingZoneId,
                'promotion_id' => $promotionId,
                'discount_amount' => $discount,
                'payment_method' => $customer['payment_method'] ?? 'wave_om',
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_cost' => $shipping,
                'total' => $total,
                'notes' => $notes ?? $customer['notes'] ?? null,
            ]);

            // 8. Lignes de commande + décrément atomique du stock.
            foreach ($lines as [$variant, $product, $quantity, $unitPrice, $lineTotal]) {
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'variant_info' => $this->formatVariantInfo($variant),
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $lineTotal,
                ]);

                $variant->decrement('stock', $quantity);

                // Traçabilité (§9.14) : sortie de stock liée à la commande.
                StockMovement::create([
                    'product_variant_id' => $variant->id,
                    'type' => StockMovement::TYPE_OUT,
                    'quantity' => -$quantity,
                    'reason' => 'order',
                    'reference' => $order->order_number,
                ]);
            }

            return $order->load('items');
        });
    }

    private function formatVariantInfo(ProductVariant $variant): ?string
    {
        $parts = [];

        if ($variant->size) {
            $parts[] = 'Taille: '.$variant->size;
        }

        if ($variant->color) {
            $parts[] = 'Couleur: '.$variant->color;
        }

        return $parts === [] ? null : implode(' · ', $parts);
    }

    /**
     * Génère un numéro de commande non devinable et unique.
     */
    private function generateOrderNumber(): string
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $candidate = 'UB-'.strtoupper(Str::random(10));

            if (! Order::where('order_number', $candidate)->exists()) {
                return $candidate;
            }
        }

        throw new RuntimeException('Impossible de générer un numéro de commande unique.');
    }
}
