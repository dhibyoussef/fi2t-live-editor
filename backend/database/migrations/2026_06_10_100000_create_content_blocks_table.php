<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('page', 50);
            $table->string('section', 80);
            $table->string('key', 100);
            $table->string('locale', 10)->default('_all');
            $table->enum('type', ['text', 'image', 'json'])->default('text');
            $table->text('value')->nullable();
            $table->string('label')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['page', 'section', 'key', 'locale']);
            $table->index(['page', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_blocks');
    }
};
