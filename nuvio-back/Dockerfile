FROM php:8.2-cli

WORKDIR /app

RUN docker-php-ext-install pdo pdo_mysql mbstring

COPY . .

EXPOSE 10000

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public public/router.php"]
