import { createLocalStorageAdapter } from "../../lib/storage/local-storage-adapter"
import type { ICardRepository } from "../../domain/repositories/card-repository"
import type { Card } from "../../domain/models/card"

const adapter = createLocalStorageAdapter<Card>("spaced-study:cards")

export class CardLocalStorageRepository implements ICardRepository {
  async findAll() {
    return adapter.findAll()
  }

  async findById(id: string) {
    return adapter.findById(id)
  }

  async findByDeckId(deckId: string) {
    return adapter.findAll().then((cards) =>
      cards
        .filter((c) => c.deckId === deckId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    )
  }

  async findByDocumentId(documentId: string) {
    return adapter.findAll().then((cards) => cards.filter((c) => c.documentId === documentId))
  }

  async create(input: { deckId: string; documentId: string | null; front: string; back: string }) {
    return adapter.create({
      ...input,
      lastResult: "unseen",
    })
  }

  async update(id: string, input: { front?: string; back?: string; lastResult?: string; documentId?: string | null }) {
    return adapter.update(id, input)
  }

  async delete(id: string) {
    return adapter.delete(id)
  }

  async deleteByDeckId(deckId: string) {
    const all = await adapter.findAll()
    const filtered = all.filter((c) => c.deckId !== deckId)
    localStorage.setItem("spaced-study:cards", JSON.stringify(filtered))
  }
}