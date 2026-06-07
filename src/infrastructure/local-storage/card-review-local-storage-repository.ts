import { createLocalStorageAdapter } from "../../lib/storage/local-storage-adapter"
import type { ICardReviewRepository } from "../../domain/repositories/card-review-repository"
import type { CardReview, CreateCardReviewInput, UpdateCardReviewInput } from "../../domain/models/card-review"

const adapter = createLocalStorageAdapter<CardReview>("spaced-study:card-reviews")

export class CardReviewLocalStorageRepository implements ICardReviewRepository {
  async findById(id: string) {
    return adapter.findById(id)
  }

  async findByCardId(cardId: string) {
    const all = await adapter.findAll()
    return all.find((r) => r.cardId === cardId) || null
  }

  async findDueForReview(_userId: string) {
    void _userId
    const all = await adapter.findAll()
    const now = new Date().toISOString()
    return all.filter((r) => r.due <= now).sort((a, b) => a.due.localeCompare(b.due))
  }

  async create(input: CreateCardReviewInput) {
    return adapter.create({
      userId: "local-user",
      ...input,
    } as unknown as CardReview)
  }

  async update(id: string, input: UpdateCardReviewInput) {
    return adapter.update(id, input)
  }

  async delete(cardId: string) {
    const all = await adapter.findAll()
    const filtered = all.filter((r) => r.cardId !== cardId)
    localStorage.setItem("spaced-study:card-reviews", JSON.stringify(filtered))
  }
}