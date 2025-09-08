import { useEffect, useState } from 'react';

type Stream = {
  cash?: { balance: number; currency: string } | null;
  occupied?: number;
  temps?: Array<{ machineId: string; value: number }>;
};

export default function Dashboard() {
  const [data, setData] = useState<Stream>({});
  useEffect(() => {
    const es = new EventSource('/api/stream');
    es.onmessage = (e) => setData(JSON.parse(e.data));
    return () => es.close();
  }, []);
  return (
    <div>
      <h1>Dashboard</h1>
      <div>Cash: {data.cash?.balance ?? 0}</div>
      <div>Occupied: {data.occupied ?? 0}</div>
    </div>
  );
}
