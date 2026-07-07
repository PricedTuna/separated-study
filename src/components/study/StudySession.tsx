import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { ArrowLeft, BrainCircuit, X, Check, Shuffle, RotateCcw, Keyboard, Loader2 } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import type { Card, CardResult } from "@/domain/models/card"
import type { CardReview } from "@/domain/models/card-review"
import { DEFAULT_FSRS_PARAMS, getNextIntervalString, toFSRSParams } from "@/lib/fsrs"

gsap.registerPlugin(useGSAP)

type StudyCard = Card & { review?: CardReview | null }

export interface StudySessionProps {
  initialCards: StudyCard[]
  mode: "srs" | "free"
  onResult: (cardId: string, result: CardResult) => Promise<void>
  onExit: () => void
}
type ResultStatKey = Exclude<CardResult, "unseen">

function prepareSessionCards(cards: StudyCard[], mode: StudySessionProps["mode"]) {
  const sessionCards = [...cards]

  if (mode !== "free") return sessionCards

  for (let index = sessionCards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentCard = sessionCards[index]
    const swapCard = sessionCards[swapIndex]
    sessionCards[index] = swapCard
    sessionCards[swapIndex] = currentCard
  }

  return sessionCards
}

export const StudySession = ({ initialCards, mode, onResult, onExit }: StudySessionProps) => {
  const [cards, setCards] = useState<StudyCard[]>(() => prepareSessionCards(initialCards, mode))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionTotal, setSessionTotal] = useState(initialCards.length)
  const [isAnimating, setIsAnimating] = useState(false)
  const [repeatIncorrect, setRepeatIncorrect] = useState(true)
  const [requeuedCardIds, setRequeuedCardIds] = useState<Set<string>>(new Set())
  const [sessionDone, setSessionDone] = useState(false)
  const [stats, setStats] = useState<Record<ResultStatKey, number>>({ again: 0, hard: 0, good: 0, easy: 0 })
  const [isExiting, setIsExiting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [submittingGrade, setSubmittingGrade] = useState<CardResult | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const cardContentRef = useRef<HTMLDivElement>(null)
  const buttonsWrapperRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const isFlippingRef = useRef(false)
  const sessionModeRef = useRef(mode)
  const { contextSafe } = useGSAP({ scope: containerRef })

  const handleExit = useCallback(() => {
    if (isExiting) return
    setIsExiting(true)
    const animateExit = contextSafe(() => {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => onExit(),
      })
    })
    animateExit()
  }, [contextSafe, isExiting, onExit])

  useEffect(() => {
    if (sessionModeRef.current === mode) return

    sessionModeRef.current = mode
    const sessionCards = prepareSessionCards(initialCards, mode)
    setCards(sessionCards)
    setCurrentIndex(0)
    setFlipped(false)
    setSessionTotal(sessionCards.length)
    setRequeuedCardIds(new Set())
    setSessionDone(false)
    setStats({ again: 0, hard: 0, good: 0, easy: 0 })
    setActionError(null)
  }, [initialCards, mode])

  const activeCard = mode === "srs" ? cards[0] : cards[currentIndex]
  const progressTotal = mode === "free" ? Math.max(sessionTotal, cards.length) : sessionTotal
  const progress = sessionDone || !activeCard
    ? progressTotal
    : mode === "srs"
      ? Math.min(progressTotal, progressTotal - cards.length + 1)
      : Math.min(progressTotal, currentIndex + 1)

  const intervalLabels = useMemo(() => {
    if (!activeCard || mode !== "srs") return null
    const params = activeCard.review ? toFSRSParams(activeCard.review) : DEFAULT_FSRS_PARAMS
    return {
      again: getNextIntervalString(params, "again"),
      hard: getNextIntervalString(params, "hard"),
      good: getNextIntervalString(params, "good"),
      easy: getNextIntervalString(params, "easy"),
    }
  }, [activeCard, mode])

  useGSAP(() => {
    if (!activeCard) return

    gsap.fromTo(cardRef.current,
      {
        y: 15,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      }
    )
  }, { dependencies: [activeCard?.id], scope: containerRef })

  useGSAP(() => {
    if (flipped && buttonsWrapperRef.current && buttonsRef.current) {
      gsap.to(buttonsWrapperRef.current, {
        height: "auto",
        autoAlpha: 1,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => {
          if (buttonsWrapperRef.current) {
            gsap.set(buttonsWrapperRef.current, { overflow: "visible" })
          }
        }
      })

      gsap.fromTo(buttonsRef.current.children,
        {
          y: 15,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.35,
          ease: "power2.out",
          delay: 0.05,
          overwrite: true
        }
      )
    } else if (!flipped && buttonsWrapperRef.current) {
      gsap.to(buttonsWrapperRef.current, {
        height: 0,
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.in",
        overflow: "hidden",
        overwrite: true
      })
    }
  }, { dependencies: [flipped], scope: containerRef })

  const handleAction = useCallback(async (result: CardResult) => {
    if (!activeCard) return
    if (!flipped) return
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true
    setIsAnimating(true)
    setActionError(null)
    setSubmittingGrade(result)

    const reviewedCard = activeCard

    try {
      const hideActiveCard = async () => {
        const hideCard = contextSafe(() => {
          return gsap.to(cardRef.current, {
            y: 15,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in"
          })
        })
        await hideCard()
      }

      if (mode === "srs") {
        await onResult(reviewedCard.id, result)
        if (result !== "unseen") {
          setStats((prev) => ({ ...prev, [result]: prev[result] + 1 }))
        }
        await hideActiveCard()
        const remainingCards = cards.filter((card) => card.id !== reviewedCard.id)
        setCards(remainingCards)
        setFlipped(false)

        if (remainingCards.length === 0) {
          setSessionDone(true)
        }
      } else {
        await hideActiveCard()
        const shouldRequeue = repeatIncorrect && result === "again" && !requeuedCardIds.has(reviewedCard.id)
        const nextCards = shouldRequeue ? [...cards, reviewedCard] : cards
        const nextIndex = currentIndex + 1

        if (result !== "unseen") {
          setStats((prev) => ({ ...prev, [result]: prev[result] + 1 }))
        }

        if (shouldRequeue) {
          setCards(nextCards)
          setSessionTotal((prev) => Math.max(prev, nextCards.length))
          setRequeuedCardIds((prev) => new Set(prev).add(reviewedCard.id))
        }

        if (nextIndex < nextCards.length) {
          setCurrentIndex(nextIndex)
          setFlipped(false)
        } else {
          setSessionDone(true)
        }
      }
    } catch (err) {
      console.error("Study action failed:", err)
      setActionError("Could not save that review. Try again.")
      setSubmittingGrade(null)
      const restoreCard = contextSafe(() => {
        return gsap.to(cardRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
        })
      })
      await restoreCard()
    } finally {
      isAnimatingRef.current = false
      setIsAnimating(false)
      setSubmittingGrade(null)
    }
  }, [activeCard, cards, contextSafe, currentIndex, flipped, mode, onResult, repeatIncorrect, requeuedCardIds])

  const toggleFlip = useCallback(() => {
    if (!activeCard) return
    if (isAnimatingRef.current || isFlippingRef.current) return
    if (!cardContentRef.current) return

    isFlippingRef.current = true

    const animateFlip = contextSafe(() => {
      const tl = gsap.timeline()
      tl.to(cardContentRef.current, {
        opacity: 0,
        scale: 0.98,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          setFlipped((current) => !current)
        }
      }).to(cardContentRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
          isFlippingRef.current = false
        }
      })
    })
    animateFlip()
  }, [activeCard, contextSafe])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (sessionDone || isAnimatingRef.current) return
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault()
        toggleFlip()
        return
      }
      if (!flipped || !activeCard) return
      if (mode === "srs") {
        if (event.key === "1") void handleAction("again")
        if (event.key === "2") void handleAction("hard")
        if (event.key === "3") void handleAction("good")
        if (event.key === "4") void handleAction("easy")
        return
      }
      if (mode === "free") {
        if (event.key === "1") void handleAction("again")
        if (event.key === "2") void handleAction("good")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activeCard, flipped, handleAction, mode, sessionDone, toggleFlip])

  const isCompleted = sessionDone || (mode === "srs" && sessionTotal > 0 && (!activeCard || cards.length === 0))

  if (!activeCard || cards.length === 0) {
    if (!sessionDone) return null
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f5f5f5] flex flex-col fixed inset-0 z-50">
      <div className="bg-white border-b border-[#e9eaef] px-6 py-4 flex items-center justify-between shadow-sm">
        <button onClick={handleExit} disabled={isExiting} className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-50">
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
          <div className="text-xs font-medium text-[#888c9e] bg-[#f5f5f5] px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5" /> Space, 1-4
          </div>
        </div>
      </div>

      <div ref={contentRef} className="flex-1 flex flex-col items-center justify-center p-6 pb-24 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {!isCompleted && activeCard && (
          <div
            ref={cardRef}
            onClick={toggleFlip}
            className="bg-white rounded-[32px] shadow-xl min-h-[450px] p-12 cursor-pointer flex flex-col items-center justify-center text-center relative border border-[#e9eaef]"
          >
            <div className="absolute top-8 left-8 text-xs font-bold uppercase tracking-[0.2em] text-[#a5a8b5] flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#5b76fe]" />
              {flipped ? "Answer" : "Question"}
            </div>

            <div ref={cardContentRef} className="card-content w-full">
              <p className="text-3xl font-semibold text-[#1c1c1e] leading-tight max-w-prose">
                {flipped ? activeCard.back : activeCard.front}
              </p>
            </div>

            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#ccd0db]">
                Click to {flipped ? "see question" : "reveal answer"}
              </p>
            </div>

            {submittingGrade && (
              <div className="absolute inset-0 bg-white/80 rounded-[32px] flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#5b76fe] animate-spin" />
                  <span className="text-sm font-medium text-[#555a6a]">Saving...</span>
                </div>
              </div>
            )}
          </div>
          )}

          {actionError && !isCompleted && (
            <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
              {actionError}
            </p>
          )}

          {isCompleted && (
            <div className="card-miro rounded-[24px] p-8 text-center">
              <p className="text-2xl font-semibold text-[#1c1c1e]">Session complete</p>
              <p className="text-sm text-[#555a6a] mt-1">Review summary inspired by Quizlet flow.</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#fff3f3] p-3 text-red-600 font-medium">Again: {stats.again}</div>
                <div className="rounded-xl bg-[#fff7e8] p-3 text-orange-600 font-medium">Hard: {stats.hard}</div>
                <div className="rounded-xl bg-[#edf9f3] p-3 text-green-600 font-medium">Good: {stats.good}</div>
                <div className="rounded-xl bg-[#eef0ff] p-3 text-blue-600 font-medium">Easy: {stats.easy}</div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2">
                {mode === "free" && stats.again > 0 && (
                  <button
                    onClick={() => {
                      setSessionDone(false)
                      setCurrentIndex(0)
                      setFlipped(false)
                      const sessionCards = prepareSessionCards(initialCards, mode)
                      setCards(sessionCards)
                      setSessionTotal(sessionCards.length)
                      setRequeuedCardIds(new Set())
                      setStats({ again: 0, hard: 0, good: 0, easy: 0 })
                      setActionError(null)
                    }}
                    className="btn-secondary text-sm flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Restart
                  </button>
                )}
                <button onClick={handleExit} disabled={isExiting} className="btn-primary text-sm disabled:opacity-50">Exit</button>
              </div>
            </div>
          )}

          {!isCompleted && (
          <div
            ref={buttonsWrapperRef}
            className="invisible h-0 w-full overflow-hidden px-4 -mx-4 opacity-0"
          >
            <div className="pt-10 pb-12">
                {mode === "srs" && (
                  <div ref={buttonsRef} className="grid grid-cols-4 gap-4 w-full">
                    <button
                      onClick={() => handleAction("again")}
                      disabled={isAnimating}
                      className="opacity-0 flex flex-col items-center justify-center gap-1.5 py-5 px-2 rounded-[24px] bg-white hover:bg-red-50 text-red-600 transition-colors shadow-sm border border-[#e9eaef] hover:border-red-200 active:scale-95 disabled:opacity-50"
                    >
                      <span className="font-bold text-lg">Again</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{intervalLabels?.again ?? "Soon"}</span>
                    </button>
                    <button
                      onClick={() => handleAction("hard")}
                      disabled={isAnimating}
                      className="opacity-0 flex flex-col items-center justify-center gap-1.5 py-5 px-2 rounded-[24px] bg-white hover:bg-orange-50 text-orange-600 transition-colors shadow-sm border border-[#e9eaef] hover:border-orange-200 active:scale-95 disabled:opacity-50"
                    >
                      <span className="font-bold text-lg">Hard</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{intervalLabels?.hard ?? "Short"}</span>
                    </button>
                    <button
                      onClick={() => handleAction("good")}
                      disabled={isAnimating}
                      className="opacity-0 flex flex-col items-center justify-center gap-1.5 py-5 px-2 rounded-[24px] bg-white hover:bg-green-50 text-green-600 transition-colors shadow-sm border border-[#e9eaef] hover:border-green-200 active:scale-95 disabled:opacity-50"
                    >
                      <span className="font-bold text-lg">Good</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{intervalLabels?.good ?? "Normal"}</span>
                    </button>
                    <button
                      onClick={() => handleAction("easy")}
                      disabled={isAnimating}
                      className="opacity-0 flex flex-col items-center justify-center gap-1.5 py-5 px-2 rounded-[24px] bg-white hover:bg-blue-50 text-blue-600 transition-colors shadow-sm border border-[#e9eaef] hover:border-blue-200 active:scale-95 disabled:opacity-50"
                    >
                      <span className="font-bold text-lg">Easy</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{intervalLabels?.easy ?? "Long"}</span>
                    </button>
                  </div>
                )}

                {mode === "free" && (
                  <div className="space-y-3">
                    <label className="inline-flex items-center gap-2 text-xs text-[#555a6a]">
                      <input
                        type="checkbox"
                        checked={repeatIncorrect}
                        onChange={(e) => setRepeatIncorrect(e.target.checked)}
                      />
                      Repeat missed cards at the end
                    </label>
                    <div ref={buttonsRef} className="grid grid-cols-2 gap-4 w-full">
                    <button
                      onClick={() => handleAction("again")}
                      disabled={isAnimating}
                      className="opacity-0 flex items-center justify-center gap-3 py-5 px-4 rounded-[24px] bg-white hover:bg-red-50 text-red-600 transition-colors shadow-sm border border-[#e9eaef] hover:border-red-200 active:scale-95 disabled:opacity-50"
                    >
                      <X className="w-5 h-5 stroke-3" />
                      <span className="font-bold text-lg">Needs work</span>
                    </button>
                    <button
                      onClick={() => handleAction("good")}
                      disabled={isAnimating}
                      className="opacity-0 flex items-center justify-center gap-3 py-5 px-4 rounded-[24px] bg-white hover:bg-green-50 text-green-600 transition-colors shadow-sm border border-[#e9eaef] hover:border-green-200 active:scale-95 disabled:opacity-50"
                    >
                      <Check className="w-5 h-5 stroke-3" />
                      <span className="font-bold text-lg">Got it</span>
                    </button>
                    </div>
                  </div>
                )}
              </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
