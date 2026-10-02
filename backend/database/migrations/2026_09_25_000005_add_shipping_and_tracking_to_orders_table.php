<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_method')->nullable()->after('shipping_city');
            $table->string('tracking_number')->nullable()->after('shipping_method');
            // Jeton public non devinable pour le suivi de commande (anti-IDOR / anti-énumération).
            $table->string('tracking_token', 64)->nullable()->unique()->after('order_number');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['tracking_token']);
            $table->dropColumn(['shipping_method', 'tracking_number', 'tracking_token']);
        });
    }
};
