import type { CardResult } from "../models/card"
import type { CardReview, CardReviewState } from "../models/card-review"

export interface FSRSParams {
  stability: number
  difficulty: number
  interval: number
  reps: number
  lapses: number
  state: CardReviewState
  due: string
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
 * Implementación simplificada del algoritmo FSRS.
 */
export function calculateFSRS(
  current: FSRSParams,
  result: CardResult,
  now: Date = new Date()
): FSRSParams {
  const { stability, difficulty, interval, reps, lapses, state } = current

  let newStability = stability
  let newDifficulty = difficulty
  let newInterval = interval
  let newReps = reps + 1
  let newLapses = lapses
  let newState: CardReviewState = state
  let newDue: Date

  if (result === "remembered") {
    // Rating: Good (3) - revisado correctamente
    if (state === "new" || state === "learning") {
      newStability = Math.max(1, stability * 1.5 + 0.1)
      newInterval = 1
      newState = "learning"
    } else if (state === "review") {
      newStability = Math.max(1, stability * 1.5)
      newInterval = Math.round(interval * 1.5)
      newState = "graduated"
    } else {
      newStability = Math.max(1, stability * 1.3)
      newInterval = Math.max(1, Math.round(interval * 1.3))
    }
    newDue = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
  } else {
    // Forgot
    newStability = Math.max(0.1, stability * 0.5)
    newDifficulty = Math.min(1, difficulty + 0.15)
    newInterval = 1
    newLapses = lapses + 1
    newState = "learning"
    newDue = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
  }

  return {
    stability: Math.round(newStability * 100) / 100,
    difficulty: Math.round(newDifficulty * 100) / 100,
    interval: newInterval,
    reps: newReps,
    lapses: newLapses,
    state: newState,
    due: newDue.toISOString(),
  }
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
  }
}