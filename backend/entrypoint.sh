#!/bin/sh
# Fail on any error
set -e

echo "🚀 Starting Production Entrypoint..."

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL (db:5432)..."
python -c '
import socket
import time
import os
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(2)
while True:
    try:
        s.connect((os.environ.get("DB_HOST", "db"), int(os.environ.get("DB_PORT", 5432))))
        s.close()
        break
    except (socket.error, socket.timeout):
        print("...still waiting for postgres...")
        time.sleep(1)
'
echo "✅ PostgreSQL is online."

# Wait for Redis
echo "⏳ Waiting for Redis (redis:6379)..."
python -c '
import socket
import time
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(2)
while True:
    try:
        s.connect(("redis", 6379))
        s.close()
        break
    except (socket.error, socket.timeout):
        print("...still waiting for redis...")
        time.sleep(1)
'
echo "✅ Redis is online."

# Run critical DB tasks
echo "🔄 Running migrations..."
python manage.py migrate --noinput

# Collect static files for Nginx (Production only)
if [ "$DJANGO_ENV" = "production" ]; then
    echo "📁 Collecting static files..."
    python manage.py collectstatic --noinput
else
    echo "📁 Skipping collectstatic for development..."
fi

echo "🔥 Execution starting..."
# Execute the passed CMD (Gunicorn)
exec "$@"
