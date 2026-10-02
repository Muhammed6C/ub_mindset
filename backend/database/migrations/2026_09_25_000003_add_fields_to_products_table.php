<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('subtitle')->nullable()->after('name');
            $table->string('tag')->nullable()->after('subtitle');
            $table->decimal('original_price', 12, 2)->nullable()->after('price');
            $table->decimal('weight', 8, 3)->nullable()->after('original_price');
            $table->unsignedInteger('position')->default(0)->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'subtitle',
                'tag',
                'original_price',
                'weight',
                'position',
                'is_featured',
                'meta_title',
                'meta_description',
            ]);
        });
    }
};
