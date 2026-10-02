<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->string('country_code', 10)->default('SN');
            $table->string('city')->nullable();
            $table->decimal('cost', 10, 2);
            $table->decimal('free_over', 10, 2)->nullable();
            $table->string('estimated_days')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->integer('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_zones');
    }
};
