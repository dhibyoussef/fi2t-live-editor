<?php

use App\Http\Controllers\Admin\CmsPageController;
use App\Http\Controllers\Admin\ContentBlockController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SiteNavController;
use App\Http\Controllers\Admin\TranslationController;
use App\Http\Controllers\Admin\FormSubmissionController as AdminFormSubmissionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\FormSubmissionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FI2T API — Auth + CMS Live Editor only
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');
});

// Public website content
Route::get('translations/all', [TranslationController::class, 'all']);
Route::get('translations/{locale}', [TranslationController::class, 'show']);
Route::get('content', [ContentBlockController::class, 'all']);
Route::get('content/{page}', [ContentBlockController::class, 'show']);
Route::get('pages/{slug}', [CmsPageController::class, 'publicShow']);
Route::get('site-nav', [SiteNavController::class, 'publicIndex']);

// Legacy hotel endpoint still queried by the page builder preview — return empty list.
Route::get('carousels/public', fn () => response()->json([]));
Route::get('carousels/public/{slug}', fn () => response()->json(['slug' => request()->route('slug'), 'active_items' => []]));

Route::prefix('forms')->middleware('throttle:20,1')->group(function () {
    Route::post('contact', [FormSubmissionController::class, 'contact']);
    Route::post('newsletter', [FormSubmissionController::class, 'newsletter']);
    Route::post('adhesion', [FormSubmissionController::class, 'adhesion']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });

    Route::prefix('admin')->middleware('role:super-admin|admin')->group(function () {
        // Full CMS session only (not the short Live Editor token)
        Route::middleware('ability:cms-admin')->group(function () {
            Route::post('edit-session', [AuthController::class, 'createEditSession'])
                ->middleware('throttle:30,1');

            Route::apiResource('users', UserController::class);
            Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
            Route::apiResource('roles', RoleController::class);
            Route::get('permissions', [RoleController::class, 'permissions']);

            Route::post('translations/locales', [TranslationController::class, 'addLocale']);
            Route::delete('translations/locales/{code}', [TranslationController::class, 'deleteLocale']);

            Route::post('media', [MediaController::class, 'store']);
            Route::put('media/{media}', [MediaController::class, 'update']);
            Route::delete('media/{media}', [MediaController::class, 'destroy']);
            Route::post('media/reorder', [MediaController::class, 'reorder']);

            Route::get('form-submissions/unread', [AdminFormSubmissionController::class, 'unread']);
            Route::post('form-submissions/mark-all-read', [AdminFormSubmissionController::class, 'markAllRead']);
            Route::get('form-submissions', [AdminFormSubmissionController::class, 'index']);
            Route::get('form-submissions/{formSubmission}', [AdminFormSubmissionController::class, 'show']);
            Route::patch('form-submissions/{formSubmission}', [AdminFormSubmissionController::class, 'update']);
            Route::delete('form-submissions/{formSubmission}', [AdminFormSubmissionController::class, 'destroy']);
        });

        // Live Editor token may only edit content / nav / translations
        Route::middleware('ability:cms-admin,cms-edit')->group(function () {
            Route::get('translations', [TranslationController::class, 'index']);
            Route::post('translations/bulk', [TranslationController::class, 'bulk']);
            Route::post('translations/sync-keys', [TranslationController::class, 'syncKeys']);
            Route::post('translations/auto-fill', [TranslationController::class, 'autoFill']);
            Route::post('translate', [TranslationController::class, 'translate'])->middleware('throttle:30,1');
            Route::post('content/sync-locales', [ContentBlockController::class, 'syncLocales']);

            Route::get('content/matrix', [ContentBlockController::class, 'matrix']);
            Route::get('content/patterns', [CmsPageController::class, 'patterns']);
            Route::get('content/pages', [CmsPageController::class, 'index']);
            Route::post('content/pages', [CmsPageController::class, 'store']);
            Route::put('content/pages/{cmsPage}', [CmsPageController::class, 'update']);
            Route::delete('content/pages/{cmsPage}', [CmsPageController::class, 'destroy']);
            Route::post('content/insert-pattern', [CmsPageController::class, 'insertPattern']);
            Route::delete('content/sections', [CmsPageController::class, 'destroySection']);
            Route::get('content', [ContentBlockController::class, 'index']);
            Route::post('content/bulk', [ContentBlockController::class, 'bulk']);
            Route::post('content/upload-image', [ContentBlockController::class, 'uploadImage']);
            Route::delete('content/image', [ContentBlockController::class, 'deleteImage']);
            Route::delete('content/block', [ContentBlockController::class, 'destroyBlock']);

            Route::get('site-nav', [SiteNavController::class, 'index']);
            Route::post('site-nav', [SiteNavController::class, 'store']);
            Route::put('site-nav/{siteNavItem}', [SiteNavController::class, 'update']);
            Route::delete('site-nav/{siteNavItem}', [SiteNavController::class, 'destroy']);
            Route::post('site-nav/reorder', [SiteNavController::class, 'reorder']);
        });
    });
});
