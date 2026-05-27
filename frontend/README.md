# RestoOrderHub Frontend

Next.js 15 React додаток для ресторанної платформи бронювання столиків.

## Технології

- Next.js 15
- React 19
- Redux Toolkit + RTK Query
- React Hook Form + Zod
- Recharts
- date-fns

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Docker

```bash
docker build -t resto-order-hub-frontend .
docker run -p 20001:3000 --env-file .env resto-order-hub-frontend
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g., https://site-1.phfk.college/api) |

See `.env.example` for full configuration.