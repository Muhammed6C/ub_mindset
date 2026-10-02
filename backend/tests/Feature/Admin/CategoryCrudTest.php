<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_guest_cannot_create_category(): void
    {
        $this->postJson('/api/admin/categories', ['name' => 'Test'])->assertStatus(401);
    }

    public function test_customer_cannot_create_category(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson('/api/admin/categories', ['name' => 'Test Cat'])
            ->assertStatus(403);
    }

    public function test_admin_can_create_category_and_slug_is_generated(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/categories', ['name' => 'Nouvelle Catégorie'])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'nouvelle-categorie');

        $this->assertDatabaseHas('categories', ['slug' => 'nouvelle-categorie']);
    }

    public function test_admin_can_update_category(): void
    {
        $category = Category::create(['name' => 'Ancien', 'slug' => 'ancien']);

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/categories/'.$category->id, ['name' => 'Nouveau', 'slug' => 'ancien'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Nouveau');
    }

    public function test_duplicate_slug_is_rejected(): void
    {
        Category::create(['name' => 'A', 'slug' => 'doublon']);

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/categories', ['name' => 'B', 'slug' => 'doublon'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('slug');
    }

    public function test_html_in_name_is_rejected(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/categories', ['name' => '<script>alert(1)</script>'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('name');
    }

    public function test_category_cannot_be_its_own_parent(): void
    {
        $category = Category::create(['name' => 'A', 'slug' => 'a']);

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/categories/'.$category->id, [
                'name' => 'A',
                'slug' => 'a',
                'parent_id' => $category->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('parent_id');
    }

    public function test_staff_cannot_delete_category_but_admin_can(): void
    {
        $category = Category::create(['name' => 'A', 'slug' => 'a']);

        $this->actingAs(User::factory()->staff()->create(), 'sanctum')
            ->deleteJson('/api/admin/categories/'.$category->id)
            ->assertStatus(403);

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson('/api/admin/categories/'.$category->id)
            ->assertOk();

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_staff_can_view_inactive_category_in_backoffice(): void
    {
        $category = Category::create(['name' => 'Off', 'slug' => 'off-cat', 'is_active' => false]);

        $this->actingAs(User::factory()->staff()->create(), 'sanctum')
            ->getJson('/api/admin/categories/'.$category->id)
            ->assertOk();
    }
}
