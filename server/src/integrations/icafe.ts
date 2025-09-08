import axios from 'axios';

type Cash = { balance: number; currency: string; shiftId?: string };
type Machine = { id: string; name: string; zone?: string; inUse: boolean };
type Session = {
  id: string;
  machineId: string;
  startedAt: string;
  ratePerHour: number;
  promoCode?: string;
};
type Transaction = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  ts: string;
  cashierId?: string;
  sessionId?: string;
  promoCode?: string;
};

declare const globalFetch: typeof fetch;

const baseURL = process.env.ICAFE_BASE_URL || '';
const apiKey = process.env.ICAFE_API_KEY || '';

const client = axios.create({
  baseURL,
  headers: { 'X-API-Key': apiKey },
});

export async function getCurrentCash(): Promise<Cash> {
  try {
    const { data } = await client.get('/cash/current');
    return data as Cash;
  } catch {
    // TODO: replace with real API call
    return { balance: 0, currency: 'USD' };
  }
}

export async function getMachines(): Promise<Machine[]> {
  try {
    const { data } = await client.get('/machines');
    return data as Machine[];
  } catch {
    // TODO: replace with real API call
    return [];
  }
}

export async function getActiveSessions(): Promise<Session[]> {
  try {
    const { data } = await client.get('/sessions/active');
    return data as Session[];
  } catch {
    // TODO: replace with real API call
    return [];
  }
}

export async function getTransactions(from: Date, to: Date): Promise<Transaction[]> {
  try {
    const { data } = await client.get('/transactions', {
      params: { from: from.toISOString(), to: to.toISOString() },
    });
    return data as Transaction[];
  } catch {
    // TODO: replace with real API call
    return [];
  }
}

export async function temperatures(): Promise<null> {
  // iCafe API may not support temperatures
  return null;
}

export type { Cash, Machine, Session, Transaction };
