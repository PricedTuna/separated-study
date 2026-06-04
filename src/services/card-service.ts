import type { ICardRepository } from "../domain/repositories/card-repository"
import type { ICardReviewRepository } from "../domain/repositories/card-review-repository"
import type { Card, CreateCardInput, UpdateCardInput, CardResult } from "../domain/models/card"
import type { CardReview } from "../domain/models/card-review"
import { DEFAULT_FSRS_PARAMS, calculateFSRS, toFSRSParams } from "../lib/fsrs"

/**
 * CardService — lógica de negocio pura para las flashcards.
 */
export class CardService {
  cardRepo: ICardRepository
  reviewRepo: ICardReviewRepository
  constructor(cardRepo: ICardRepository, reviewRepo: ICardReviewRepository) {
    this.cardRepo = cardRepo
    this.reviewRepo = reviewRepo
  }

  getAll(): Promise<Card[]> {
    return this.cardRepo.findAll()
  }

  getById(id: string): Promise<Card | null> {
    return this.cardRepo.findById(id)
  }

  getByDeckId(deckId: string): Promise<Card[]> {
    return this.cardRepo.findByDeckId(deckId)
  }

  getByDocumentId(documentId: string): Promise<Card[]> {
    return this.cardRepo.findByDocumentId(documentId)
  }

  async getStudyCards(deckId?: string): Promise<(Card & { review: CardReview | null })[]> {
    const cards = deckId ? await this.cardRepo.findByDeckId(deckId) : await this.cardRepo.findAll()
    const now = new Date().getTime()
    
    const cardsWithReviews = await Promise.all(
      cards.map(async (card) => {
        const review = await this.reviewRepo.findByCardId(card.id).catch(() => null)
        return { ...card, review }
      })
    )

    return cardsWithReviews
      .filter(({ review }) => !review || new Date(review.due).getTime() <= now)
      .sort((a, b) => {
        const dueA = a.review ? new Date(a.review.due).getTime() : 0
        const dueB = b.review ? new Date(b.review.due).getTime() : 0
        return dueA - dueB
      })
  }

  create(input: CreateCardInput): Promise<Card> {
    if (!input.front.trim()) throw new Error("El frente de la card no puede estar vacío")
    if (!input.back.trim()) throw new Error("El reverso de la card no puede estar vacío")
    return this.cardRepo.create({
      front: input.front.trim(),
      back: input.back.trim(),
      deckId: input.deckId,
      documentId: input.documentId ?? null,
    })
  }

  update(id: string, input: UpdateCardInput): Promise<Card> {
    return this.cardRepo.update(id, input)
  }

  /**
   * Registra si el usuario recordó o no la card.
   * También guarda el registro en card_reviews para el seguimiento spaced repetition.
   */
  async recordResult(id: string, result: CardResult): Promise<Card> {
    // 1. Actualizar lastResult en la tabla cards
    const card = await this.cardRepo.update(id, { lastResult: result })

    // 2. Buscar o crear el registro de review
    const review = await this.reviewRepo.findByCardId(id)
    const now = new Date()

    if (review) {
      // Existing review - calculate new FSRS params
      const currentParams = toFSRSParams(review)
      const newParams = calculateFSRS(currentParams, result, now)
      await this.reviewRepo.update(review.id, {
        stability: newParams.stability,
        difficulty: newParams.difficulty,
        due: newParams.due,
        lastReview: now.toISOString(),
        interval: newParams.interval,
        reps: newParams.reps,
        lapses: newParams.lapses,
        state: newParams.state,
      })
    } else {
      // New review - create from scratch
      const currentParams = { ...DEFAULT_FSRS_PARAMS }
      const newParams = calculateFSRS(currentParams, result, now)
      await this.reviewRepo.create({
        cardId: id,
        stability: newParams.stability,
        difficulty: newParams.difficulty,
        due: newParams.due,
        lastReview: now.toISOString(),
        interval: newParams.interval,
        reps: newParams.reps,
        lapses: newParams.lapses,
        state: newParams.state,
      })
    }

    return card
  }

  async delete(id: string): Promise<void> {
    // Also delete the review record
    await this.reviewRepo.delete(id).catch(() => {})
    await this.cardRepo.delete(id)
  }
}