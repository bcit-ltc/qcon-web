# Dockerfile

## Base
# FROM registry.ltc.bcit.ca/ltc-infrastructure/images/qcon-web-base AS qcon-web-base

FROM python:3.14-alpine AS qcon-web-base

ENV PATH=/opt/venv/bin:/base:$PATH

COPY requirements.txt ./

RUN set -ex; \
    python -m venv /opt/venv; \
    pip install --upgrade pip; \
    pip install -r requirements.txt;



## Frontend Builder
# FROM registry.ltc.bcit.ca/ltc-infrastructure/images/qcon-web-frontend-builder AS qcon-web-frontend-builder

FROM node:25.5.0-alpine3.23 AS qcon-web-frontend-builder

WORKDIR /app

COPY /frontend/package*.json ./
COPY /frontend/vite.config.js ./
COPY /frontend/index.html ./

RUN npm ci

COPY frontend/public ./public/
# COPY frontend/templates ./templates
COPY frontend/src ./src/
RUN npm run build



## Release
FROM python:3.14-alpine AS release

LABEL maintainer=courseproduction@bcit.ca
LABEL org.opencontainers.image.source=https://github.com/bcit-ltc/qcon-web

WORKDIR /code

ENV PYTHONUNBUFFERED=1
ENV PATH=/code:/opt/venv/bin:$PATH
ARG VERSION
ENV VERSION=${VERSION:-0.0.0}

RUN apk --update add \
    redis \
    libpq \
    curl \
    && mkdir -p /run/daphne

COPY --from=qcon-web-base /root/.cache /root/.cache
COPY --from=qcon-web-base /opt/venv /opt/venv

COPY --from=qcon-web-frontend-builder /app/build ./frontend/build/

COPY qconweb qconweb/
COPY frontend frontend/

COPY manage.py ./
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 9000
CMD ["daphne", "-b", "0.0.0.0", "-p", "9000", "qconweb.asgi:application"]
