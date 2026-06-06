import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Plus, Loader2, CreditCard, Check, Eye, Trash2, BrainCircuit, Search, Pencil, LayoutGrid, List } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)
import { cardService, deckService, documentService } from "../lib/container"
import { useDataRefresh } from "../hooks/use-data-refresh"
import { confirmDelete } from "../lib/swal"
import type { Deck } from "../domain/models/deck"
import type { Card, CardResult } from "../domain/models/card"
import type { CardReview } from "../domain/models/card-review"
import type { Document } from "../domain/models/document"
import { BackButton } from "@/components/ui/BackButton"
import { CardFormDialog, type CardFormValues } from "@/components/cards/CardFormDialog"
import { StudySession } from "@/components/study/StudySession"

const EMPTY: CardFormValues = { front: "", back: "", deckId: "", documentId: "" }
type CardFilter = "all" | "due" | "new" | "learning"
type CardSort = "recent" | "front"
type CardsView = "grid" | "list"

export function DeckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { refreshKey } = useDataRefresh()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [dueCards, setDueCards] = useState<(Card & { review?: CardReview | null })[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CardFormValues>(EMPTY)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [filterBy, setFilterBy] = useState<CardFilter>("all")
  const [sortBy, setSortBy] = useState<CardSort>("recent")
  const [cardsView, setCardsView] = useState<CardsView>("grid")

  // Study mode state
  const [studyType, setStudyType] = useState<"srs" | "free" | null>(null)

  const load = useCallback(async () => {
    if (!id) return

    const [deckData, cardsData, docsData, studyData] = await Promise.all([
      deckService.getById(id),
      cardService.getByDeckId(id),
      documentService.getAll(),
      cardService.getStudyCards(id),
    ])

    if (!deckData) {
      navigate("/dashboard/decks")
      return
    }

    setDeck(deckData)
    setCards(cardsData)
    setDueCards(studyData)
    setDocuments(docsData)
    setLoading(false)
  }, [id, navigate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  // Also reload when refresh is triggered (e.g., after import)
  useEffect(() => {
    if (refreshKey > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load()
    }
  }, [refreshKey, load])

  async function handleCreate(values: CardFormValues) {
    if (!id) return
    setError(null)
    setCreating(true)
    try {
      if (editingCardId) {
        await cardService.update(editingCardId, {
          front: values.front,
          back: values.back,
          documentId: values.documentId || null,
        })
      } else {
        await cardService.create({
          front: values.front,
          back: values.back,
          deckId: values.deckId || id,
          documentId: values.documentId || null,
        })
      }
      setForm(EMPTY)
      setShowForm(false)
      const [cardsData, studyData] = await Promise.all([
        cardService.getByDeckId(id),
        cardService.getStudyCards(id)
      ])
      setCards(cardsData)
      setDueCards(studyData)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  async function handleResult(cardId: string, result: CardResult) {
    if (studyType === "srs") {
      await cardService.recordResult(cardId, result)
      const [cardsData, studyData] = await Promise.all([
        cardService.getByDeckId(id!),
        cardService.getStudyCards(id!)
      ])
      setCards(cardsData)
      setDueCards(studyData)
      
      if (studyData.length === 0) {
        setTimeout(() => exitStudy(), 500)
      }
    }
  }

  async function handleDelete(cardId: string) {
    const card = cards.find(c => c.id === cardId)
    const { isConfirmed } = await confirmDelete(
      'the card',
      card ? `Delete the card "${card.front.substring(0, 30)}${card.front.length > 30 ? '...' : ''}"?` : undefined
    )
    if (!isConfirmed) return
    
    await cardService.delete(cardId)
    const [cardsData, studyData] = await Promise.all([
      cardService.getByDeckId(id!),
      cardService.getStudyCards(id!)
    ])
    setCards(cardsData)
    setDueCards(studyData)
  }

  function toggleFlip(cardId: string) {
    const isCurrentlyFlipped = flipped[cardId] ?? false
    
    // Minimalist flip animation targeting the specific card content
    const tl = gsap.timeline()
    tl.to(`[data-card-id="${cardId}"] .card-inner`, {
      opacity: 0,
      scale: 0.98,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        setFlipped((p) => ({ ...p, [cardId]: !isCurrentlyFlipped }))
      }
    }).to(`[data-card-id="${cardId}"] .card-inner`, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    })
  }

  const startStudy = (type: "srs" | "free") => {
    setStudyType(type)
    setFlipped({})
  }

  const exitStudy = () => {
    setStudyType(null)
    setFlipped({})
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingCardId(null)
  }

  const handleExited = () => {
    setForm(EMPTY)
    setError(null)
    setEditingCardId(null)
  }

  function openEditForm(card: Card) {
    setEditingCardId(card.id)
    setForm({
      front: card.front,
      back: card.back,
      deckId: card.deckId,
      documentId: card.documentId ?? "",
    })
    setShowForm(true)
  }

  const resultColor: Record<string, string> = {
    easy: "text-blue-500",
    good: "text-green-500",
    hard: "text-orange-500",
    again: "text-red-500",
    unseen: "text-[#a5a8b5]",
  }
  const resultLabel: Record<string, string> = {
    easy: "Easy",
    good: "Good",
    hard: "Hard",
    again: "Again",
    unseen: "New",
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#5b76fe]" />
      </div>
    )
  }

  // Study mode via StudySession
  if (studyType) {
    return (
      <StudySession
        mode={studyType}
        initialCards={studyType === "srs" ? dueCards : cards}
        onResult={handleResult}
        onExit={exitStudy}
      />
    )
  }

  const dueCardIds = new Set(dueCards.map((card) => card.id))
  const normalizedQuery = query.trim().toLowerCase()
  const visibleCards = cards
    .filter((card) => {
      if (normalizedQuery && !`${card.front} ${card.back}`.toLowerCase().includes(normalizedQuery)) {
        return false
      }
      if (filterBy === "due") return dueCardIds.has(card.id)
      if (filterBy === "new") return card.lastResult === "unseen"
      if (filterBy === "learning") return card.lastResult === "again" || card.lastResult === "hard"
      return true
    })
    .sort((a, b) => {
      if (sortBy === "front") return a.front.localeCompare(b.front)
      return b.updatedAt.localeCompare(a.updatedAt)
    })

  return (
    <div className="mx-auto w-full max-w-5xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-3 border-b border-[#e9eaef] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <BackButton
            onClick={() => navigate("/dashboard/decks")}
          />
          <h1 className="min-w-0 truncate text-lg font-medium text-[#1c1c1e]">
            {deck?.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setEditingCardId(null)
              setForm({ ...EMPTY, deckId: id ?? "" })
              setShowForm(true)
            }}
            className="btn-primary flex items-center gap-1.5 text-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            Add Card
          </button>
        </div>
      </div>

      {/* Action Row */}
      {cards.length > 0 && (
        <div className="px-4 pt-4 sm:px-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="card-miro p-3 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#888c9e] mb-2">Study</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => startStudy("free")}
                className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap"
              >
                Free Mode
              </button>
              {dueCards.length > 0 ? (
                <button
                  onClick={() => startStudy("srs")}
                  className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <BrainCircuit className="w-4 h-4 shrink-0" />
                  Study ({dueCards.length} due)
                </button>
              ) : (
                <button
                  disabled
                  className="btn-secondary flex items-center gap-2 text-sm opacity-50 cursor-not-allowed whitespace-nowrap"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  All caught up!
                </button>
              )}
            </div>
          </div>

          <div className="card-miro p-3 sm:p-4 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a5a8b5]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-miro w-full pl-10! py-2 text-sm"
                  placeholder="Search cards..."
                />
              </div>
              <div className="inline-flex rounded-lg border border-[#c7cad5] p-1 bg-white">
                <button
                  onClick={() => setCardsView("grid")}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${cardsView === "grid" ? "bg-[#eef0ff] text-[#4a5fef]" : "text-[#555a6a]"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCardsView("list")}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${cardsView === "list" ? "bg-[#eef0ff] text-[#4a5fef]" : "text-[#555a6a]"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "due", "new", "learning"] as CardFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilterBy(value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filterBy === value ? "border-[#5b76fe] bg-[#eef0ff] text-[#4a5fef]" : "border-[#c7cad5] text-[#555a6a]"}`}
                >
                  {value === "all" ? "All" : value === "due" ? "Due" : value === "new" ? "New" : "Learning"}
                </button>
              ))}
              <button
                onClick={() => setSortBy((prev) => (prev === "recent" ? "front" : "recent"))}
                className="btn-secondary text-xs"
              >
                Sort: {sortBy === "recent" ? "Recent" : "A-Z"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CardFormDialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) closeForm()
          else setShowForm(true)
        }}
        onExited={handleExited}
        mode={editingCardId ? "edit" : "create"}
        decks={deck ? [deck] : []}
        documents={documents}
        initialValues={editingCardId ? form : { ...form, deckId: form.deckId || id || "" }}
        loading={creating}
        error={error}
        title={editingCardId ? "Edit flashcard" : "New flashcard"}
        description={editingCardId ? "Update this card." : "Create a card for this deck or link it to a document."}
        submitLabel={editingCardId ? "Save changes" : "Add Card"}
        onSubmit={handleCreate}
      />

      {/* Cards grid */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#ffd8f4] flex items-center justify-center shadow-sm">
            <CreditCard className="w-8 h-8 text-[#c050a0]" />
          </div>
          <div className="text-center">
            <p className="text-[#1c1c1e] font-medium text-lg">No cards yet</p>
            <p className="text-[#555a6a] text-sm mt-1">Add your first flashcard to this deck</p>
          </div>
        </div>
      ) : visibleCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Search className="w-7 h-7 text-[#5b76fe]" />
          <p className="text-[#1c1c1e] font-medium">No cards match the current filters</p>
          <button className="btn-secondary text-sm" onClick={() => { setQuery(""); setFilterBy("all") }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className={`${cardsView === "grid" ? "grid gap-4 p-4 sm:p-6 md:grid-cols-2 md:gap-6" : "p-4 sm:p-6 space-y-3"}`}>
          {visibleCards.map((card, i) => {
            const isFlipped = flipped[card.id] ?? false
            const linkedDoc = documents.find((d) => d.id === card.documentId)
            return (
              <div
                key={card.id}
                data-card-id={card.id}
                className={`card-miro cursor-pointer overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${cardsView === "list" ? "w-full" : ""} ${isFlipped ? 'ring-2 ring-[#5b76fe] shadow-md bg-[#fcfdff]' : 'hover:shadow-md'}`}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => toggleFlip(card.id)}
              >
                <div className="card-inner flex min-h-[150px] flex-col p-4 sm:min-h-[160px] sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a5a8b5] flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-[#5b76fe]" />
                      {isFlipped ? "Answer" : "Question"}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-50 border border-[#e9eaef] ${resultColor[card.lastResult]}`}>
                      {resultLabel[card.lastResult]}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <p className={`text-[#1c1c1e] text-[16px] leading-relaxed line-clamp-4 ${isFlipped ? 'font-bold' : 'font-medium'}`}>
                      {isFlipped ? card.back : card.front}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f5f5f7] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5b76fe]">
                      <Eye className="w-3.5 h-3.5" /> {isFlipped ? "Show Question" : "Show Answer"}
                    </div>
                    {!isFlipped && linkedDoc && (
                      <div className="text-[10px] font-medium text-[#888c9e] flex items-center gap-1 bg-[#f5f5f7] px-2 py-1 rounded-md max-w-[120px] truncate">
                        📄 {linkedDoc.title}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditForm(card)
                        }}
                        className="text-[#a5a8b5] hover:text-[#5b76fe] hover:bg-[#eef0ff] p-1.5 rounded-full transition-colors"
                        title="Edit card"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(card.id)
                        }}
                        className="text-[#a5a8b5] hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
