import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Loader2, CreditCard, Check, X, Eye, Trash2 } from "lucide-react"
import { cardService, deckService, documentService } from "../lib/container"
import { useDataRefresh } from "../hooks/use-data-refresh"
import type { Deck } from "../domain/models/deck"
import type { Card, CardResult } from "../domain/models/card"
import type { Document } from "../domain/models/document"
import { BackButton } from "../components/ui/back-button"

type FormState = { front: string; back: string; documentId: string }
const EMPTY: FormState = { front: "", back: "", documentId: "" }

export function DeckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { refreshKey } = useDataRefresh()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

  // Study mode state
  const [studyIndex, setStudyIndex] = useState(0)
  const [studyMode, setStudyMode] = useState(false)

  const load = useCallback(async () => {
    if (!id) return

    const [deckData, cardsData, docsData] = await Promise.all([
      deckService.getById(id),
      cardService.getByDeckId(id),
      documentService.getAll(),
    ])

    if (!deckData) {
      navigate("/dashboard/decks")
      return
    }

    setDeck(deckData)
    setCards(cardsData)
    setDocuments(docsData)
    setLoading(false)
  }, [id, navigate])

  useEffect(() => {
    load()
  }, [load])

  // Also reload when refresh is triggered (e.g., after import)
  useEffect(() => {
    if (refreshKey > 0) {
      load()
    }
  }, [refreshKey])

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
      const cardsData = await cardService.getByDeckId(id)
      setCards(cardsData)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  async function handleResult(cardId: string, result: CardResult) {
    await cardService.recordResult(cardId, result)
    const cardsData = await cardService.getByDeckId(id!)
    setCards(cardsData)
    // Move to next card in study mode
    if (studyMode && studyIndex < cardsData.length - 1) {
      setStudyIndex((prev) => prev + 1)
      // Reset flipped state for next card
      const nextCard = cardsData[studyIndex + 1]
      setFlipped({ [nextCard.id]: false })
    } else if (studyMode) {
      // Completed all cards
      setTimeout(() => exitStudy(), 500)
    }
  }

  async function handleDelete(cardId: string) {
    await cardService.delete(cardId)
    const cardsData = await cardService.getByDeckId(id!)
    setCards(cardsData)
  }

  function toggleFlip(cardId: string) {
    setFlipped((p) => ({ ...p, [cardId]: !p[cardId] }))
  }

  const startStudy = () => {
    setStudyMode(true)
    setStudyIndex(0)
    setFlipped({})
  }

  const exitStudy = () => {
    setStudyMode(false)
    setStudyIndex(0)
    setFlipped({})
  }

  const resultColor: Record<string, string> = {
    remembered: "text-[#00b473]",
    forgot: "text-red-400",
    unseen: "text-[#a5a8b5]",
  }
  const resultLabel: Record<string, string> = {
    remembered: "Remembered",
    forgot: "Forgot",
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
  if (studyMode && cards.length > 0) {
    const currentCard = cards[studyIndex]
    const isFlipped = flipped[currentCard.id] ?? false

    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#e9eaef] px-6 py-4 flex items-center justify-between">
          <button onClick={exitStudy} className="btn-secondary flex items-center gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Exit Study
          </button>
          <div className="text-sm text-[#555a6a]">
            {studyIndex + 1} / {cards.length}
          </div>
        </div>

        {/* Big Card */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <div
              onClick={() => toggleFlip(currentCard.id)}
              className="bg-white rounded-2xl shadow-lg min-h-[400px] p-12 cursor-pointer transition-all duration-200 hover:shadow-xl flex flex-col items-center justify-center text-center"
            >
              <span className="text-xs font-medium uppercase tracking-wider text-[#a5a8b5] mb-4">
                {isFlipped ? "Answer" : "Question"}
              </span>
              <p className="text-2xl text-[#1c1c1e] leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <p className="text-xs text-[#a5a8b5] mt-8">
                Click to {isFlipped ? "see question" : "reveal answer"}
              </p>
            </div>

            {/* Answer buttons */}
            {isFlipped && (
              <div className="flex justify-center gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                  onClick={() => handleResult(currentCard.id, "forgot")}
                  className="flex items-center gap-2 px-8 py-4 text-lg rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Forgot
                </button>
                <button
                  onClick={() => handleResult(currentCard.id, "remembered")}
                  className="flex items-center gap-2 px-8 py-4 text-lg rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Remembered
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
        {cards.length > 0 && (
          <button
            onClick={startStudy}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <CreditCard className="w-4 h-4" />
            Study ({cards.length})
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

      {/* Create form */}
      {showForm && (
        <div className="card-miro p-5 m-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <p
            className="text-sm font-medium text-[#1c1c1e]"
            style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}
          >
            New Flashcard
          </p>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#555a6a]">Front</label>
                <textarea
                  autoFocus
                  value={form.front}
                  onChange={(e) => setForm((p) => ({ ...p, front: e.target.value }))}
                  placeholder="Question or concept..."
                  rows={4}
                  className="input-miro w-full text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#555a6a]">Back</label>
                <textarea
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
                <label className="text-xs font-medium text-[#555a6a]">
                  Link to document <span className="text-[#a5a8b5] font-normal">(optional)</span>
                </label>
                <select
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
                onClick={() => { setShowForm(false); setForm(EMPTY); setError(null) }}
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
        </div>
      )}

      {/* Cards grid */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#ffd8f4] flex items-center justify-center">
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
                className={`card-miro overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all ${isFlipped ? 'ring-2 ring-[#5b76fe]' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div 
                  className={`p-5 min-h-[120px] cursor-pointer relative transition-colors ${isFlipped ? 'bg-[#eef0ff]' : ''}`} 
                  onClick={() => toggleFlip(card.id)}
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className={`text-[10px] font-medium uppercase tracking-wide ${resultColor[card.lastResult]}`}>
                      {resultLabel[card.lastResult]}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-[#a5a8b5]" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#a5a8b5] mb-2">
                    {isFlipped ? "Answer" : "Question"}
                  </p>
                  <p className="text-[#1c1c1e] text-[15px] leading-snug pr-16">
                    {isFlipped ? card.back : card.front}
                  </p>
                </div>

                <div className="border-t border-[#e9eaef] px-4 py-2.5 flex items-center gap-2">
                  {isFlipped ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFlip(card.id)
                      }}
                      className="text-xs text-[#5b76fe] hover:bg-[#eef0ff] px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Show Question
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleFlip(card.id)}
                      className="text-xs text-[#5b76fe] hover:bg-[#eef0ff] px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Show Answer
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {linkedDoc && (
                      <button
                        onClick={() => navigate(`/dashboard/documents/${linkedDoc.id}`)}
                        className="text-[10px] text-[#a5a8b5] hover:text-[#5b76fe] transition-colors truncate max-w-[120px]"
                      >
                        📄 {linkedDoc.title}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="text-[10px] text-[#a5a8b5] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
