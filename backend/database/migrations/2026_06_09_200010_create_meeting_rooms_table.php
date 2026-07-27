<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['CONFERENCE', 'BOARDROOM', 'BANQUET', 'CEREMONY', 'WORKSHOP', 'OUTDOOR']);
            $table->integer('capacity_theatre')->nullable();
            $table->integer('capacity_classroom')->nullable();
            $table->integer('capacity_banquet')->nullable();
            $table->integer('capacity_cocktail')->nullable();
            $table->integer('capacity_boardroom')->nullable();
            $table->decimal('surface_m2', 8, 2);
            $table->decimal('height_m', 4, 2)->nullable();
            $table->decimal('width_m', 4, 2)->nullable();
            $table->decimal('length_m', 4, 2)->nullable();
            $table->decimal('price_half_day', 10, 3)->nullable();
            $table->decimal('price_full_day', 10, 3)->nullable();
            $table->decimal('price_per_hour', 10, 3)->nullable();
            $table->text('description')->nullable();
            $table->boolean('has_natural_light')->default(false);
            $table->boolean('has_av_equipment')->default(false);
            $table->boolean('has_wifi')->default(true);
            $table->boolean('has_catering')->default(false);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_rooms');
    }
};
