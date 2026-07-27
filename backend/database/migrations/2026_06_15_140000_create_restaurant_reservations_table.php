<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->nullOnDelete();
            $table->string('restaurant_name');
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->string('country_code', 10)->nullable();
            $table->unsignedSmallInteger('guests_count')->default(2);
            $table->date('reservation_date');
            $table->time('reservation_time');
            $table->string('table_type')->nullable();
            $table->string('occasion')->nullable();
            $table->string('dietary_preferences')->nullable();
            $table->string('room_number', 50)->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])->default('PENDING');
            $table->timestamps();

            $table->index('status');
            $table->index('reservation_date');
            $table->index('outlet_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_reservations');
    }
};
