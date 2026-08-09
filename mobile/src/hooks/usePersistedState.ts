import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Backs a useState with AsyncStorage so in-progress form input survives the app being
// backgrounded/killed or the 10-minute idle sign-out — both would otherwise silently
// wipe a partially-filled registration. Pass `key: null` to disable persistence (e.g.
// editing an existing record, where the form is populated from the server).
export function usePersistedState<T>(
  key: string | null,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [state, setState] = useState<T>(initialValue);
  const loadedRef = useRef(!key);
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          setState(JSON.parse(raw));
        } catch {
          // ignore corrupt draft
        }
      })
      .finally(() => {
        if (!cancelled) loadedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!key || !loadedRef.current) return;
    AsyncStorage.setItem(key, JSON.stringify(state)).catch(() => {
      // Storage unavailable — the draft just won't persist.
    });
  }, [key, state]);

  const clear = () => {
    if (!keyRef.current) return;
    AsyncStorage.removeItem(keyRef.current).catch(() => {});
  };

  return [state, setState, clear];
}
