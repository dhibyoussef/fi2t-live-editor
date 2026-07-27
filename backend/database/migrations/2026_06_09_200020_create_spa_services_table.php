<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('category', ['MASSAGE', 'FACIAL', 'BODY_WRAP', 'HAMMAM', 'HYDROTHERAPY', 'MANICURE', 'PEDICURE', 'PACKAGE']);
            $table->text('description')->nullable();
            $table->integer('duration_min');
            $table->decimal('price', 10, 3);
            $table->boolean('is_couples')->default(false);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_services');
    }
};
