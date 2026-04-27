import { supabase, getCurrentUserId } from "../../lib/supabase-client"
import type { ICardRepository } from "../../domain/repositories/card-repository"
import type { Card, CreateCardInput, UpdateCardInput, CardResult } from "../../domain/models/card"

function mapToCard(row: {
  id: string
  deck_id: string
  document_id: string | null
  front: string
  back: string
  last_result: string
  created_at: string
  updated_at: string
}): Card {
  return {
    id: row.id,
    deckId: row.deck_id,
    documentId: row.document_id,
    front: row.front,
    back: row.back,
    lastResult: row.last_result as CardResult,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class CardSupabaseRepository implements ICardRepository {
  async findAll(): Promise<Card[]> {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) throw error
    return data.map(mapToCard)
  }

  async findById(id: string): Promise<Card | null> {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error || !data) return null
    return mapToCard(data)
  }

  async findByDeckId(deckId: string): Promise<Card[]> {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", deckId)
      .eq("user_id", userId)

    if (error) throw error
    return data.map(mapToCard)
  }

  async findByDocumentId(documentId: string): Promise<Card[]> {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("document_id", documentId)
      .eq("user_id", userId)

    if (error) throw error
    return data.map(mapToCard)
  }

  async create(input: CreateCardInput): Promise<Card> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("cards")
      .insert({
        deck_id: input.deckId,
        document_id: input.documentId,
        front: input.front,
        back: input.back,
        last_result: "unseen",
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error
    return mapToCard(data)
  }

  async update(id: string, input: UpdateCardInput): Promise<Card> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const updateData: Record<string, any> = {}
    if (input.front !== undefined) updateData.front = input.front
    if (input.back !== undefined) updateData.back = input.back
    if (input.lastResult !== undefined) updateData.last_result = input.lastResult
    if (input.documentId !== undefined) updateData.document_id = input.documentId

    const { data, error } = await supabase
      .from("cards")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return mapToCard(data)
  }

  async delete(id: string): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) throw error
  }

  async deleteByDeckId(deckId: string): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("deck_id", deckId)
      .eq("user_id", userId)

    if (error) throw error
  }
}