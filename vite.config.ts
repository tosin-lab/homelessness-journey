import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Offline caching (service worker) is deliberately switched off: the site is invite-only, and a cached
// copy would let someone keep using it after their access code was removed.
export default defineConfig({
  plugins: [react()]
});
