import type { IDeckRepository } from "../domain/repositories/deck-repository"
import type { ICardRepository } from "../domain/repositories/card-repository"
import type { Deck, CreateDeckInput, UpdateDeckInput } from "../domain/models/deck"

/**
 * DeckService — lógica de negocio para los mazos de flashcards.
 */
export class DeckService {
  constructor(private readonly repo: IDeckRepository, private readonly cardRepo: ICardRepository) {}

  getAll(): Promise<Deck[]> {
    return this.repo.findAll()
  }

  getById(id: string): Promise<Deck | null> {
    return this.repo.findById(id)
  }

  create(input: CreateDeckInput): Promise<Deck> {
    if (!input.name.trim()) throw new Error("El nombre del mazo no puede estar vacío")
    return this.repo.create({
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
    })
  }

  update(id: string, input: UpdateDeckInput): Promise<Deck> {
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error("El nombre del mazo no puede estar vacío")
    }
    return this.repo.update(id, input)
  }

  /** Delete deck and all its cards */
  async delete(id: string): Promise<void> {
    await this.cardRepo.deleteByDeckId(id)
    await this.repo.delete(id)
  }
}