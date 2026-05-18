<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Project structure

- **Main app**: `/workspace/medguard-ai/` — Next.js 16.2.6 (App Router, Turbopack) with React 19
- **Chrome extension**: `/workspace/medguard-ai/chrome-extension/` — Vite + React (Manifest V3)

### Running the app

- `npm run dev` starts the dev server on port 3000 (from `/workspace/medguard-ai/`)
- Demo mode is **auto-enabled** in development (`NODE_ENV=development`): no Supabase, OpenAI, Anthropic, or Stripe keys needed. The app uses cookie-based auth as "Dr. Maya Chen" and a mock SOAP generator.
- The Chrome extension is built separately: `cd chrome-extension && npm run build`

### Key commands (from `/workspace/medguard-ai/`)

| Task | Command |
|------|---------|
| Lint | `npm run lint` |
| Build | `npm run build` |
| Dev server | `npm run dev` |
| Chrome ext build | `cd chrome-extension && npm run build` |
| Chrome ext typecheck | `cd chrome-extension && npm run typecheck` |

### Caveats

- No external services required for development; all integrations (Supabase, OpenAI/Anthropic, Stripe) fall back to mocks/demo data.
- The build uses Turbopack and compiles in ~7s; TypeScript checking runs during build.
- ESLint config uses flat config (eslint v9+); run `npm run lint` (no `--` flags needed).
