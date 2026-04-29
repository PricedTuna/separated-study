import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { BrainCircuit, Folder, Loader2, Plus, Search, AlertCircle, ArrowUpDown } from "lucide-react"
import { useDecks } from "../hooks/use-decks"
import { useDataRefresh } from "../hooks/use-data-refresh"
import { deckService } from "../lib/container"
import { PageHeader, EmptyState, LoadingState, PageContainer } from "../components/ui/page"
import { Dialog } from "../components/ui/dialog"
import { ListItem } from "../components/ui/list-item"
import { StudySession } from "../components/study/study-session"
import type { CreateDeckInput } from "../domain/models/deck"
import type { Card, CardResult } from "../domain/models/card"
import { cardService } from "../lib/container"
import type { Deck } from "../domain/models/deck"

type DeckSort = "recent" | "name"

export function DecksPage() {
  const { decks, loading, error: decksError, create, reload } = useDecks()
  const navigate = useNavigate()
  const { refreshKey } = useDataRefresh()
  const didMountRef = useRef(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<DeckSort>("recent")

  // Global study state
  const [globalCards, setGlobalCards] = useState<Card[]>([])
  const [globalDueCards, setGlobalDueCards] = useState<Card[]>([])
  const [studyType, setStudyType] = useState<"srs" | "free" | null>(null)

  // Reload data when refresh is triggered (e.g., after import)
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    reload()
  }, [refreshKey, reload])

  // Load global cards
  const loadGlobalCards = async () => {
    const [all, due] = await Promise.all([
      cardService.getAll(),
      cardService.getStudyCards()
    ])
    setGlobalCards(all)
    setGlobalDueCards(due)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGlobalCards()
  }, [refreshKey])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const input: CreateDeckInput = { name: form.name, description: form.description }
      const deck = await create(input)
      setForm({ name: "", description: "" })
      setShowForm(false)
      navigate(`/dashboard/decks/${deck.id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  function handleCancel() {
    setShowForm(false)
  }

  function handleExited() {
    setForm({ name: "", description: "" })
    setError(null)
  }

  async function handleDelete(id: string) {
    setDeletingDeckId(id)
    try {
      await deckService.delete(id)
      reload()
      await loadGlobalCards()
    } finally {
      setDeletingDeckId(null)
    }
  }

  async function handleStudyResult(cardId: string, result: CardResult) {
    if (studyType === "srs") {
      await cardService.recordResult(cardId, result)
      await loadGlobalCards()
    }
  }

  const exitStudy = () => {
    setStudyType(null)
  }

  const description = decks.length === 0
    ? "No decks yet"
    : `${decks.length} deck${decks.length !== 1 ? "s" : ""}`

  const cardCountByDeck = globalCards.reduce<Record<string, number>>((acc, card) => {
    acc[card.deckId] = (acc[card.deckId] ?? 0) + 1
    return acc
  }, {})

  const dueCountByDeck = globalDueCards.reduce<Record<string, number>>((acc, card) => {
    acc[card.deckId] = (acc[card.deckId] ?? 0) + 1
    return acc
  }, {})

  const normalizedQuery = query.trim().toLowerCase()
  const visibleDecks = decks
    .filter((deck) => matchesQuery(deck, normalizedQuery))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return b.updatedAt.localeCompare(a.updatedAt)
    })

  if (studyType) {
    return (
      <StudySession
        mode={studyType}
        initialCards={studyType === "srs" ? globalDueCards : globalCards}
        onResult={handleStudyResult}
        onExit={exitStudy}
      />
    )
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <PageHeader
          title="Decks"
          description={description}
          buttonLabel="New deck"
          onButtonClick={() => setShowForm(true)}
          buttonId="create-deck-btn"
        />
        {(globalCards.length > 0 || globalDueCards.length > 0) && (
          <div className="card-miro p-3 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#888c9e] mb-2">Quick Study</p>
            <div className="flex flex-wrap items-center gap-2">
            {globalCards.length > 0 && (
              <button
                onClick={() => setStudyType("free")}
                className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap"
              >
                Free Mode
              </button>
            )}
            {globalDueCards.length > 0 && (
              <button
                onClick={() => setStudyType("srs")}
                className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <BrainCircuit className="w-4 h-4 shrink-0" />
                Global Study ({globalDueCards.length})
              </button>
            )}
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) handleCancel()
          else setShowForm(true)
        }}
        onExited={handleExited}
        title="New deck"
        description="Create a deck to organize related flashcards."
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="deck-name-input" className="text-xs font-medium text-[#555a6a]">Name</label>
              <input
                id="deck-name-input"
                autoFocus
                type="text"
                placeholder="Deck name..."
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="input-miro w-full text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="deck-description-input" className="text-xs font-medium text-[#555a6a]">
                Description <span className="text-[#a5a8b5] font-normal">(optional)</span>
              </label>
              <input
                id="deck-description-input"
                type="text"
                placeholder="Deck description..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="input-miro w-full text-sm"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={handleCancel} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.name.trim() || creating}
              className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create deck
            </button>
          </div>
        </form>
      </Dialog>

      {loading ? (
        <LoadingState />
      ) : decksError ? (
        <EmptyState
          icon={<AlertCircle className="w-8 h-8" />}
          iconBgColor="bg-[#fff3f3]"
          iconColor="text-[#d75252]"
          title="We couldn't load your decks"
          description={decksError}
          buttonLabel="Retry"
          onButtonClick={() => reload()}
        />
      ) : decks.length === 0 ? (
        <EmptyState
          icon={<Folder className="w-8 h-8" />}
          iconBgColor="bg-[#eef0ff]"
          iconColor="text-[#5b76fe]"
          title="No decks yet"
          description="Create your first deck to organize your flashcards"
          buttonLabel="Create deck"
          onButtonClick={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          <div className="card-miro p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a5a8b5]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-miro w-full pl-10! pr-3 py-2 text-sm"
                  placeholder="Search decks..."
                />
              </div>
              <button
                onClick={() => setSortBy((prev) => (prev === "recent" ? "name" : "recent"))}
                className="btn-secondary text-sm flex items-center gap-1.5 justify-center"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort: {sortBy === "recent" ? "Recent" : "A-Z"}
              </button>
            </div>
          </div>

          {visibleDecks.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              iconBgColor="bg-[#eef0ff]"
              iconColor="text-[#5b76fe]"
              title="No matching decks"
              description="Try a different search or clear the filter."
              buttonLabel="Clear search"
              onButtonClick={() => setQuery("")}
            />
          ) : (
            <div className="grid gap-3">
          {visibleDecks.map((deck: Deck, i) => (
            <ListItem
              key={deck.id}
              icon={<Folder className="w-5 h-5" />}
              iconBgColor="bg-[#ffd8f4]"
              iconColor="text-[#c050a0]"
              title={deck.name}
              subtitle={
                <div className="flex flex-wrap items-center gap-2">
                  {deck.description && <span className="truncate max-w-[220px]">{deck.description}</span>}
                  <span className="rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[11px] text-[#555a6a]">
                    {cardCountByDeck[deck.id] ?? 0} cards
                  </span>
                  <span className="rounded-full bg-[#eef0ff] px-2 py-0.5 text-[11px] text-[#4a5fef]">
                    {dueCountByDeck[deck.id] ?? 0} due
                  </span>
                </div>
              }
              onClick={() => navigate(`/dashboard/decks/${deck.id}`)}
              onDelete={() => handleDelete(deck.id)}
              deleting={deletingDeckId === deck.id}
              deleteConfirmMessage={`Delete "${deck.name}"? All cards in this deck will also be deleted.`}
              animationDelay={i * 50}
            />
          ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
}

function matchesQuery(deck: Deck, normalizedQuery: string) {
  if (!normalizedQuery) return true
  const name = deck.name.toLowerCase()
  const description = deck.description?.toLowerCase() ?? ""
  return name.includes(normalizedQuery) || description.includes(normalizedQuery)
}
