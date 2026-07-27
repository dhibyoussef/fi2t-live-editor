<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('locale', 10);          // 'fr', 'en', 'ar', 'de' …
            $table->string('key');                  // dot-notation: 'nav.dashboard'
            $table->text('value')->nullable();
            $table->timestamps();

            $table->unique(['locale', 'key']);
            $table->index('locale');
        });

        // Supported locales registry (one row per language)
        Schema::create('locales', function (Blueprint $table) {
            $table->string('code', 10)->primary();  // 'fr'
            $table->string('name');                  // 'Français'
            $table->string('flag')->nullable();      // '🇫🇷'
            $table->string('direction', 3)->default('ltr'); // 'ltr' | 'rtl'
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
        Schema::dropIfExists('locales');
    }
};
