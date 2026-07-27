<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('room_categories')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['SINGLE', 'DOUBLE', 'TWIN', 'TRIPLE', 'QUAD', 'SUITE']);
            $table->enum('status', ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER'])->default('AVAILABLE');
            $table->integer('floor');
            $table->string('room_number')->unique();
            $table->decimal('price_per_night', 10, 3);
            $table->decimal('weekend_price', 10, 3)->nullable();
            $table->decimal('flexible_rate', 10, 3)->nullable();
            $table->integer('surface_m2');
            $table->decimal('height_m', 4, 2);
            $table->decimal('width_m', 4, 2);
            $table->integer('max_adults')->default(2);
            $table->integer('max_children')->default(1);
            $table->boolean('has_balcony')->default(false);
            $table->boolean('smoking')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
