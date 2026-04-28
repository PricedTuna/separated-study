import { supabase, getCurrentUserId } from "../../lib/supabase-client"
import type { Database } from "../../interfaces/supabase/database.types"
import type { ICardRepository } from "../../domain/repositories/card-repository"
import type { Card, CreateCardInput, UpdateCardInput, CardResult } from "../../domain/models/card"

type CardsRow = Database["public"]["Tables"]["cards"]["Row"]

/**
 * Mapea la fila de la DB (snake_case) al modelo domain (camelCase).
 */
function mapToCard(row: CardsRow): Card {
  return {
    id: row.id,
    deckId: row.deck_id,
    documentId: row.document_id,
    front: row.front,
    back: row.back,
    lastResult: (row.last_result ?? "unseen") as CardResult,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  }
}

/**
 * Mapea el input del dominio a formato DB para insert.
 */
function toDbInsert(input: CreateCardInput): Omit<CardsRow, "id" | "created_at" | "updated_at" | "user_id"> {
  return {
    deck_id: input.deckId,
    document_id: input.documentId,
    front: input.front,
    back: input.back,
    last_result: "unseen",
  }
}

/**
 * Mapea el input del dominio a formato DB para update.
 */
function toDbUpdate(input: UpdateCardInput): Partial<CardsRow> {
  const result: Partial<CardsRow> = {}
  if (input.front !== undefined) result.front = input.front
  if (input.back !== undefined) result.back = input.back
  if (input.lastResult !== undefined) result.last_result = input.lastResult
  if (input.documentId !== undefined) result.document_id = input.documentId
  return result
}

export class CardSupabaseRepository implements ICardRepository {
  private adapter = supabase

  async findAll(): Promise<Card[]> {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await this.adapter
      .from("cards")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) throw error
    return (data as CardsRow[]).map(mapToCard)
  }

  async findById(id: string): Promise<Card | null> {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await this.adapter
      .from("cards")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error || !data) return null
    return mapToCard(data as CardsRow)
  }

  async findByDeckId(deckId: string): Promise<Card[]> {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await this.adapter
      .from("cards")
      .select("*")
      .eq("deck_id", deckId)
      .eq("user_id", userId)

    if (error) throw error
    return (data as CardsRow[]).map(mapToCard)
  }

  async findByDocumentId(documentId: string): Promise<Card[]> {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await this.adapter
      .from("cards")
      .select("*")
      .eq("document_id", documentId)
      .eq("user_id", userId)

    if (error) throw error
    return (data as CardsRow[]).map(mapToCard)
  }

  async create(input: CreateCardInput): Promise<Card> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { data, error } = await this.adapter
      .from("cards")
      .insert({ ...toDbInsert(input), user_id: userId } as Record<string, unknown>)
      .select()
      .single()

    if (error) throw error
    return mapToCard(data as CardsRow)
  }

  async update(id: string, input: UpdateCardInput): Promise<Card> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { data, error } = await this.adapter
      .from("cards")
      .update(toDbUpdate(input) as Record<string, unknown>)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return mapToCard(data as CardsRow)
  }

  async delete(id: string): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { error } = await this.adapter
      .from("cards")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) throw error
  }

  async deleteByDeckId(deckId: string): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { error } = await this.adapter
      .from("cards")
      .delete()
      .eq("deck_id", deckId)
      .eq("user_id", userId)

    if (error) throw error
  }
}