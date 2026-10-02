<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

/**
 * Gestion des uploads média (§9.9) — stockage sécurisé.
 *
 * - Whitelist d'extensions ET vérification du MIME réel (finfo) ;
 * - Vérification des « magic bytes » (images et GLB) ;
 * - Renommage en UUID (jamais le nom d'origine) ;
 * - Stockage HORS racine web (disque `media`) ;
 * - Taille limitée ; aucune exécution possible.
 */
class MediaService
{
    public const MAX_SIZE_KB = 25600; // 25 Mo (GLB inclus)

    /**
     * MIME autorisés → extension canonique imposée.
     *
     * @var array<string, string>
     */
    private const ALLOWED_MIME = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'image/avif' => 'avif',
        'model/gltf-binary' => 'glb',
        'application/octet-stream' => 'glb', // finfo renvoie souvent ce type pour un .glb
    ];

    public function store(UploadedFile $file, ?int $userId = null, bool $isPublic = true): Media
    {
        if (! $file->isValid()) {
            throw ValidationException::withMessages(['file' => 'Le fichier est invalide ou corrompu.']);
        }

        $mime = (string) ($file->getMimeType() ?: '');

        if (! array_key_exists($mime, self::ALLOWED_MIME)) {
            throw ValidationException::withMessages([
                'file' => 'Type de fichier non autorisé.',
            ]);
        }

        $extension = self::ALLOWED_MIME[$mime];
        $realPath = $file->getRealPath();

        // Vérification des « magic bytes » : on ne se fie ni au nom ni à l'extension.
        $this->assertMagicBytes($realPath, $extension);

        $disk = 'media';
        $path = sprintf(
            'media/%s/%s.%s',
            now()->format('Y/m'),
            (string) Str::uuid(),
            $extension
        );

        $stored = $file->storeAs(dirname($path), basename($path), ['disk' => $disk]);

        if ($stored === false) {
            throw new RuntimeException("Échec de l'enregistrement du média.");
        }

        [$width, $height] = $this->dimensions($realPath, $extension);

        $media = Media::create([
            'disk' => $disk,
            'path' => $stored,
            'mime' => $mime,
            'size' => (int) $file->getSize(),
            'width' => $width,
            'height' => $height,
            'is_public' => $isPublic,
        ]);

        // `created_by` n'est pas mass-assignable : forcé côté serveur (§9.4).
        if ($userId !== null) {
            $media->forceFill(['created_by' => $userId])->save();
        }

        return $media;
    }

    public function delete(Media $media): void
    {
        try {
            Storage::disk($media->disk)->delete($media->path);
        } catch (Throwable $e) {
            report($e);
        }

        $media->delete();
    }

    /**
     * @return array{0: int|null, 1: int|null}
     */
    private function dimensions(string $realPath, string $extension): array
    {
        if ($extension === 'glb' || ! is_readable($realPath)) {
            return [null, null];
        }

        $info = @getimagesize($realPath);

        if ($info === false) {
            return [null, null];
        }

        return [(int) $info[0], (int) $info[1]];
    }

    private function assertMagicBytes(string $realPath, string $extension): void
    {
        if (! is_readable($realPath)) {
            throw ValidationException::withMessages(['file' => 'Fichier illisible.']);
        }

        if ($extension === 'glb') {
            $handle = fopen($realPath, 'rb');
            $header = $handle !== false ? (string) fread($handle, 4) : '';

            if ($handle !== false) {
                fclose($handle);
            }

            if ($header !== 'glTF') {
                throw ValidationException::withMessages(['file' => 'Fichier GLB invalide.']);
            }

            return;
        }

        // Pour les images : le contenu doit être une image réellement décodable.
        if (@getimagesize($realPath) === false) {
            throw ValidationException::withMessages(['file' => 'Le contenu du fichier ne correspond pas à une image.']);
        }
    }
}
