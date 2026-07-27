<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carousels', function (Blueprint $table) {
            $table->id();

            // Content
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();

            // Call-to-action
            $table->string('button_text')->nullable();
            $table->string('button_link')->nullable();

            // Image — URL (external CDN / upload path)
            $table->string('image_url');
            $table->string('image_alt')->nullable();

            // Display
            $table->string('text_position')->default('center'); // left | center | right
            $table->string('overlay_opacity')->default('40');    // 0–100 %

            // Ordering & visibility
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carousels');
    }
};
