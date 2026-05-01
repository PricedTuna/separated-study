# Spaced Study

A modern **spaced repetition** learning platform built with **React 19** and **Supabase**. Create documents, organize flashcard decks, and study with confidence-based repetition powered by the **FSRS** (Free Spaced Repetition Scheduler) algorithm.

## Purpose

Spaced Study helps you **remember more with less effort**. Instead of cramming before exams, the FSRS algorithm schedules reviews at the optimal time for long-term retention — reducing review time while improving memory.

## Why FSRS?

Traditional flashcards use fixed intervals (e.g., review every 3 days), but human memory doesn't work linearly. FSRS models memory with three variables:

- **Difficulty** — How hard the card is for you
- **Stability** — How long until you forget
- **Retrievability** — Probability of recall at any moment

The algorithm adapts per-card, scheduling difficult cards more often and easy cards less often.

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Framework** | React 19 + Vite |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI + CVA |
| **Icons** | Lucide React |
| **Routing** | React Router 7 |
| **Rich Text** | Milkdown CREPE |
| **Backend** | Supabase (Auth + PostgreSQL) |
| **Animation** | GSAP + @gsap/react |
| **Modals** | SweetAlert2 |
| **Storage** | Supabase (cloud) + localStorage (offline via adapter) |

## Features

### Authentication
- Email/password signup and login
- Protected routes via React Router
- Supabase Auth

### Documents
- Markdown editor (Milkdown CREPE)
- Create, edit, delete documents
- Organize in nested folders
- Generate flashcards from content

### Folders
- Hierarchical structure (parent-child)
- Nest unlimited levels deep

### Decks
- Group flashcards by subject
- Cascading delete
- Track statistics

### Study Session
- Flashcard flip UI with GSAP animations
- Self-rating: **Again**, **Hard**, **Good**, **Easy**
- Card states: `new` → `learning` → `review` → `relearning` → `graduated`

### Import/Export
- Export as `.spaced.json`
- Import with merge (no overwrite)
- Portable backup format

## Architecture

```
src/
├── domain/              # Models + repository interfaces
│   ├── models/         # Document, Deck, Card, Folder, CardReview
│   └── repositories/   # Abstract interfaces
├── services/           # Business logic (pure, no persistence)
├── infrastructure/     # Implementations
│   ├── supabase/      # Supabase repositories
│   └── localStorage/  # localStorage repositories
├── lib/
│   ├── storage/       # StorageAdapter (swap backends)
│   ├── container.ts  # Dependency injection
│   ├── fsrs.ts       # FSRS algorithm
│   └── supabase-client.ts
├── hooks/              # React hooks
├── components/
│   ├── ui/            # Button, Card, Input, etc.
│   ├── layouts/       # Dashboard layout
│   └── study/         # Study session
├── pages/              # Route pages
└── interfaces/supabase/  # Generated types
```

### Key Abstractions

- **Repository pattern** — Interfaces in `domain/`, implementations in `infrastructure/`
- **StorageAdapter** — Swap Supabase/localStorage without touching business logic
- **Services** — Pure business logic, no persistence awareness

## Data Models

```typescript
Document { id, title, content, folderId, createdAt, updatedAt }
Deck { id, name, description, createdAt, updatedAt }
Card { id, deckId, documentId, front, back, lastResult, createdAt, updatedAt }
Folder { id, name, parentId, userId, createdAt, updatedAt }
CardReview { id, cardId, userId, stability, difficulty, due, lastReview, interval, reps, lapses, state, updatedAt }
```

States: `new`, `learning`, `review`, `relearning`, `graduated`

## Getting Started

### Prerequisites
- Node.js 18+

### Installation
```bash
npm install
```

### Environment
Create `.env`:
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Commands
```bash
npm run dev     # Dev server
npm run build   # TypeScript + Vite build
npm run lint    # ESLint
npm run preview # Preview production build
```

## Routing

| Path | Description |
|------|-------------|
| `/login` | Login |
| `/signup` | Signup |
| `/dashboard/overview` | Dashboard home |
| `/dashboard/documents` | Documents |
| `/dashboard/documents/:id` | Document editor |
| `/dashboard/folders/:folderId` | Folder contents |
| `/dashboard/decks` | Decks |
| `/dashboard/decks/:id` | Deck detail + study |

## Storage Adapters

Swap backends in `src/lib/container.ts`:

```typescript
// Current default (Supabase)
import { DocumentSupabaseRepository } from "./infrastructure/supabase/document-supabase-repository"

// Switch to localStorage
import { DocumentLocalStorageRepository } from "./infrastructure/local-storage/document-local-storage-repository"
```

## References

- **FSRS algorithm**: `docs/fsrf.md`
- **Export format**: `docs/EXPORT_FORMAT.md`

## License

MIT