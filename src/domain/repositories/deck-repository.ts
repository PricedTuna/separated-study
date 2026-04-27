import type { Deck, CreateDeckInput, UpdateDeckInput } from "../models/deck"

/**
 * IDeckRepository — contrato de persistencia para decks.
 */
export interface IDeckRepository {
  findAll(): Promise<Deck[]>
  findById(id: string): Promise<Deck | null>
  create(input: CreateDeckInput): Promise<Deck>
  update(id: string, input: UpdateDeckInput): Promise<Deck>
  delete(id: string): Promise<void>
}