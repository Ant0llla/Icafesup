import create from 'zustand';

interface Period {
  from: Date;
  to: Date;
}

interface Store {
  period: Period;
  setPeriod: (from: Date, to: Date) => void;
}

export const useStore = create<Store>((set) => ({
  period: { from: new Date(), to: new Date() },
  setPeriod: (from, to) => set({ period: { from, to } }),
}));
