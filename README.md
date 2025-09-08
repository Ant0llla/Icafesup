# Dojo iCafe Dashboard

Full-stack dashboard for iCafe using React, Node.js and Prisma.

## Setup

```bash
cp .env.example .env
# fill ICAFE_* and TELEMETRY_INGEST_KEY
npm install
# SQLite is default; for Postgres set DATABASE_URL accordingly
npx prisma migrate dev --schema server/prisma/schema.prisma
npm run build
```

### Development

Run server and web in parallel:

```bash
npm run dev -w server
npm run dev -w web
```

## Docker Postgres

```bash
docker-compose up -d postgres
```

Configure `DATABASE_URL` to use the container.
