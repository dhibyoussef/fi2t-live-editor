<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->nullable()->constrained('spa_services')->nullOnDelete();
            $table->string('experience_name');
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->string('country_code', 10)->nullable();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('objective')->nullable();
            $table->string('fitness_level')->nullable();
            $table->string('therapist_preference')->nullable();
            $table->string('duration')->nullable();
            $table->unsignedSmallInteger('persons')->default(1);
            $table->string('is_hotel_resident')->nullable();
            $table->foreignId('extra_service_id')->nullable()->constrained('spa_services')->nullOnDelete();
            $table->string('extra_experience_name')->nullable();
            $table->text('comments')->nullable();
            $table->enum('status', ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])->default('PENDING');
            $table->timestamps();

            $table->index('status');
            $table->index('appointment_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_bookings');
    }
};
