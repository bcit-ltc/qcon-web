# Frontend (Vite + React)

This app now runs on Vite for faster dev/builds while keeping the existing React UI.

## Commands

- `npm install` — install dependencies.
- `npm run dev` — start Vite dev server (defaults to http://localhost:5173 with proxy to Django on 8000 for `/ws/` and `/getpackage`).
- `npm run build` — production build to `build/` (assets in `build/static`).
- `npm run preview` — serve the production build locally.
- `npm run build_dev` — build with `VITE_DEBUG=true` (mirrors the old debug flag).

## Notes

- Django serves the built assets from `frontend/build`; static files live under `/static/`.
- Environment variables exposed to the client must be prefixed with `VITE_` (e.g., `VITE_DEBUG`).
