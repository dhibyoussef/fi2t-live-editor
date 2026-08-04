<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

/**
 * Serve uploaded media when `public/storage` is not a symlink.
 *
 * On Windows `storage:link` needs elevated rights, and a fresh clone has no
 * link at all — without this every CMS image upload 404s. When the link does
 * exist the web server answers first and this route is never reached.
 */
Route::get('/storage/{path}', function (string $path) {
    abort_unless(Storage::disk('public')->exists($path), 404);

    return Storage::disk('public')->response($path);
})->where('path', '.*')->name('storage.fallback');
