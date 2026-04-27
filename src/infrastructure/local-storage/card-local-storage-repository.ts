import { v4 as uuid } from "../../lib/uuid"
import type { ICardRepository } from "../../domain/repositories/card-repository"
import type { Card, CreateCardInput, UpdateCardInput } from "../../domain/models/card"

const KEY = "spaced-study:cards"

function loadAll(): Card[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]")
  } catch {
    return []
  }
}

function saveAll(cards: Card[]): void {
  localStorage.setItem(KEY, JSON.stringify(cards))
}

export class CardLocalStorageRepository implements ICardRepository {
  async findAll(): Promise<Card[]> {
    return loadAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async findById(id: string): Promise<Card | null> {
    return loadAll().find((c) => c.id === id) ?? null
  }

  async findByDocumentId(documentId: string): Promise<Card[]> {
    return loadAll().filter((c) => c.documentId === documentId)
  }

  async create(input: CreateCardInput): Promise<Card> {
    const now = new Date().toISOString()
    const card: Card = {
      id: uuid(),
      documentId: input.documentId,
      front: input.front,
      back: input.back,
      lastResult: "unseen",
      createdAt: now,
      updatedAt: now,
    }
    saveAll([...loadAll(), card])
    return card
  }

  async update(id: string, input: UpdateCardInput): Promise<Card> {
    const all = loadAll()
    const idx = all.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error(`Card ${id} not found`)

    const updated: Card = {
      ...all[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    }
    all[idx] = updated
    saveAll(all)
    return updated
  }

  async delete(id: string): Promise<void> {
    saveAll(loadAll().filter((c) => c.id !== id))
  }
}
