# Spaced Study

Anki/Quizlet alternative for spaced repetition learning. Create documents, build flashcard decks, and study with confidence-based repetition.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 19 + Vite |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI + CVA |
| **Icons** | Lucide React |
| **Routing** | React Router 7 |
| **Rich Text** | Milkdown (CREPE editor) |
| **Storage** | localStorage (swappable via adapter) |

## Architecture

Clean Architecture con separación de responsabilidades:

```
src/
├── domain/           # Business logic & models
│   ├── models/       # Document, Deck, Card
│   └── repositories/ # Repository interfaces
├── services/         # Business services
├── infrastructure/   # Implementations (localStorage, future: API/IndexedDB)
├── lib/
│   ├── storage/      # StorageAdapter abstraction
│   └── container.ts  # Dependency injection
├── hooks/            # React hooks
├── components/       # UI components
│   └── ui/           # Reusable primitives (Button, Card, Input...)
└── pages/            # Route pages
```

**Key abstractions:**
- **Repository pattern** — interfaces in `domain/repositories/`, implementations in `infrastructure/`
- **StorageAdapter** — generic CRUD interface in `lib/storage/` enables swapping localStorage for IndexedDB/API without touching business logic
- **Services** — pure business logic, no persistence knowledge

## Features

### Documents
- Markdown editor with Milkdown
- Create, edit, delete documents
- Study mode generates flashcards from document content

### Decks
- Group flashcards by topic
- Create decks from documents or manually
- Cascading delete (deleting deck removes all cards)

### Study Session
- Flashcard flip UI
- Self-rate: remembered / forgot
- Tracks `lastResult` per card

### Import/Export
- Export all data as `.spaced.json`
- Import with merge (doesn't overwrite existing)
- Format spec: see `docs/EXPORT_FORMAT.md`

## Data Models

```typescript
Document { id, title, content, createdAt, updatedAt }
Deck     { id, name, description, createdAt, updatedAt }
Card     { id, deckId, documentId?, front, back, lastResult, createdAt, updatedAt }
```

## Getting Started

```bash
npm install
npm run dev
```

## Routes

| Path | Description |
|------|-------------|
| `/login` | Login page |
| `/signup` | Signup page |
| `/dashboard/documents` | Documents list |
| `/dashboard/documents/:id` | Document editor |
| `/dashboard/decks` | Decks list |
| `/dashboard/decks/:id` | Deck detail + study mode |
| `/dashboard/overview` | Dashboard home |

## Storage

Currently uses **localStorage**. To switch to IndexedDB, implement the `StorageAdapter` interface:

```typescript
interface StorageAdapter<T extends { id: string }> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(item: T): Promise<T>
  update(id: string, item: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}
```

See `src/lib/storage/storage-adapter.ts` and `src/lib/storage/local-storage-adapter.ts`.