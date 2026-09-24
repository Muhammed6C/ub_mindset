#!/bin/sh
set -e

echo "==> Attente de la disponibilité de PostgreSQL ($DB_HOST:$DB_PORT)..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" > /dev/null 2>&1; do
  sleep 1
done
echo "==> PostgreSQL est prêt !"

# Create .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  php artisan key:generate --force
fi

# Run migrations and seed data
echo "==> Exécution des migrations..."
php artisan migrate --force

echo "==> Exécution du seeder (catalogue & admin)..."
php artisan db:seed --force

echo "==> Démarrage du serveur Laravel sur http://0.0.0.0:8000"
exec "$@"
