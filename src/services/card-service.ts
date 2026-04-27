import type { ICardRepository } from "../domain/repositories/card-repository"
import type { Card, CreateCardInput, UpdateCardInput, CardResult } from "../domain/models/card"

/**
 * CardService — lógica de negocio pura para las flashcards.
 */
export class CardService {
  constructor(private readonly repo: ICardRepository) {}

  getAll(): Promise<Card[]> {
    return this.repo.findAll()
  }

  getById(id: string): Promise<Card | null> {
    return this.repo.findById(id)
  }

  getByDeckId(deckId: string): Promise<Card[]> {
    return this.repo.findByDeckId(deckId)
  }

  getByDocumentId(documentId: string): Promise<Card[]> {
    return this.repo.findByDocumentId(documentId)
  }

  create(input: CreateCardInput): Promise<Card> {
    if (!input.front.trim()) throw new Error("El frente de la card no puede estar vacío")
    if (!input.back.trim()) throw new Error("El reverso de la card no puede estar vacío")
    return this.repo.create({
      front: input.front.trim(),
      back: input.back.trim(),
      deckId: input.deckId,
      documentId: input.documentId ?? null,
    })
  }

  update(id: string, input: UpdateCardInput): Promise<Card> {
    return this.repo.update(id, input)
  }

  /** Registra si el usuario recordó o no la card */
  recordResult(id: string, result: CardResult): Promise<Card> {
    return this.repo.update(id, { lastResult: result })
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}