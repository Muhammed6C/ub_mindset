<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Rôle applicatif : deny-by-default (customer = aucun accès admin).
            $table->string('role', 20)->default(UserRole::Customer->value)->index();
            // Suspension de compte sans suppression.
            $table->boolean('is_active')->default(true)->index();
            // Suivi des connexions (alimente les alertes de sécurité).
            $table->timestamp('last_login_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_active', 'last_login_at']);
        });
    }
};
