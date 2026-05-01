# AGENTS.md

High-signal, repo-specific guidance for OpenCode agents.

## Setup
- Create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Vite requires `VITE_` prefix for client-side env vars)
- App throws at runtime if these are missing — no fallback

## Commands
- `npm run dev`: Start Vite dev server
- `npm run build`: Runs `tsc -b` (TypeScript check) then Vite build
- `npm run lint`: ESLint with React Hooks + Refresh plugins
- Preview: `npm run preview`

## Path Aliases
`@/` maps to `src/` (configured in `vite.config.ts`). Use for all src imports.

## Architecture
- **Clean Architecture**: `domain/` (models, repo interfaces) → `services/` (pure business logic) → `infrastructure/` (Supabase/localStorage implementations)
- **Storage swap**: Edit `src/lib/container.ts` to switch between Supabase and localStorage adapters
- Supabase types auto-generated in `src/interfaces/supabase/database.types.ts` — DO NOT edit manually
- FSRS algorithm in `src/lib/fsrs.ts`, docs in `docs/fsrf.md`

## Conventions
- Tailwind 4 uses `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- TypeScript enforces `noUnusedLocals`/`noUnusedParameters`
- Dependency injection in `src/lib/container.ts`
- Routes in `src/pages/`, components in `src/components/`, hooks in `src/hooks/`

## References
- `README.md`: Full features, stack, data models
- `docs/EXPORT_FORMAT.md`: Import/export spec
- `docs/fsrf.md`: FSRS algorithm details
