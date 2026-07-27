<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_room_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_room_id')->nullable()->constrained('meeting_rooms')->nullOnDelete();
            $table->string('room_name');
            $table->string('disposition')->nullable();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->string('country_code', 10)->nullable();
            $table->date('event_date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->string('event_type')->nullable();
            $table->unsignedSmallInteger('participants')->default(1);
            $table->string('needs_catering')->nullable();
            $table->string('needs_av_equipment')->nullable();
            $table->string('is_hotel_resident')->nullable();
            $table->string('company_name')->nullable();
            $table->text('comments')->nullable();
            $table->enum('status', ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])->default('PENDING');
            $table->timestamps();

            $table->index('status');
            $table->index('event_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_room_bookings');
    }
};
