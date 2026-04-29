import { useState, useEffect } from "react"
import { ArrowLeft, BrainCircuit, X, Check, Shuffle } from "lucide-react"
import type { Card, CardResult } from "../../domain/models/card"

interface StudySessionProps {
  initialCards: Card[]
  mode: "srs" | "free"
  onResult: (cardId: string, result: CardResult) => Promise<void>
  onExit: () => void
}

export function StudySession({ initialCards, mode, onResult, onExit }: StudySessionProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionTotal, setSessionTotal] = useState(0)

  // Initialize cards when initialCards or mode changes
  useEffect(() => {
    let sessionCards = [...initialCards]
    if (mode === "free") {
      // Shuffle cards for free mode
      sessionCards = sessionCards.sort(() => Math.random() - 0.5)
    }
    setCards(sessionCards)
    setCurrentIndex(0)
    setFlipped(false)
    setSessionTotal(sessionCards.length)
  }, [initialCards, mode])

  // Handle parent shrinking initialCards for SRS mode
  useEffect(() => {
    if (mode === "srs") {
      setCards(initialCards)
      setCurrentIndex(0)
      setFlipped(false)
    }
  }, [initialCards, mode])

  // In SRS mode, cards length changes. In Free mode, index changes.
  const progress = mode === "srs" 
    ? Math.min(sessionTotal, sessionTotal - cards.length + 1)
    : currentIndex + 1

  const activeCard = mode === "srs" ? cards[0] : cards[currentIndex]

  // Exit when no cards to study (only after initialized)
  useEffect(() => {
    if (sessionTotal > 0 && (!activeCard || cards.length === 0)) {
      onExit()
    }
  }, [activeCard, cards.length, sessionTotal, onExit])

  const handleAction = async (result: CardResult) => {
    if (mode === "srs") {
      await onResult(activeCard.id, result)
    } else {
      // Free mode: just go to next card
      const nextIndex = currentIndex + 1
      if (nextIndex < cards.length) {
        setCurrentIndex(nextIndex)
        setFlipped(false)
      } else {
        setTimeout(() => onExit(), 500)
      }
    }
  }

  if (!activeCard || cards.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col fixed inset-0 z-50">
      {/* Header */}
      <div className="bg-white border-b border-[#e9eaef] px-6 py-4 flex items-center justify-between shadow-sm">
        <button onClick={onExit} className="btn-secondary flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Exit Study
        </button>
        <div className="flex items-center gap-3">
          {mode === "free" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#888c9e] uppercase tracking-wider bg-[#f5f5f5] px-3 py-1.5 rounded-full">
              <Shuffle className="w-3.5 h-3.5" /> Free Mode
            </span>
          )}
          <div className="text-sm font-medium text-[#555a6a] bg-[#f5f5f5] px-3 py-1.5 rounded-full">
            {progress} / {sessionTotal}
          </div>
        </div>
      </div>

      {/* Big Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div
            onClick={() => setFlipped(!flipped)}
            className="bg-white rounded-3xl shadow-lg min-h-[450px] p-12 cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center text-center relative border border-[#e9eaef]"
          >
            <div className="absolute top-6 left-6 text-xs font-semibold uppercase tracking-widest text-[#a5a8b5] flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              {flipped ? "Answer" : "Question"}
            </div>
            <p className="text-3xl font-medium text-[#1c1c1e] leading-relaxed max-w-prose">
              {flipped ? activeCard.back : activeCard.front}
            </p>
            <p className="text-sm font-medium text-[#a5a8b5] mt-12 animate-pulse">
              Click to {flipped ? "see question" : "reveal answer"}
            </p>
          </div>

          {/* Answer buttons */}
          {flipped && mode === "srs" && (
            <div className="grid grid-cols-4 gap-3 mt-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-300">
              <button
                onClick={() => handleAction("again")}
                className="flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-2xl bg-white hover:bg-red-50 text-red-600 transition-all shadow-sm border border-[#e9eaef] hover:border-red-200 hover:-translate-y-1"
              >
                <span className="font-bold text-base">Again</span>
                <span className="text-xs font-medium opacity-70">&lt; 10m</span>
              </button>
              <button
                onClick={() => handleAction("hard")}
                className="flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-2xl bg-white hover:bg-orange-50 text-orange-600 transition-all shadow-sm border border-[#e9eaef] hover:border-orange-200 hover:-translate-y-1"
              >
                <span className="font-bold text-base">Hard</span>
                <span className="text-xs font-medium opacity-70">Soon</span>
              </button>
              <button
                onClick={() => handleAction("good")}
                className="flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-2xl bg-white hover:bg-green-50 text-green-600 transition-all shadow-sm border border-[#e9eaef] hover:border-green-200 hover:-translate-y-1"
              >
                <span className="font-bold text-base">Good</span>
                <span className="text-xs font-medium opacity-70">Normal</span>
              </button>
              <button
                onClick={() => handleAction("easy")}
                className="flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-2xl bg-white hover:bg-blue-50 text-blue-600 transition-all shadow-sm border border-[#e9eaef] hover:border-blue-200 hover:-translate-y-1"
              >
                <span className="font-bold text-base">Easy</span>
                <span className="text-xs font-medium opacity-70">Later</span>
              </button>
            </div>
          )}

          {flipped && mode === "free" && (
            <div className="grid grid-cols-2 gap-4 mt-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-300">
              <button
                onClick={() => handleAction("again")}
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-white hover:bg-red-50 text-red-600 transition-all shadow-sm border border-[#e9eaef] hover:border-red-200 hover:-translate-y-1"
              >
                <X className="w-5 h-5" />
                <span className="font-bold text-base">Needs work</span>
              </button>
              <button
                onClick={() => handleAction("good")}
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-white hover:bg-green-50 text-green-600 transition-all shadow-sm border border-[#e9eaef] hover:border-green-200 hover:-translate-y-1"
              >
                <Check className="w-5 h-5" />
                <span className="font-bold text-base">Got it</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
