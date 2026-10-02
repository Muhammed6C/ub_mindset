<?php

namespace Tests\Feature\Admin;

use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductImageTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function product(string $slug = 'p'): Product
    {
        return Product::create(['name' => 'P', 'slug' => $slug, 'price' => 100]);
    }

    private function media(string $mime = 'image/jpeg'): Media
    {
        return Media::create([
            'disk' => 'media',
            'path' => 'media/2026/10/'.uniqid().'.jpg',
            'mime' => $mime,
            'size' => 1234,
            'is_public' => true,
        ]);
    }

    public function test_admin_can_add_image_from_media(): void
    {
        $product = $this->product();
        $media = $this->media();

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products/'.$product->id.'/images', [
                'media_id' => $media->id,
                'alt' => 'Vue avant',
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.media_id', $media->id);
    }

    public function test_admin_can_add_image_from_external_url(): void
    {
        $product = $this->product();

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products/'.$product->id.'/images', [
                'path' => 'https://cdn.example.com/photo.jpg',
            ])
            ->assertStatus(201);
    }

    public function test_non_image_media_is_rejected(): void
    {
        $product = $this->product();
        $media = $this->media('model/gltf-binary');

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products/'.$product->id.'/images', ['media_id' => $media->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors('media_id');
    }

    public function test_requires_media_or_path(): void
    {
        $product = $this->product();

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products/'.$product->id.'/images', ['alt' => 'x'])
            ->assertStatus(422);
    }

    public function test_javascript_url_is_rejected(): void
    {
        $product = $this->product();

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products/'.$product->id.'/images', ['path' => 'javascript:alert(1)'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('path');
    }

    public function test_image_of_another_product_cannot_be_deleted(): void
    {
        $productA = $this->product('a');
        $productB = $this->product('b');

        $image = ProductImage::create([
            'product_id' => $productB->id,
            'path' => 'https://cdn.example.com/x.jpg',
            'position' => 1,
        ]);

        // Binding scopé : l'image n'appartient pas au produit A => 404.
        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson('/api/admin/products/'.$productA->id.'/images/'.$image->id)
            ->assertStatus(404);

        $this->assertDatabaseHas('product_images', ['id' => $image->id]);
    }

    public function test_customer_cannot_add_image(): void
    {
        $product = $this->product();
        $media = $this->media();

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson('/api/admin/products/'.$product->id.'/images', ['media_id' => $media->id])
            ->assertStatus(403);
    }
}
