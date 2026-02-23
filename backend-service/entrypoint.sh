#!/bin/sh

set -e

echo "menjalankan migrasi database..."
npx prisma db push --schema=./prisma/schema.prisma

echo "menjalankan database seeder...."
npm run seeder

echo "start running aplikasi ...."
exec node dist/src/main