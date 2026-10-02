<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaUploadRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Services\AuditLogger;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bibliothèque de médias (§6.2 / §9.9).
 *
 * L'upload est validé (taille, extension, MIME réel, magic bytes), renommé en
 * UUID et stocké hors racine web. La restitution impose un Content-Type
 * maîtrisé (jamais `text/html`).
 */
class MediaController extends Controller
{
    /**
     * Types réellement servis (whitelist stricte).
     *
     * @var array<int, string>
     */
    private const SERVABLE_MIME = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif',
        'model/gltf-binary',
        'application/octet-stream',
    ];

    public function __construct(
        private readonly MediaService $media,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Media::class);

        $perPage = min(max((int) $request->integer('per_page', 30), 1), 60);
        $media = Media::query()->latest('id')->paginate($perPage)->withQueryString();

        return MediaResource::collection($media)->response();
    }

    public function store(MediaUploadRequest $request): JsonResponse
    {
        Gate::authorize('create', Media::class);

        $data = $request->validated();

        $media = $this->media->store(
            $request->file('file'),
            $request->user()->id,
            (bool) ($data['is_public'] ?? true),
        );

        $this->audit->log('media.uploaded', $media, ['mime' => $media->mime, 'size' => $media->size]);

        return response()->json(['data' => new MediaResource($media)], Response::HTTP_CREATED);
    }

    public function destroy(Media $media): JsonResponse
    {
        Gate::authorize('delete', $media);

        $this->audit->log('media.deleted', null, ['media_id' => $media->id]);
        $this->media->delete($media);

        return response()->json(['message' => 'Média supprimé.']);
    }

    /**
     * Sert un média (route publique pour les médias publics, 404 sinon).
     */
    public function show(Request $request, Media $media): Response
    {
        // Média privé : réservé au back-office ; on renvoie 404 pour ne pas
        // révéler l'existence du fichier (anti-énumération).
        if (! $media->is_public) {
            $user = $request->user('sanctum');

            if ($user === null || ! $user->isAdmin()) {
                abort(404);
            }
        }

        if (! in_array($media->mime, self::SERVABLE_MIME, true)) {
            abort(404);
        }

        if (! Storage::disk($media->disk)->exists($media->path)) {
            abort(404);
        }

        return Storage::disk($media->disk)->response($media->path, null, [
            'Content-Type' => $media->mime,
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
            // Média public destiné au front (origine différente) : on autorise
            // explicitement le chargement cross-origin.
            'Cross-Origin-Resource-Policy' => 'cross-origin',
            'Cache-Control' => $media->is_public
                ? 'public, max-age=31536000, immutable'
                : 'private, max-age=0, no-store',
        ], 'inline');
    }
}
