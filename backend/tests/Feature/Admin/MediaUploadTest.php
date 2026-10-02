<?php

namespace Tests\Feature\Admin;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_admin_can_upload_a_valid_image(): void
    {
        Storage::fake('media');

        $response = $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/media', [
                'file' => UploadedFile::fake()->image('photo.jpg', 120, 80),
                'is_public' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.mime', 'image/jpeg')
            ->assertJsonPath('data.width', 120);

        $this->assertDatabaseCount('media', 1);

        $media = Media::firstOrFail();
        Storage::disk('media')->assertExists($media->path);
        // Le fichier est renommé (jamais le nom d'origine).
        $this->assertStringNotContainsString('photo', $media->path);
    }

    public function test_php_file_is_rejected(): void
    {
        Storage::fake('media');

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/media', [
                'file' => UploadedFile::fake()->create('shell.php', 10, 'application/x-php'),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('file');

        $this->assertDatabaseCount('media', 0);
    }

    public function test_disguised_php_file_is_rejected(): void
    {
        Storage::fake('media');

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/media', [
                'file' => UploadedFile::fake()->createWithContent('shell.jpg', '<?php echo "pwned"; ?>'),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('file');

        $this->assertDatabaseCount('media', 0);
    }

    public function test_svg_upload_is_rejected(): void
    {
        Storage::fake('media');

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/media', [
                'file' => UploadedFile::fake()->create('logo.svg', 5, 'image/svg+xml'),
            ])
            ->assertStatus(422);
    }

    public function test_customer_cannot_upload_media(): void
    {
        Storage::fake('media');

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson('/api/admin/media', [
                'file' => UploadedFile::fake()->image('photo.jpg'),
            ])
            ->assertStatus(403);
    }

    public function test_public_media_is_served_with_safe_headers(): void
    {
        Storage::fake('media');

        $media = Media::create([
            'disk' => 'media',
            'path' => 'media/2026/10/public.png',
            'mime' => 'image/png',
            'size' => 6,
            'is_public' => true,
        ]);

        Storage::disk('media')->put($media->path, 'binary');

        $this->get('/api/media/'.$media->id)
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }

    public function test_private_media_returns_404_to_guests(): void
    {
        Storage::fake('media');

        $media = Media::create([
            'disk' => 'media',
            'path' => 'media/2026/10/private.png',
            'mime' => 'image/png',
            'size' => 6,
            'is_public' => false,
        ]);

        Storage::disk('media')->put($media->path, 'binary');

        $this->get('/api/media/'.$media->id)->assertStatus(404);
    }

    public function test_private_media_is_served_to_admin(): void
    {
        Storage::fake('media');

        $media = Media::create([
            'disk' => 'media',
            'path' => 'media/2026/10/private2.png',
            'mime' => 'image/png',
            'size' => 6,
            'is_public' => false,
        ]);

        Storage::disk('media')->put($media->path, 'binary');

        $this->actingAs($this->admin(), 'sanctum')
            ->get('/api/media/'.$media->id)
            ->assertOk();
    }
}
