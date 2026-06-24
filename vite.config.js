// Dev-only (local preview via `npx vite`). Vercel ignores this (framework:null,
// serves /public statically). no-store guarantees the browser always fetches
// fresh files during testing.
export default {
  server: {
    headers: { 'Cache-Control': 'no-store' },
  },
};
