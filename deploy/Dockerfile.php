FROM php:8.3-fpm-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip curl \
    libzip-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring zip gd bcmath opcache \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

COPY deploy/php-entrypoint.sh /usr/local/bin/php-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/php-entrypoint.sh \
    && chmod +x /usr/local/bin/php-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/php-entrypoint.sh"]
CMD ["php-fpm"]
