<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_categories', function (Blueprint $table) {
            $table->decimal('price_from', 10, 3)->nullable()->after('description');
            $table->unsignedInteger('surface_m2')->nullable()->after('price_from');
            $table->unsignedTinyInteger('max_adults')->default(2)->after('surface_m2');
            $table->unsignedTinyInteger('max_children')->default(1)->after('max_adults');
            $table->boolean('is_active')->default(true)->after('max_children');
        });

        Schema::create('room_category_amenity_pivot', function (Blueprint $table) {
            $table->foreignId('room_category_id')->constrained('room_categories')->cascadeOnDelete();
            $table->foreignId('amenity_id')->constrained('room_amenities')->cascadeOnDelete();
            $table->primary(['room_category_id', 'amenity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_category_amenity_pivot');

        Schema::table('room_categories', function (Blueprint $table) {
            $table->dropColumn(['price_from', 'surface_m2', 'max_adults', 'max_children', 'is_active']);
        });
    }
};
