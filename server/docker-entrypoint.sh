#!/bin/sh
set -e

# Apply pending migrations against an (initially empty) database.
# Idempotent: does nothing if the schema is already up to date.
npx prisma migrate deploy

exec "$@"
