# Qcon-web

Frontend of the [Qcon](https://qcon.ltc.bcit.ca) service. Requires the [qcon-api](https://qcon-api.ltc.bcit.ca) processor engine to work correctly.

See the [Qcon User Guide](https://qcon-guide.ltc.bcit.ca).

## Developing

1. Clone and spin up a `docker compose` environment for the backend, `qcon-api`.

1. Run `docker compose up --build`. After the console reports that the service `qcon-web-nginx-unprivileged` has `... start worker process XX...`, navigate to http://localhost:8080/.

## License

Copyright (c) 2008-2022 [BCIT LTC](https://bcit.ca/ltc)

This Source Code Form is subject to the terms of the Mozilla Public
License, v2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at <https://mozilla.org/MPL/2.0/>.
