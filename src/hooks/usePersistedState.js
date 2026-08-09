import { useEffect, useRef, useState } from "react";

// Backs a useState with sessionStorage so in-progress form input survives a page
// refresh or the 10-minute idle sign-out (AuthContext) forcing a redirect — both would
// otherwise silently wipe a partially-filled registration. sessionStorage (not
// localStorage) so an abandoned draft doesn't outlive the browser tab/session.
// Pass `key: null` to disable persistence entirely (e.g. editing an existing record,
// where the form is populated from the server and a stale draft would be wrong).
export function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => {
    if (!key) return initialValue;
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if (!key) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full/unavailable (private browsing) — the draft just won't persist.
    }
  }, [key, state]);

  const clear = () => {
    if (!keyRef.current) return;
    try {
      sessionStorage.removeItem(keyRef.current);
    } catch {
      // ignore
    }
  };

  return [state, setState, clear];
}
