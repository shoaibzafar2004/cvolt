#!/usr/bin/env bash
# Exports roles, schema and data from the hosted Supabase project into supabase/backup/.
# Usage: bash scripts/export-cloud-db.sh   (prompts for the database password)
set -euo pipefail

PROJECT_REF="uaqzwqavjwabaeodotpe"
OUT_DIR="supabase/backup"

read -rsp "Supabase database password: " DB_PASSWORD
echo
ENCODED_PASSWORD=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$DB_PASSWORD")
DB_URL="postgresql://postgres:${ENCODED_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

mkdir -p "$OUT_DIR"

echo "Dumping roles..."
npx supabase db dump --db-url "$DB_URL" -f "$OUT_DIR/roles.sql" --role-only
echo "Dumping schema..."
npx supabase db dump --db-url "$DB_URL" -f "$OUT_DIR/schema.sql"
echo "Dumping data (includes auth.users and storage metadata)..."
npx supabase db dump --db-url "$DB_URL" -f "$OUT_DIR/data.sql" --use-copy --data-only

echo "Done:"
ls -lh "$OUT_DIR"
