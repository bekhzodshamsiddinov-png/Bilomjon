import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Ilova holati faqat XOTIRADA. Hech narsa qurilmaga yoki serverga saqlanmaydi:
 * 1-bosqichda haqiqiy bola ma'lumotlari yig'ilmaydi (docs/PRIVACY_ARCHITECTURE.md).
 */
interface AppState {
  grade: 1 | 2 | 3 | 4;
  setGrade: (g: 1 | 2 | 3 | 4) => void;
  parentUnlocked: boolean;
  unlockParent: () => void;
  lockParent: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [grade, setGrade] = useState<1 | 2 | 3 | 4>(2);
  const [parentUnlocked, setUnlocked] = useState(false);
  const value = useMemo(
    () => ({ grade, setGrade, parentUnlocked, unlockParent: () => setUnlocked(true), lockParent: () => setUnlocked(false) }),
    [grade, parentUnlocked],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('AppProvider yo‘q');
  return v;
}
