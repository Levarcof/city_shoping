// app/utils/geolocation.js
//
// Central place for reading the user's location.
//
// Why this file exists:
// Previously each page called `navigator.geolocation.getCurrentPosition`
// independently, once, on mount. That created a race condition: if the
// user tapped a category / "Shop now" before the async GPS callback had
// resolved, `lat`/`lng` were still `null`, so the click handler pushed a
// URL to /shops WITHOUT lat/lng — and the shops page silently skipped
// fetching (`if (!lat || !lng || !category) return;`), so nothing loaded.
//
// This helper fixes that by:
// 1. Caching a resolved location in sessionStorage for a few minutes, so
//    navigating Home -> Shops (or refreshing Shops) doesn't need to wait
//    on the GPS again — this also makes things noticeably faster.
// 2. De-duping concurrent calls, so multiple rapid clicks / mounted
//    components share a single in-flight request instead of firing many.
// 3. Returning a Promise, so callers (e.g. a category click handler) can
//    `await` a guaranteed-fresh location before navigating, instead of
//    trusting whatever happened to already be in state.

const CACHE_KEY = "lm_user_location";
const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

function readCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.lat !== "number" || typeof parsed.lng !== "number") {
      return null;
    }
    if (Date.now() - parsed.ts > CACHE_MAX_AGE_MS) return null;
    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
}

function writeCache(lat, lng) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ lat, lng, ts: Date.now() }));
  } catch {
    // sessionStorage can throw in private-mode / quota-exceeded cases — safe to ignore
  }
}

let inFlight = null;

/**
 * Resolves with { lat, lng } or rejects with an Error / GeolocationPositionError.
 *
 * @param {Object} opts
 * @param {number} opts.timeout - ms to wait for the browser before giving up
 * @param {boolean} opts.forceFresh - skip the session cache and ask the GPS again
 */
export function getUserLocation({ timeout = 8000, forceFresh = false } = {}) {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.reject(new Error("Geolocation not supported"));
  }

  if (!forceFresh) {
    const cached = readCache();
    if (cached) return Promise.resolve(cached);
  }

  if (inFlight) return inFlight;

  inFlight = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        writeCache(coords.lat, coords.lng);
        inFlight = null;
        resolve(coords);
      },
      (err) => {
        inFlight = null;
        reject(err);
      },
      // enableHighAccuracy: false -> resolves noticeably faster on most
      // devices and is plenty precise for "shops near me" style radius search.
      // maximumAge: allow the browser to hand back a recent OS-level fix
      // instead of forcing a brand new GPS read every time.
      { enableHighAccuracy: false, timeout, maximumAge: 300000 }
    );
  });

  return inFlight;
}

/** Synchronous, cache-only read — never prompts, never rejects loudly. */
export function getCachedLocation() {
  return readCache();
}