import { createLocalStorageAdapter } from "../../lib/storage/local-storage-adapter"
import type { IDeckRepository } from "../../domain/repositories/deck-repository"
import type { Deck } from "../../domain/models/deck"

const adapter = createLocalStorageAdapter<Deck>("spaced-study:decks")

export class DeckLocalStorageRepository implements IDeckRepository {
  async findAll() {
    return adapter.findAll()
  }

  async findById(id: string) {
    return adapter.findById(id)
  }

  async create(input: { name: string; description: string }) {
    return adapter.create(input as unknown as Deck)
  }

  async update(id: string, input: { name?: string; description?: string }) {
    return adapter.update(id, input)
  }

  async delete(id: string) {
    return adapter.delete(id)
  }
}