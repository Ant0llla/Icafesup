import { PrismaClient } from '@prisma/client';
import {
  getActiveSessions,
  getCurrentCash,
  getMachines,
  getTransactions,
} from '../integrations/icafe';

const prisma = new PrismaClient();

export function startPoller() {
  // 30s machines and sessions
  setInterval(async () => {
    const machines = await getMachines();
    for (const m of machines) {
      await prisma.machine.upsert({
        where: { id: m.id },
        update: { name: m.name, zone: m.zone, inUse: m.inUse },
        create: { id: m.id, name: m.name, zone: m.zone, inUse: m.inUse },
      });
    }
    const sessions = await getActiveSessions();
    for (const s of sessions) {
      await prisma.session.upsert({
        where: { id: s.id },
        update: {
          machineId: s.machineId,
          startedAt: new Date(s.startedAt),
          ratePerHour: s.ratePerHour,
          promoCode: s.promoCode,
        },
        create: {
          id: s.id,
          machineId: s.machineId,
          startedAt: new Date(s.startedAt),
          ratePerHour: s.ratePerHour,
          promoCode: s.promoCode,
        },
      });
    }
    const now = new Date();
    for (const m of machines) {
      await prisma.occupancySnapshot.create({
        data: { machineId: m.id, inUse: m.inUse, ts: now },
      });
    }
  }, 30_000);

  // 60s cash
  setInterval(async () => {
    const cash = await getCurrentCash();
    await prisma.cashDrawer.create({
      data: {
        balance: cash.balance,
        currency: cash.currency,
        shiftId: cash.shiftId,
      },
    });
  }, 60_000);

  // 5m transactions
  setInterval(async () => {
    const to = new Date();
    const from = new Date(to.getTime() - 5 * 60 * 1000);
    const txs = await getTransactions(from, to);
    for (const t of txs) {
      await prisma.transaction.upsert({
        where: { id: t.id },
        update: {
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          ts: new Date(t.ts),
          cashierId: t.cashierId,
          sessionId: t.sessionId,
          promoCode: t.promoCode,
        },
        create: {
          id: t.id,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          ts: new Date(t.ts),
          cashierId: t.cashierId,
          sessionId: t.sessionId,
          promoCode: t.promoCode,
        },
      });
      if (t.promoCode) {
        await prisma.promoUse.create({
          data: {
            promoCode: t.promoCode,
            ts: new Date(t.ts),
            transactionId: t.id,
          },
        });
      }
    }
  }, 5 * 60 * 1000);
}
