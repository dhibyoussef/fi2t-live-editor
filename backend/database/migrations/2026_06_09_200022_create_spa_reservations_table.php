<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('spa_services')->cascadeOnDelete();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->integer('persons')->default(1);
            $table->decimal('total_price', 10, 3);
            $table->enum('status', ['PENDING', 'CONFIRMED', 'CANCELLED', 'DONE'])->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_reservations');
    }
};
