# AGENTS.md

High-signal, repo-specific guidance for OpenCode agents.

## Setup
- Create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Vite requires `VITE_` prefix for client-side env vars)
- No test framework installed — no test scripts exist

## Commands
- `npm run dev`: Start Vite dev server
- `npm run build`: Runs `tsc -b` (TypeScript check) then Vite build
- `npm run lint`: ESLint with React Hooks + Refresh plugins

## Path Aliases
`@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`). Use for all src imports.

## Architecture
- Clean Architecture: `domain/` (models, repo interfaces) → `infrastructure/` (implementations) → `lib/` (adapters, DI, FSRS)
- Swap storage backends (Supabase/localStorage) via `src/lib/container.ts` (adapter interface: `src/lib/storage/storage-adapter.ts`)
- Supabase types auto-generated in `src/interfaces/supabase/database.types.ts` — DO NOT edit manually
- FSRS algorithm in `src/lib/fsrs.ts`, docs in `docs/fsrf.md`

## Conventions
- Tailwind 4 uses `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- TypeScript enforces `noUnusedLocals`/`noUnusedParameters`
- Dependency injection centralized in `src/lib/container.ts`

## References
- `README.md`: Full features, stack, data models
- `docs/EXPORT_FORMAT.md`: Import/export spec
- `docs/fsrf.md`: FSRS algorithm details
