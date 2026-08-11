#!/bin/sh
set -e

cd /var/www/backend

# Install PHP deps if vendor is missing (first boot / fresh volume)
if [ ! -f vendor/autoload.php ]; then
  composer install --no-dev --optimize-autoloader --no-interaction
fi

# Wait for MySQL
echo "Waiting for database..."
i=0
until php -r "try { new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '3306') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0);} catch (Exception \$e) { exit(1);}" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "Database not ready after 60s"
    break
  fi
  sleep 1
done

mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || true

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
  php artisan key:generate --force || true
fi

php artisan storage:link 2>/dev/null || true
php artisan migrate --force 2>/dev/null || true
php artisan config:cache 2>/dev/null || true

# If CMD is queue worker, skip php-fpm
if [ "$1" = "php" ] && [ "$2" = "artisan" ]; then
  exec "$@"
fi

exec "$@"
