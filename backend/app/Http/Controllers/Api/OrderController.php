<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\AuditLogger;
use App\Services\CatalogOrderService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Commandes client (§9.4 / §9.18).
 *
 * - Création : prix/stock recalculés côté serveur (CatalogOrderService) ;
 * - Suivi : protégé par un jeton non devinable (anti-énumération / anti-IDOR) ;
 * - Aucun champ de prix, total ou statut n'est accepté depuis le client.
 */
class OrderController extends Controller
{
    public function __construct(
        private readonly CatalogOrderService $orders,
        private readonly AuditLogger $audit,
    ) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();

        // `sanctum` : un client connecté peut lier sa commande à son compte.
        $user = $request->user('sanctum');

        $order = $this->orders->create(
            customer: $data['customer'],
            items: $data['items'],
            user: $user,
            promoCode: $data['promo_code'] ?? null,
            notes: $data['notes'] ?? null,
        );

        $this->audit->order('created', $order);

        return response()->json([
            'message' => 'Commande créée avec succès',
            'order_number' => $order->order_number,
            'tracking_token' => $order->tracking_token,
            'order' => new OrderResource($order),
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::query()
            ->with('items')
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $provided = (string) $request->query('token', '');
        $user = $request->user('sanctum');

        // Suivi par jeton non devinable — comparaison en temps constant (anti-timing).
        $hasValidToken = $order->tracking_token !== null
            && $provided !== ''
            && hash_equals((string) $order->tracking_token, $provided);

        $isOwner = $user !== null && $order->user_id !== null && $order->user_id === $user->id;
        $isStaff = $user !== null && $user->role instanceof UserRole && $user->role->isAdmin();

        if (! $hasValidToken && ! $isOwner && ! $isStaff) {
            // 403 : ne révèle pas si la commande existe réellement.
            throw new AuthorizationException('Accès à la commande refusé.');
        }

        return response()->json(['data' => new OrderResource($order)]);
    }
}
