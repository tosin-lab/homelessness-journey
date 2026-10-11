import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Read FIREBASE_CONFIG (JSON or the `{ apiKey: "...", ... }` snippet from the Firebase console). */
function firebaseConfig() {
  const raw = process.env.FIREBASE_CONFIG;
  if (!raw) return null;
  const out: Record<string, string> = {};
  for (const m of raw.matchAll(/["']?(\w+)["']?\s*:\s*["']([^"']*)["']/g)) out[m[1]] = m[2];
  if (!out.apiKey || !out.authDomain || !out.projectId) return null;
  return { apiKey: out.apiKey, authDomain: out.authDomain, projectId: out.projectId, appId: out.appId ?? "" };
}

// Offline caching (service worker) is deliberately switched off: the site is invite-only, and a cached
// copy would let someone keep using it after their account was removed.
export default defineConfig({
  plugins: [react()],
  define: {
    __FIREBASE_CONFIG__: JSON.stringify(firebaseConfig())
  }
});
