<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('mediable_type');
            $table->unsignedBigInteger('mediable_id');
            $table->string('url');
            $table->string('alt_text')->nullable();
            $table->enum('type', ['IMAGE', 'VIDEO'])->default('IMAGE');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_carousel')->default(false);
            $table->boolean('is_cover')->default(false);
            $table->timestamps();

            $table->index(['mediable_type', 'mediable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
