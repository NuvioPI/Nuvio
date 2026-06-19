FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip

RUN docker-php-ext-install pdo pdo_mysql zip

COPY . /var/www/html/

RUN mkdir -p /var/www/html/public && \
    mv /var/www/html/public/index.php /var/www/html/index.php 2>/dev/null || true