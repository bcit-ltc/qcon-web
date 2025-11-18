#!/usr/bin/env sh

set -e

>&2 echo "Collect static files"
python manage.py collectstatic --noinput
echo "-------------------------------------------------------------------------------------------\n"

>&2 echo "Starting redis"
redis-server --daemonize yes

>&2 echo "Starting Daphne"
exec "$@"
