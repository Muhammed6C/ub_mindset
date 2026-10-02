<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'secret-password',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'client@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'token_type', 'user' => ['id', 'email', 'role']])
            ->assertJsonPath('user.email', 'client@example.com')
            ->assertJsonPath('user.role', 'customer');

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_login_fails_with_generic_message_on_wrong_password(): void
    {
        User::factory()->create(['email' => 'client@example.com']);

        $this->postJson('/api/auth/login', [
            'email' => 'client@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_does_not_reveal_unknown_email(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'whatever-password',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->inactive()->create([
            'email' => 'blocked@example.com',
            'password' => 'secret-password',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'blocked@example.com',
            'password' => 'secret-password',
        ])->assertStatus(422);
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create(['email' => 'client@example.com']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/auth/login', [
                'email' => 'client@example.com',
                'password' => 'wrong-password',
            ]);
        }

        $this->postJson('/api/auth/login', [
            'email' => 'client@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(429);
    }

    public function test_authenticated_user_payload_hides_sensitive_fields(): void
    {
        $user = User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'secret-password',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/user');

        $response->assertOk()->assertJsonPath('data.email', 'client@example.com');
        $this->assertStringNotContainsString('password', $response->getContent());
        $this->assertStringNotContainsString('remember_token', $response->getContent());
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test');

        $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
