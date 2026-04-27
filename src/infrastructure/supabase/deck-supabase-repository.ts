import { createSupabaseAdapter } from "@/lib/storage/supabase-adapter.ts"
import type { IDeckRepository } from "@/domain/repositories/deck-repository.ts"
import type { Deck, CreateDeckInput, UpdateDeckInput } from "@/domain/models/deck.ts"

const adapter = createSupabaseAdapter<{
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}>("decks")

function mapToDeck(row: {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}): Deck {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class DeckSupabaseRepository implements IDeckRepository {
  async findAll(): Promise<Deck[]> {
    const rows = await adapter.findAll()
    return rows.map(mapToDeck)
  }

  async findById(id: string): Promise<Deck | null> {
    const row = await adapter.findById(id)
    return row ? mapToDeck(row) : null
  }

  async create(input: CreateDeckInput): Promise<Deck> {
    const row = await adapter.create({
      name: input.name,
      description: input.description,
    })
    return mapToDeck(row as any)
  }

  async update(id: string, input: UpdateDeckInput): Promise<Deck> {
    const row = await adapter.update(id, input as any)
    return mapToDeck(row as any)
  }

  async delete(id: string): Promise<void> {
    await adapter.delete(id)
  }
}