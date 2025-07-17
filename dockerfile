FROM php:8.0-apache

# Instalar extensiones necesarias
RUN docker-php-ext-install mysqli \
    && docker-php-ext-enable mysqli
