import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { initialState, restoreState, STORAGE_KEY, type MobileState } from '../core/state';
import { createWriteQueue } from '../core/write-queue';

type Store = { state: MobileState; ready: boolean; warning: string; update: (fn: (value: MobileState) => MobileState) => void; reset: () => Promise<void> };
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState('');
  const queue = useRef(createWriteQueue(value => AsyncStorage.setItem(STORAGE_KEY, value)));
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!alive) return;
      const next = restoreState(raw); current.current = next; setState(next);
    }).catch(() => { if (alive) setWarning('Saved progress could not be loaded. Changes may last only for this session.'); }).finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);
  const update = useCallback((fn: (value: MobileState) => MobileState) => {
    const next = fn(current.current); current.current = next; setState(next);
    void queue.current(JSON.stringify(next)).catch(() => setWarning('This change could not be saved. Keep the app open to retain session progress.'));
  }, []);
  const reset = useCallback(async () => {
    const next = initialState(); current.current = next; setState(next);
    try { await queue.current(JSON.stringify(next)); setWarning(''); }
    catch { setWarning('Saved data could not be cleared. Please try again.'); throw new Error('Device storage did not confirm deletion.'); }
  }, []);
  return <Context.Provider value={{ state, ready, warning, update, reset }}>{children}</Context.Provider>;
}
export function useStore() { const store = useContext(Context); if (!store) throw new Error('StoreProvider required'); return store; }
