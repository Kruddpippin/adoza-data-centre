// Remembers which login portal (candidate vs staff) the visitor picked on the homepage,
// so any mid-session redirect back to /login (session expiry, sign-out, a stale bookmark)
// returns them to the same portal instead of silently falling back to the candidate one.
// Deliberately sessionStorage, not localStorage — the choice should reset with a fresh
// browser session, not follow the visitor forever.
const KEY = "adoza-portal";

export function getStoredPortal() {
  try {
    return sessionStorage.getItem(KEY) === "staff" ? "staff" : "youth";
  } catch {
    return "youth";
  }
}

export function setStoredPortal(mode) {
  try {
    sessionStorage.setItem(KEY, mode === "staff" ? "staff" : "youth");
  } catch {
    // Storage unavailable (private browsing, disabled cookies) — the portal just won't
    // survive a redirect in that case, which is a harmless degradation.
  }
}
