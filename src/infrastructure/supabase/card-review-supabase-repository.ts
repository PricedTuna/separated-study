import { supabase, getCurrentUserId } from "../../lib/supabase-client"
import type { Database } from "../../interfaces/supabase/database.types"
import type { ICardReviewRepository } from "../../domain/repositories/card-review-repository"
import type { CardReview, CreateCardReviewInput, UpdateCardReviewInput } from "../../domain/models/card-review"

type CardReviewsRow = Database["public"]["Tables"]["card_reviews"]["Row"]

/**
 * Mapea la fila de la DB (snake_case) al modelo domain (camelCase).
 */
function mapToCardReview(row: CardReviewsRow): CardReview {
  return {
    id: row.id,
    cardId: row.card_id ?? "",
    userId: row.user_id ?? "",
    stability: row.stability ?? 0,
    difficulty: row.difficulty ?? 0,
    due: row.due ?? "",
    lastReview: row.last_review ?? "",
    interval: row.interval ?? 0,
    reps: row.reps ?? 0,
    lapses: row.lapses ?? 0,
    state: (row.state as CardReview["state"]) ?? "unknown",
    createdAt: row.updated_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }
}

/**
 * Mapea el input del dominio a formato DB para insert.
 */
function toDbInsert(input: CreateCardReviewInput, userId: string): Omit<CardReviewsRow, "id" | "updated_at"> {
  return {
    card_id: input.cardId,
    user_id: userId,
    stability: input.stability,
    difficulty: input.difficulty,
    due: input.due,
    last_review: input.lastReview,
    interval: input.interval,
    reps: input.reps,
    lapses: input.lapses,
    state: input.state,
  }
}

/**
 * Mapea el input del dominio a formato DB para update.
 */
function toDbUpdate(input: UpdateCardReviewInput): Partial<CardReviewsRow> {
  const result: Partial<CardReviewsRow> = {}
  if (input.stability !== undefined) result.stability = input.stability
  if (input.difficulty !== undefined) result.difficulty = input.difficulty
  if (input.due !== undefined) result.due = input.due
  if (input.lastReview !== undefined) result.last_review = input.lastReview
  if (input.interval !== undefined) result.interval = input.interval
  if (input.reps !== undefined) result.reps = input.reps
  if (input.lapses !== undefined) result.lapses = input.lapses
  if (input.state !== undefined) result.state = input.state
  return result
}

export class CardReviewSupabaseRepository implements ICardReviewRepository {
  private adapter = supabase

  async findById(id: string): Promise<CardReview | null> {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await this.adapter
      .from("card_reviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle()

    if (error || !data) return null
    return mapToCardReview(data as CardReviewsRow)
  }

  async findByCardId(cardId: string): Promise<CardReview | null> {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await this.adapter
      .from("card_reviews")
      .select("*")
      .eq("card_id", cardId)
      .eq("user_id", userId)
      .maybeSingle()

    if (error || !data) return null
    return mapToCardReview(data as CardReviewsRow)
  }

  async findDueForReview(userId: string): Promise<CardReview[]> {
    const { data, error } = await this.adapter
      .from("card_reviews")
      .select("*")
      .eq("user_id", userId)
      .lte("due", new Date().toISOString())
      .order("due", { ascending: true })

    if (error) throw error
    return (data as CardReviewsRow[]).map(mapToCardReview)
  }

  async create(input: CreateCardReviewInput): Promise<CardReview> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { data, error } = await this.adapter
      .from("card_reviews")
      .insert(toDbInsert(input, userId) as Record<string, unknown>)
      .select()
      .single()

    if (error) throw error
    return mapToCardReview(data as CardReviewsRow)
  }

  async update(id: string, input: UpdateCardReviewInput): Promise<CardReview> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { data, error } = await this.adapter
      .from("card_reviews")
      .update(toDbUpdate(input) as Record<string, unknown>)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return mapToCardReview(data as CardReviewsRow)
  }

  async delete(cardId: string): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { error } = await this.adapter
      .from("card_reviews")
      .delete()
      .eq("card_id", cardId)
      .eq("user_id", userId)

    if (error) throw error
  }
}