export type CardReviewState = "new" | "learning" | "review" | "relearning" | "graduated" | "unknown"

export interface CardReview {
  id: string
  cardId: string
  userId: string
  stability: number
  difficulty: number
  due: string
  lastReview: string
  interval: number
  reps: number
  lapses: number
  state: CardReviewState
  updatedAt: string
}

export type CreateCardReviewInput = Pick<CardReview, "cardId" | "stability" | "difficulty" | "due" | "lastReview" | "interval" | "reps" | "lapses" | "state">

export type UpdateCardReviewInput = Partial<Pick<CardReview, "stability" | "difficulty" | "due" | "lastReview" | "interval" | "reps" | "lapses" | "state">>