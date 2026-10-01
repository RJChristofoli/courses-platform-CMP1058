#!/bin/sh
set -eu

if [ -z "${TEST_DATABASE_URL:-}" ]; then
  echo "Defina TEST_DATABASE_URL para um banco isolado cujo nome termina em _test."
  exit 1
fi

node -e 'const test = new URL(process.env.TEST_DATABASE_URL); const demo = process.env.DATABASE_URL && new URL(process.env.DATABASE_URL); if (!test.pathname.endsWith("_test") || (demo && demo.toString() === test.toString())) { console.error("TEST_DATABASE_URL precisa ser separado do banco de demonstração e terminar em _test."); process.exit(1) }'

DATABASE_URL="$TEST_DATABASE_URL" npm run db:migrate:deploy
npm run test:e2e:run
