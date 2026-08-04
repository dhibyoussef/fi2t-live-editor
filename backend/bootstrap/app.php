<?php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Convert empty strings → null so nullable fields pass validation
        $middleware->append(\Illuminate\Foundation\Http\Middleware\TrimStrings::class);
        $middleware->append(\Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class);

        $middleware->alias([
            'role'       => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->booted(function () {
        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input('email', '');
            $key = strtolower($email).'|'.$request->ip();

            return [
                Limit::perMinute(5)->by($key),
                Limit::perMinute(20)->by($request->ip()),
            ];
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
