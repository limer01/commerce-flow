#!/bin/bash
# Bootstraps a self-contained dev environment INSIDE a docker sandbox so the
# headless ralph agent can actually run the feedback loops (migrate, seed,
# tests) against a real database — without touching the host's PostgreSQL.
#
# Idempotent: safe to re-run. Intended to be invoked once per sandbox via
#   docker sandbox exec <name> bash <repo>/ralph/sandbox-bootstrap.sh
#
# Side effect: rebuilds backend/ and frontend/ node_modules for Linux. Because
# the repo (incl. node_modules) is mounted from the Windows host, this
# OVERWRITES the host's native binaries — re-run `npm install` on the host
# afterwards to restore them.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo ">>> repo: $REPO_DIR"

echo ">>> [1/5] installing PostgreSQL"
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql >/dev/null

echo ">>> [2/5] starting PostgreSQL"
sudo service postgresql start
# Wait until the server accepts connections.
for i in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then break; fi
  sleep 1
done

echo ">>> [3/5] configuring postgres role + commerce_flow database"
# Match the DATABASE_URL in backend/.env: postgres:postgres@localhost:5432
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER postgres WITH PASSWORD 'postgres';"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='commerce_flow'" | grep -q 1; then
  sudo -u postgres createdb commerce_flow
fi

echo ">>> [4/5] installing Linux node_modules (backend + frontend)"
for app in backend frontend; do
  echo "    - $app"
  ( cd "$REPO_DIR/$app" && rm -rf node_modules && npm install --no-fund --no-audit )
done

echo ">>> [5/5] applying migrations + seed"
( cd "$REPO_DIR/backend" && npx prisma migrate deploy && npm run db:seed )

echo ">>> bootstrap complete. DB ready at postgresql://postgres:postgres@localhost:5432/commerce_flow"
