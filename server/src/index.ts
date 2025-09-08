import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { startPoller } from './jobs/poller';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// REST API
app.get('/api/cash/current', async (_req, res) => {
  const cash = await prisma.cashDrawer.findFirst({
    orderBy: { ts: 'desc' },
  });
  res.json(cash);
});

app.get('/api/pcs/occupied', async (_req, res) => {
  const count = await prisma.machine.count({ where: { inUse: true } });
  res.json({ occupied: count });
});

app.get('/api/pcs/temperatures', async (_req, res) => {
  const temps = await prisma.temperature.findMany({
    orderBy: { ts: 'desc' },
  });
  res.json(temps);
});

app.get('/api/revenue', async (req, res) => {
  const { from, to, groupBy } = req.query as Record<string, string>;
  const where = from && to ? { ts: { gte: new Date(from), lte: new Date(to) } } : {};
  if (groupBy === 'pc') {
    const data = await prisma.transaction.groupBy({
      by: ['sessionId'],
      _sum: { amount: true },
      where,
    });
    res.json(data);
  } else {
    const total = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where,
    });
    res.json(total);
  }
});

app.get('/api/promos/stats', async (req, res) => {
  const { from, to } = req.query as Record<string, string>;
  const data = await prisma.transaction.groupBy({
    by: ['promoCode'],
    _count: { _all: true },
    where: {
      promoCode: { not: null },
      ts: { gte: new Date(from), lte: new Date(to) },
    },
  });
  res.json(data);
});

app.get('/api/occupancy/heatmap', async (req, res) => {
  const { from, to } = req.query as Record<string, string>;
  const snapshots = await prisma.occupancySnapshot.findMany({
    where: {
      ts: { gte: new Date(from), lte: new Date(to) },
    },
  });
  res.json(snapshots);
});

app.get('/api/stream', async (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();
  const send = async () => {
    const cash = await prisma.cashDrawer.findFirst({ orderBy: { ts: 'desc' } });
    const occupied = await prisma.machine.count({ where: { inUse: true } });
    const temps = await prisma.temperature.findMany({ orderBy: { ts: 'desc' } });
    res.write(`data: ${JSON.stringify({ cash, occupied, temps })}\n\n`);
  };
  await send();
  const interval = setInterval(send, 5000);
  _req.on('close', () => clearInterval(interval));
});

app.post('/api/telemetry/ingest', async (req, res) => {
  const key = req.header('x-ingest-key');
  if (key !== process.env.TELEMETRY_INGEST_KEY) {
    return res.status(403).end();
  }
  const schema = z.array(
    z.object({
      machineId: z.string(),
      value: z.number(),
      ts: z.string().transform((v) => new Date(v)),
    }),
  );
  const metrics = schema.parse(req.body);
  await prisma.temperature.createMany({
    data: metrics.map((m) => ({ machineId: m.machineId, value: m.value, ts: m.ts })),
  });
  res.json({ inserted: metrics.length });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
startPoller();
