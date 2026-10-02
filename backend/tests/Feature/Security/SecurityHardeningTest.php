<?php

namespace Tests\Feature\Security;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_responses_include_security_headers(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        $this->assertStringContainsString(
            "default-src 'none'",
            (string) $response->headers->get('Content-Security-Policy')
        );
        $this->assertNotNull($response->headers->get('X-Request-ID'));
        $this->assertNull($response->headers->get('X-Powered-By'));
    }

    public function test_role_is_not_mass_assignable(): void
    {
        $user = User::create([
            'name' => 'Hacker',
            'email' => 'hacker@example.com',
            'password' => 'secret-password',
            'role' => 'admin',      // tentative d'escalade via mass assignment
            'is_active' => false,
        ]);

        // Le rôle et l'état restent les valeurs par défaut : champs ignorés.
        $this->assertSame(UserRole::Customer, $user->fresh()->role);
        $this->assertTrue((bool) $user->fresh()->is_active);
    }

    public function test_unknown_api_route_returns_json_404(): void
    {
        $this->getJson('/api/does-not-exist')->assertStatus(404);
    }
}
