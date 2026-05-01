import { createSupabaseAdapter } from "@/lib/storage/supabase-adapter.ts"
import type { IDeckRepository } from "@/domain/repositories/deck-repository.ts"
import type { Deck, CreateDeckInput, UpdateDeckInput } from "@/domain/models/deck.ts"

const adapter = createSupabaseAdapter<"decks">("decks")

function mapToDeck(row: Awaited<ReturnType<typeof adapter.findById>>): Deck {
  if (!row) throw new Error("Deck not found")
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
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
      description: input.description ?? null,
    })
    return mapToDeck(row)
  }

  async update(id: string, input: UpdateDeckInput): Promise<Deck> {
    const row = await adapter.update(id, {
      name: input.name,
      description: input.description ?? null,
    })
    return mapToDeck(row)
  }

  async delete(id: string): Promise<void> {
    await adapter.delete(id)
  }
}