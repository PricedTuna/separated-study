# Spaced Study

A modern spaced repetition learning platform built as an alternative to Anki and Quizlet. Create documents, organize flashcard decks, and study with confidence-based repetition powered by the FSRS (Free Spaced Repetition Scheduler) algorithm.

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Framework** | React 19 + Vite |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI + Class Variance Authority (CVA) |
| **Icons** | Lucide React |
| **Routing** | React Router 7 |
| **Rich Text** | Milkdown (CREPE editor) |
| **Backend** | Supabase (Auth + PostgreSQL) |
| **Animation** | GSAP + @gsap/react |
| **Modals** | SweetAlert2 |
| **Storage** | Supabase (cloud) + localStorage (offline-capable via adapter) |

## Architecture

Clean Architecture with clear separation of concerns:

```
src/
├── domain/              # Business logic & models (framework-agnostic)
│   ├── models/          # Document, Deck, Card, Folder, CardReview
│   └── repositories/    # Repository interfaces
├── services/            # Business services (pure logic)
├── infrastructure/      # External implementations
│   ├── supabase/        # Supabase repositories
│   └── localStorage/   # localStorage repositories
├── lib/
│   ├── storage/         # StorageAdapter abstraction
│   ├── supabase-client.ts
│   ├── container.ts     # Dependency injection
│   └── fsrs.ts         # FSRS algorithm implementation
├── hooks/               # React hooks (useDataRefresh, etc.)
├── components/
│   ├── ui/             # Reusable primitives (Button, Card, Input, etc.)
│   ├── layouts/         # Dashboard layout
│   └── study/          # Study session components
├── pages/               # Route pages (login, signup, dashboard, etc.)
└── interfaces/
    └── supabase/        # Generated database types
```

**Key abstractions:**
- **Repository pattern** — Interfaces in `domain/repositories/`, implementations in `infrastructure/`
- **StorageAdapter** — Generic CRUD interface in `lib/storage/` enables swapping Supabase for localStorage/IndexedDB/API without touching business logic
- **Services** — Pure business logic with no persistence knowledge
- **FSRS module** — Standalone implementation of the FSRS algorithm for optimal review scheduling

## Features

### Authentication
- Email/password signup and login
- Protected routes with React Router guards
- Supabase Auth integration

### Documents
- Markdown editor powered by Milkdown CREPE
- Create, edit, and delete documents
- Organize documents in nested folders
- Study mode generates flashcards from document content

### Folders
- Hierarchical folder structure with parent-child relationships
- Organize documents by topic or subject
- Nested folder navigation

### Decks
- Group flashcards by topic or subject
- Create decks from documents or manually
- Cascading delete (deleting a deck removes all its cards)
- Track deck statistics

### Study Session (FSRS-Powered)
- Flashcard flip UI with smooth animations
- Self-rating system: **Again**, **Hard**, **Good**, **Easy**
- FSRS algorithm optimizes review intervals based on performance
- Tracks card state: `new` → `learning` → `review` → `graduated`
- Handles relearning for lapsed cards

### Import/Export
- Export all data as `.spaced.json`
- Import with merge capability (doesn't overwrite existing data)
- Portable JSON format for backup and sharing
- Format specification: see `docs/EXPORT_FORMAT.md`

## FSRS Algorithm

Spaced Study uses the **FSRS (Free Spaced Repetition Scheduler)** algorithm, a modern alternative to older algorithms like SM-2. FSRS models human memory using three key variables:

- **D (Difficulty)**: Card difficulty rating (0-1)
- **S (Stability)**: How stable the memory is (in days)
- **R (Retrievability)**: Probability of recalling the card at a given time

The algorithm calculates `R(t) = exp(-t / S)` and adjusts difficulty and stability based on your rating:

| Rating | Effect |
|--------|--------|
| Again | Reduces stability significantly, increases difficulty |
| Hard | Small stability increase, slight difficulty increase |
| Good | Normal stability increase, slight difficulty decrease |
| Easy | Large stability increase, significant difficulty decrease |

Learn more in `docs/fsrf.md`.

## Data Models

```typescript
Document {
  id: string
  title: string
  content: string        // markdown
  folderId: string | null
  createdAt: string      // ISO string
  updatedAt: string
}

Deck {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

Card {
  id: string
  deckId: string
  documentId: string | null
  front: string
  back: string
  lastResult: "again" | "hard" | "good" | "easy" | "unseen"
  createdAt: string
  updatedAt: string
}

Folder {
  id: string
  name: string
  parentId: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

CardReview {
  id: string
  cardId: string
  userId: string
  stability: number
  difficulty: number
  due: string            // ISO string
  lastReview: string     // ISO string
  interval: number       // days
  reps: number
  lapses: number
  state: "new" | "learning" | "review" | "relearning" | "graduated"
  updatedAt: string
}
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (for cloud sync)

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Routes

| Path | Description |
|------|-------------|
| `/login` | Login page |
| `/signup` | Signup page |
| `/dashboard/overview` | Dashboard home |
| `/dashboard/documents` | Documents list |
| `/dashboard/documents/:id` | Document editor |
| `/dashboard/folders/:folderId` | Folder contents |
| `/dashboard/folders/:folderId/:id` | Document in folder |
| `/dashboard/decks` | Decks list |
| `/dashboard/decks/:id` | Deck detail + study mode |

## Storage Adapters

The application uses a `StorageAdapter` interface that makes it easy to swap storage backends:

```typescript
interface StorageAdapter<T extends { id: string }> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(item: T): Promise<T>
  update(id: string, item: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}
```

**Available adapters:**
- `SupabaseAdapter` — Uses Supabase PostgreSQL backend (current default)
- `LocalStorageAdapter` — Browser localStorage (offline-capable)

To switch adapters, update the dependency injection container in `src/lib/container.ts`.

## Project Structure Highlights

- **Type-safe database**: Auto-generated Supabase types in `src/interfaces/supabase/database.types.ts`
- **Dependency injection**: Centralized in `src/lib/container.ts`
- **Responsive design**: Mobile-first with Tailwind CSS
- **Animations**: Page transitions and micro-interactions with GSAP
- **Component library**: Radix UI primitives styled with CVA for consistent theming

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## License

MIT
