<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop old flat carousels table and replace with a two-level structure:
        //   carousels        → named groups  (e.g. "Accueil Hero", "Galerie Spa")
        //   carousel_items   → individual slides inside a group
        Schema::dropIfExists('carousels');

        Schema::create('carousels', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // "Accueil Hero"
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('carousel_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carousel_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // Content
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();

            // Call-to-action
            $table->string('button_text')->nullable();
            $table->string('button_link')->nullable();

            // Image
            $table->string('image_url');
            $table->string('image_alt')->nullable();

            // Display
            $table->string('text_position')->default('center'); // left|center|right
            $table->unsignedTinyInteger('overlay_opacity')->default(40);

            // Ordering & visibility
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carousel_items');
        Schema::dropIfExists('carousels');
    }
};
