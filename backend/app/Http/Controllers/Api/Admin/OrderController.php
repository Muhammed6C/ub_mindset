<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OrderIndexRequest;
use App\Http\Requests\Admin\OrderStatusRequest;
use App\Http\Requests\Admin\OrderUpdateRequest;
use App\Http\Resources\Admin\OrderAdminResource;
use App\Models\Order;
use App\Services\AuditLogger;
use App\Services\OrderWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

/**
 * Commandes côté back-office (§6.2 / §7).
 *
 * Sécurité :
 * - protégé par `auth:sanctum` + `admin` (voir routes) ;
 * - autorisation explicite via `OrderPolicy` (deny-by-default, anti-IDOR) ;
 * - le statut ne peut évoluer que selon le workflow serveur ;
 * - filtres whitelistés, `per_page` plafonné, recherche 100 % paramétrée ;
 * - chaque action sensible est journalisée (§9.14).
 */
class OrderController extends Controller
{
    public function __construct(
        private readonly AuditLogger $audit,
        private readonly OrderWorkflowService $workflow,
    ) {}

    public function index(OrderIndexRequest $request): JsonResponse
    {
        Gate::authorize('viewAny', Order::class);

        $validated = $request->validated();

        $query = Order::query()->with([
            'items',
            'user:id,name,email',
        ]);

        if (! empty($validated['status'])) {
            $query->where('order_status', $validated['status']);
        }

        if (! empty($validated['payment_status'])) {
            $query->where('payment_status', $validated['payment_status']);
        }

        if (! empty($validated['user_id'])) {
            $query->where('user_id', (int) $validated['user_id']);
        }

        if (! empty($validated['search'])) {
            $needle = '%'.mb_strtolower($validated['search']).'%';

            $query->where(function ($q) use ($needle) {
                // Portable (PostgreSQL + SQLite) et 100 % paramétré : anti-injection.
                $q->whereRaw('LOWER(order_number) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(customer_name) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(customer_email) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(customer_phone) LIKE ?', [$needle]);
            });
        }

        match ($validated['sort'] ?? 'latest') {
            'oldest' => $query->oldest('id'),
            'total_asc' => $query->orderBy('total'),
            'total_desc' => $query->orderByDesc('total'),
            default => $query->latest('id'),
        };

        $orders = $query->paginate((int) ($validated['per_page'] ?? 20))->withQueryString();

        return OrderAdminResource::collection($orders)->response();
    }

    public function show(Order $order): JsonResponse
    {
        Gate::authorize('view', $order);

        return response()->json([
            'data' => new OrderAdminResource($order->load(['items', 'user:id,name,email'])),
        ]);
    }

    public function updateStatus(OrderStatusRequest $request, Order $order): JsonResponse
    {
        Gate::authorize('update', $order);

        $previous = (string) $order->order_status;

        $order = $this->workflow->transition($order, (string) $request->validated()['status'], $request->user());

        if ($previous !== (string) $order->order_status) {
            $this->audit->order('status_changed', $order);
            $this->audit->log('order.status_changed', $order, [
                'from' => $previous,
                'to' => (string) $order->order_status,
            ]);
        }

        return response()->json([
            'data' => new OrderAdminResource($order->load(['items', 'user:id,name,email'])),
        ]);
    }

    public function update(OrderUpdateRequest $request, Order $order): JsonResponse
    {
        Gate::authorize('update', $order);

        $data = $request->validated();

        // Seuls les champs explicitement validés sont appliqués (anti-over-posting).
        $order->fill($data)->save();

        $this->audit->log('order.updated', $order, array_keys($data));

        return response()->json([
            'data' => new OrderAdminResource($order->load(['items', 'user:id,name,email'])),
        ]);
    }
}
