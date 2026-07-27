<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('nights');
            $table->integer('adults')->default(2);
            $table->integer('children')->default(0);
            $table->decimal('price_per_night', 10, 3);
            $table->decimal('total_price', 10, 3);
            $table->decimal('taxes', 10, 3)->default(0);
            $table->enum('rate_type', ['FLEXIBLE', 'NON_REFUNDABLE', 'LPD', 'PACKAGE']);
            $table->enum('status', ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'])->default('PENDING');
            $table->text('special_requests')->nullable();
            $table->string('promo_code')->nullable();
            $table->timestamps();

            $table->index(['room_id', 'check_in', 'check_out']);
            $table->index('status');
            $table->index('client_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
