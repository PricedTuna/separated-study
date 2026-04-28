import type { ICardReviewRepository } from "../domain/repositories/card-review-repository"
import type { CardReview, CreateCardReviewInput, UpdateCardReviewInput } from "../models/card-review"

/**
 * CardReviewService — lógica de negocio para el seguimiento de revisiones spaced repetition.
 */
export class CardReviewService {
  constructor(private readonly repo: ICardReviewRepository) {}

  async getByCardId(cardId: string): Promise<CardReview | null> {
    return this.repo.findByCardId(cardId)
  }

  async getDueForReview(userId: string): Promise<CardReview[]> {
    return this.repo.findDueForReview(userId)
  }

  async createOrUpdate(cardId: string, input: CreateCardReviewInput): Promise<CardReview> {
    const existing = await this.repo.findByCardId(cardId)
    if (existing) {
      return this.repo.update(existing.id, input)
    }
    return this.repo.create(input)
  }

  async delete(cardId: string): Promise<void> {
    return this.repo.delete(cardId)
  }
}