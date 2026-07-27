<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carousels', function (Blueprint $table) {
            if (! Schema::hasColumn('carousels', 'type')) {
                $table->string('type', 20)->default('carousel')->after('name'); // carousel | gallery
            }
            if (! Schema::hasColumn('carousels', 'slug')) {
                $table->string('slug', 80)->nullable()->unique()->after('type');
            }
        });

        Schema::table('carousel_items', function (Blueprint $table) {
            if (! Schema::hasColumn('carousel_items', 'layout')) {
                $table->string('layout', 20)->nullable()->after('overlay_opacity'); // large | wide (galleries)
            }
        });

        $usedSlugs = [];
        foreach (DB::table('carousels')->get() as $carousel) {
            $base = Str::slug($carousel->name) ?: 'collection-' . $carousel->id;
            $slug = $base;
            $i    = 1;
            while (in_array($slug, $usedSlugs, true) || DB::table('carousels')->where('slug', $slug)->where('id', '!=', $carousel->id)->exists()) {
                $slug = $base . '-' . $i++;
            }
            $usedSlugs[] = $slug;
            DB::table('carousels')->where('id', $carousel->id)->update([
                'type' => str_contains(strtolower($carousel->name), 'galerie') ? 'gallery' : 'carousel',
                'slug' => $slug,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('carousel_items', function (Blueprint $table) {
            $table->dropColumn('layout');
        });

        Schema::table('carousels', function (Blueprint $table) {
            $table->dropColumn(['type', 'slug']);
        });
    }
};
