# Daily Vibe Check

A compact full-stack prototype for collecting remote-team reflections and surfacing a mock AI vibe analysis.

## Stack

- React + Vite single-page app
- Fastify API
- Local JSON persistence in `data/reflections.json`
- Vitest unit and component tests

## Run

```bash
npm install
npm run dev:all
```

Open `http://localhost:5173`. The API runs on `http://localhost:4000`.

## Test

```bash
npm test
```

## API

- `GET /api/reflections` returns stored entries and aggregate insights.
- `POST /api/reflections` accepts `{ "text": "..." }` and returns the created entry plus refreshed insights.
- `PATCH /api/reflections/:id` edits an entry and recalculates its category.
- `DELETE /api/reflections/:id` removes an entry and returns refreshed dashboard state.
- `POST /api/reflections/demo` replaces the session with demo reflections.

## Features

- Weighted keyword mood analysis with confidence and a short mock AI summary.
- Dashboard insights: pulse score, risk level, streak, recent trend, common keywords, vibe mix.
- Search, category filter, and sorting.
- Inline edit/delete for reflections.
- Demo data loader.
- Loading skeleton, empty state, toast notifications, and API error state.
