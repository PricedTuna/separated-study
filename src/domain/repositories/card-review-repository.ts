import type { CardReview, CreateCardReviewInput, UpdateCardReviewInput } from "../models/card-review"

export interface ICardReviewRepository {
  findById(id: string): Promise<CardReview | null>
  findByCardId(cardId: string): Promise<CardReview | null>
  findDueForReview(userId: string): Promise<CardReview[]>
  create(input: CreateCardReviewInput): Promise<CardReview>
  update(id: string, input: UpdateCardReviewInput): Promise<CardReview>
  delete(cardId: string): Promise<void>
}