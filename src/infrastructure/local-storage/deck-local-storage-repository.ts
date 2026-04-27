import { v4 as uuid } from "../../lib/uuid"
import type { IDeckRepository } from "../../domain/repositories/deck-repository"
import type { Deck, CreateDeckInput, UpdateDeckInput } from "../../domain/models/deck"

const KEY = "spaced-study:decks"

function loadAll(): Deck[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]")
  } catch {
    return []
  }
}

function saveAll(decks: Deck[]): void {
  localStorage.setItem(KEY, JSON.stringify(decks))
}

export class DeckLocalStorageRepository implements IDeckRepository {
  async findAll(): Promise<Deck[]> {
    return loadAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async findById(id: string): Promise<Deck | null> {
    return loadAll().find((d) => d.id === id) ?? null
  }

  async create(input: CreateDeckInput): Promise<Deck> {
    const now = new Date().toISOString()
    const deck: Deck = {
      id: uuid(),
      name: input.name,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    }
    saveAll([...loadAll(), deck])
    return deck
  }

  async update(id: string, input: UpdateDeckInput): Promise<Deck> {
    const all = loadAll()
    const idx = all.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error(`Deck ${id} not found`)

    const updated: Deck = {
      ...all[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    }
    all[idx] = updated
    saveAll(all)
    return updated
  }

  async delete(id: string): Promise<void> {
    saveAll(loadAll().filter((d) => d.id !== id))
  }
}