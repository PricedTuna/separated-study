import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Plus, Loader2, CreditCard, Check, Eye, Trash2, BrainCircuit } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)
import { cardService, deckService, documentService } from "../lib/container"
import { useDataRefresh } from "../hooks/use-data-refresh"
import { confirmDelete } from "../lib/swal"
import type { Deck } from "../domain/models/deck"
import type { Card, CardResult } from "../domain/models/card"
import type { Document } from "../domain/models/document"
import { BackButton } from "../components/ui/back-button"
import { Dialog } from "../components/ui/dialog"
import { StudySession } from "../components/study/study-session"

type FormState = { front: string; back: string; documentId: string }
const EMPTY: FormState = { front: "", back: "", documentId: "" }

export function DeckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { refreshKey } = useDataRefresh()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [dueCards, setDueCards] = useState<Card[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setError(null)
    setCreating(true)
    try {
      await cardService.create({
        front: form.front,
        back: form.back,
        deckId: id,
        documentId: form.documentId || null,
      })
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
      'la tarjeta',
      card ? `¿Eliminar la tarjeta "${card.front.substring(0, 30)}${card.front.length > 30 ? '...' : ''}"?` : undefined
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
    setForm(EMPTY)
    setError(null)
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

  return (
    <div className="mx-auto w-full max-w-5xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-[#e9eaef] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <BackButton
            onClick={() => navigate("/dashboard/decks")}
          />
          <h1 className="min-w-0 truncate text-lg font-medium text-[#1c1c1e]">
            {deck?.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cards.length > 0 && (
            <button
              onClick={() => startStudy("free")}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              Free Mode
            </button>
          )}
          {dueCards.length > 0 ? (
            <button
              onClick={() => startStudy("srs")}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <BrainCircuit className="w-4 h-4" />
              Study ({dueCards.length} due)
            </button>
          ) : cards.length > 0 && (
            <button
              disabled
              className="btn-secondary flex items-center gap-2 text-sm opacity-50 cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              All caught up!
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>
      </div>

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) closeForm()
          else setShowForm(true)
        }}
        title="New flashcard"
        description="Create a card for this deck and optionally link it to a document."
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="card-front-input" className="text-xs font-medium text-[#555a6a]">Front</label>
              <textarea
                id="card-front-input"
                autoFocus
                value={form.front}
                onChange={(e) => setForm((p) => ({ ...p, front: e.target.value }))}
                placeholder="Question or concept..."
                rows={4}
                className="input-miro w-full text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="card-back-input" className="text-xs font-medium text-[#555a6a]">Back</label>
              <textarea
                id="card-back-input"
                value={form.back}
                onChange={(e) => setForm((p) => ({ ...p, back: e.target.value }))}
                placeholder="Answer or definition..."
                rows={4}
                className="input-miro w-full text-sm resize-none"
              />
            </div>
          </div>

          {documents.length > 0 && (
            <div className="space-y-1.5">
              <label htmlFor="card-document-select" className="text-xs font-medium text-[#555a6a]">
                Link to document <span className="text-[#a5a8b5] font-normal">(optional)</span>
              </label>
              <select
                id="card-document-select"
                value={form.documentId}
                onChange={(e) => setForm((p) => ({ ...p, documentId: e.target.value }))}
                className="input-miro w-full text-sm appearance-none"
              >
                <option value="">— None —</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={closeForm}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.front.trim() || !form.back.trim() || creating}
              className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Card
            </button>
          </div>
        </form>
      </Dialog>

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
      ) : (
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 md:gap-6">
          {cards.map((card, i) => {
            const isFlipped = flipped[card.id] ?? false
            const linkedDoc = documents.find((d) => d.id === card.documentId)
            return (
              <div
                key={card.id}
                data-card-id={card.id}
                className={`card-miro cursor-pointer overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${isFlipped ? 'ring-2 ring-[#5b76fe] shadow-md bg-[#fcfdff]' : 'hover:shadow-md'}`}
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
                    {isFlipped && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(card.id)
                        }}
                        className="text-[#a5a8b5] hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
