# Dockerfile

## Base
FROM registry.ltc.bcit.ca/ltc-infrastructure/images/qcon-web-base AS qcon-web-base


## Frontend Builder
FROM registry.ltc.bcit.ca/ltc-infrastructure/images/qcon-web-frontend-builder AS qcon-web-frontend-builder

COPY frontend/public ./public/
# COPY frontend/templates ./templates
COPY frontend/src ./src/
RUN npm run build


## Release
FROM python:3.11-alpine AS release

LABEL maintainer courseproduction@bcit.ca

WORKDIR /code

ENV PYTHONUNBUFFERED 1
ENV PATH /code:/opt/venv/bin:$PATH
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

RUN echo $VERSION > .env
COPY .env manage.py ./
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 9000
CMD ["daphne", "-b", "0.0.0.0", "-p", "9000", "qconweb.asgi:application"]

