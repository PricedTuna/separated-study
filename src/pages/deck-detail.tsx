import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Loader2, CreditCard, Check, X, Eye, Trash2, BrainCircuit } from "lucide-react"
import { cardService, deckService, documentService } from "../lib/container"
import { useDataRefresh } from "../hooks/use-data-refresh"
import { confirmDelete } from "../lib/swal"
import type { Deck } from "../domain/models/deck"
import type { Card, CardResult } from "../domain/models/card"
import type { Document } from "../domain/models/document"
import { BackButton } from "../components/ui/back-button"
import { Dialog } from "../components/ui/dialog"

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
  const [studyMode, setStudyMode] = useState(false)
  const [sessionTotal, setSessionTotal] = useState(0)

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
    await cardService.recordResult(cardId, result)
    const [cardsData, studyData] = await Promise.all([
      cardService.getByDeckId(id!),
      cardService.getStudyCards(id!)
    ])
    setCards(cardsData)
    setDueCards(studyData)
    
    // In study mode, dueCards queue shrinks because answered cards get a future due date.
    if (studyMode) {
      setFlipped({})
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
    setFlipped((p) => ({ ...p, [cardId]: !p[cardId] }))
  }

  const startStudy = () => {
    setStudyMode(true)
    setSessionTotal(dueCards.length)
    setFlipped({})
  }

  const exitStudy = () => {
    setStudyMode(false)
    setSessionTotal(0)
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

  // Study mode - big centered card like Anki
  if (studyMode && dueCards.length > 0) {
    const currentCard = dueCards[0]
    const isFlipped = flipped[currentCard.id] ?? false
    const progress = Math.min(sessionTotal, sessionTotal - dueCards.length + 1)

    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#e9eaef] px-6 py-4 flex items-center justify-between shadow-sm">
          <button onClick={exitStudy} className="btn-secondary flex items-center gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Exit Study
          </button>
          <div className="text-sm font-medium text-[#555a6a] bg-[#f5f5f5] px-3 py-1 rounded-full">
            {progress} / {sessionTotal}
          </div>
        </div>

        {/* Big Card */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
          <div className="w-full max-w-2xl">
            <div
              onClick={() => toggleFlip(currentCard.id)}
              className="bg-white rounded-3xl shadow-lg min-h-[450px] p-12 cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center text-center relative border border-[#e9eaef]"
            >
              <div className="absolute top-6 left-6 text-xs font-semibold uppercase tracking-widest text-[#a5a8b5] flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                {isFlipped ? "Answer" : "Question"}
              </div>
              <p className="text-3xl font-medium text-[#1c1c1e] leading-relaxed max-w-prose">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <p className="text-sm font-medium text-[#a5a8b5] mt-12 animate-pulse">
                Click to {isFlipped ? "see question" : "reveal answer"}
              </p>
            </div>

            {/* Answer buttons */}
            {isFlipped && (
              <div className="grid grid-cols-4 gap-3 mt-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-300">
                <button
                  onClick={() => handleResult(currentCard.id, "again")}
                  className="flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-2xl bg-white hover:bg-red-50 text-red-600 transition-all shadow-sm border border-[#e9eaef] hover:border-red-200 hover:-translate-y-1"
                >
                  <span className="font-bold text-base">Again</span>
                  <span className="text-xs font-medium opacity-70">&lt; 10m</span>
                </button>
                <button
                  onClick={() => handleResult(currentCard.id, "hard")}
                  className="flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-2xl bg-white hover:bg-orange-50 text-orange-600 transition-all shadow-sm border border-[#e9eaef] hover:border-orange-200 hover:-translate-y-1"
                >
                  <span className="font-bold text-base">Hard</span>
                  <span className="text-xs font-medium opacity-70">Soon</span>
                </button>
                <button
                  onClick={() => handleResult(currentCard.id, "good")}
                  className="flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-2xl bg-white hover:bg-green-50 text-green-600 transition-all shadow-sm border border-[#e9eaef] hover:border-green-200 hover:-translate-y-1"
                >
                  <span className="font-bold text-base">Good</span>
                  <span className="text-xs font-medium opacity-70">Normal</span>
                </button>
                <button
                  onClick={() => handleResult(currentCard.id, "easy")}
                  className="flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-2xl bg-white hover:bg-blue-50 text-blue-600 transition-all shadow-sm border border-[#e9eaef] hover:border-blue-200 hover:-translate-y-1"
                >
                  <span className="font-bold text-base">Easy</span>
                  <span className="text-xs font-medium opacity-70">Later</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e9eaef]">
        <BackButton
          onClick={() => navigate("/dashboard/decks")}
        />
        <h1 className="flex-1 text-lg font-medium text-[#1c1c1e]">
          {deck?.name}
        </h1>
        {dueCards.length > 0 ? (
          <button
            onClick={startStudy}
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
        <div className="grid gap-4 md:grid-cols-2 p-6">
          {cards.map((card, i) => {
            const isFlipped = flipped[card.id] ?? false
            const linkedDoc = documents.find((d) => d.id === card.documentId)
            return (
              <div
                key={card.id}
                className={`card-miro overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all ${isFlipped ? 'ring-2 ring-[#5b76fe] shadow-md' : 'hover:shadow-md'}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div 
                  className={`p-5 min-h-[140px] cursor-pointer relative transition-colors ${isFlipped ? 'bg-[#eef0ff]' : ''}`} 
                  onClick={() => toggleFlip(card.id)}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/60 backdrop-blur-sm ${resultColor[card.lastResult]}`}>
                      {resultLabel[card.lastResult]}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#a5a8b5] mb-3 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    {isFlipped ? "Answer" : "Question"}
                  </p>
                  <p className="text-[#1c1c1e] text-[16px] leading-relaxed pr-16 font-medium">
                    {isFlipped ? card.back : card.front}
                  </p>
                </div>

                <div className="border-t border-[#e9eaef] px-5 py-3 flex items-center gap-2 bg-white">
                  {isFlipped ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFlip(card.id)
                      }}
                      className="text-xs font-medium text-[#5b76fe] hover:bg-[#eef0ff] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Show Question
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleFlip(card.id)}
                      className="text-xs font-medium text-[#5b76fe] hover:bg-[#eef0ff] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Show Answer
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-3">
                    {linkedDoc && (
                      <button
                        onClick={() => navigate(`/dashboard/documents/${linkedDoc.id}`)}
                        className="text-[11px] font-medium text-[#888c9e] hover:text-[#5b76fe] transition-colors truncate max-w-[120px] flex items-center gap-1 bg-[#f5f5f5] px-2 py-1 rounded-md"
                      >
                        📄 {linkedDoc.title}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="text-[#a5a8b5] hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

