FROM php:8.2-cli

WORKDIR /app

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev libzip-dev unzip \
    && docker-php-ext-install pdo pdo_mysql mbstring zip \
    && rm -rf /var/lib/apt/lists/*

COPY composer.json composer.lock ./

RUN composer update phpmailer/phpmailer \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader

COPY . .

EXPOSE 10000

CMD ["sh", "-c", "php scripts/migrate-performance.php || echo 'Aviso: migração de performance não aplicada'; exec php -S 0.0.0.0:${PORT:-10000} -t public public/index.php"]
