import type { CardResult } from "../domain/models/card"
import type { CardReview, CardReviewState } from "../domain/models/card-review"

export interface FSRSParams {
  stability: number
  difficulty: number
  interval: number
  reps: number
  lapses: number
  state: CardReviewState
  due: string
  lastReview?: string
}

/**
 * Valores iniciales para una card nueva (baseline FSRS)
 */
export const DEFAULT_FSRS_PARAMS: FSRSParams = {
  stability: 0,
  difficulty: 0.3,
  interval: 0,
  reps: 0,
  lapses: 0,
  state: "new",
  due: new Date().toISOString(),
}

/**
 * Calcula los nuevos parámetros FSRS basados en el resultado del review.
 * Implementación basada en docs/fsrf.md
 */
export function calculateFSRS(
  current: FSRSParams,
  result: CardResult,
  now: Date = new Date()
): FSRSParams {
  const { stability, difficulty, reps, lapses, state, lastReview } = current

  // Default values for new cards
  const S_0 = 1; // 1 day initial stability

  let newStability = stability || S_0
  let newDifficulty = difficulty
  let newInterval: number
  const newReps = reps + 1
  let newLapses = lapses
  let newState: CardReviewState = state
  let newDue: Date

  // Calculate days since last review
  let t = 0
  if (lastReview) {
    t = Math.max(0, (now.getTime() - new Date(lastReview).getTime()) / (1000 * 60 * 60 * 24))
  }

  // Retrievability: R(t) = exp(-t / S)
  const R = Math.exp(-t / newStability)

  // Update difficulty
  if (result === "again") newDifficulty = Math.min(1, difficulty + 0.2)
  else if (result === "hard") newDifficulty = Math.min(1, difficulty + 0.1)
  else if (result === "good") newDifficulty = Math.max(0, difficulty - 0.1)
  else if (result === "easy") newDifficulty = Math.max(0, difficulty - 0.2)

  // Update stability
  if (result === "again") {
    newStability = Math.max(0.1, newStability * 0.3)
    newLapses += 1
    newState = "relearning"
  } else if (result === "hard") {
    newStability = newStability * 1.2
    newState = state === "new" ? "learning" : "review"
  } else if (result === "good") {
    // S increases more when R is lower (spacing effect)
    const factor = 1.5 + (1 - R) * 0.5 
    newStability = newStability * factor
    newState = state === "new" || state === "learning" || state === "relearning" ? "review" : "graduated"
  } else if (result === "easy") {
    const factor = 2.0 + (1 - R)
    newStability = newStability * factor
    newState = "graduated"
  }

  // Calculate new interval based on factor rating
  let factorRating = 1
  if (result === "again") factorRating = 0.01 // short interval (minutes)
  else if (result === "hard") factorRating = 0.5
  else if (result === "good") factorRating = 1.0
  else if (result === "easy") factorRating = 1.5

  newInterval = Math.max(0.01, newStability * factorRating)

  if (result === "again") {
    // 10 minutes from now
    newDue = new Date(now.getTime() + 10 * 60 * 1000)
  } else {
    // Snap to 1 day minimum if it's not 'again'
    newInterval = Math.max(1, Math.round(newInterval))
    newDue = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
  }

  return {
    stability: Math.round(newStability * 100) / 100,
    difficulty: Math.round(newDifficulty * 100) / 100,
    interval: newInterval,
    reps: newReps,
    lapses: newLapses,
    state: newState,
    due: newDue.toISOString(),
    lastReview: now.toISOString(),
  }
}

/**
 * Computes a human-readable "time to reappear" string (like Anki)
 * for a given result based on the current FSRS params.
 */
export function getNextIntervalString(
  current: FSRSParams,
  result: CardResult,
  now: Date = new Date()
): string {
  const next = calculateFSRS(current, result, now)
  const diffMs = new Date(next.due).getTime() - now.getTime()

  if (diffMs < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.round(diffMs / (60 * 1000)))
    return `${minutes} min`
  }

  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.round(diffMs / (60 * 60 * 1000))
    return `${hours} hr`
  }

  const days = Math.round(diffMs / (24 * 60 * 60 * 1000))
  if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""}`
  }

  const months = Math.round(days / 30)
  return `${months} mo`
}

/**
 * Convierte un CardReview a FSRSParams para usar con calculateFSRS
 */
export function toFSRSParams(review: CardReview): FSRSParams {
  return {
    stability: review.stability,
    difficulty: review.difficulty,
    interval: review.interval,
    reps: review.reps,
    lapses: review.lapses,
    state: review.state,
    due: review.due,
    lastReview: review.lastReview,
  }
}