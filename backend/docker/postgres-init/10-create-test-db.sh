#!/bin/sh
set -eu

if ! psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname = 'courses_platform_test'" | grep -q 1; then
  createdb --username "$POSTGRES_USER" courses_platform_test
fi
