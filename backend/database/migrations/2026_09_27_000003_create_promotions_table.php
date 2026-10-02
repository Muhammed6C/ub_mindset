<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            // percentage | fixed
            $table->string('type', 20)->default('percentage');
            $table->decimal('value', 10, 2);
            $table->decimal('min_order_amount', 10, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('shipping_zone_id')->nullable()->after('shipping_city')->constrained('shipping_zones')->nullOnDelete();
            $table->foreignId('promotion_id')->nullable()->after('shipping_cost')->constrained('promotions')->nullOnDelete();
            $table->decimal('discount_amount', 12, 2)->default(0)->after('promotion_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['shipping_zone_id']);
            $table->dropForeign(['promotion_id']);
            $table->dropColumn(['shipping_zone_id', 'promotion_id', 'discount_amount']);
        });

        Schema::dropIfExists('promotions');
    }
};
