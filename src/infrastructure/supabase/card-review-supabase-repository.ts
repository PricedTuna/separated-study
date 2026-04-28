import { supabase, getCurrentUserId } from "../../lib/supabase-client"
import type { ICardReviewRepository } from "../../domain/repositories/card-review-repository"
import type { CardReview, CreateCardReviewInput, UpdateCardReviewInput } from "../models/card-review"

function mapToCardReview(row: {
  id: string
  card_id: string
  user_id: string
  stability: number
  difficulty: number
  due: string
  last_review: string
  interval: number
  reps: number
  lapses: number
  state: string
  updated_at: string
}): CardReview {
  return {
    id: row.id,
    cardId: row.card_id,
    userId: row.user_id,
    stability: row.stability,
    difficulty: row.difficulty,
    due: row.due,
    lastReview: row.last_review,
    interval: row.interval,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as CardReview["state"],
    updatedAt: row.updated_at,
  }
}

export class CardReviewSupabaseRepository implements ICardReviewRepository {
  async findById(id: string): Promise<CardReview | null> {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await supabase
      .from("card_reviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error || !data) return null
    return mapToCardReview(data)
  }

  async findByCardId(cardId: string): Promise<CardReview | null> {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data, error } = await supabase
      .from("card_reviews")
      .select("*")
      .eq("card_id", cardId)
      .eq("user_id", userId)
      .single()

    if (error || !data) return null
    return mapToCardReview(data)
  }

  async findDueForReview(userId: string): Promise<CardReview[]> {
    const { data, error } = await supabase
      .from("card_reviews")
      .select("*")
      .eq("user_id", userId)
      .lte("due", new Date().toISOString())
      .order("due", { ascending: true })

    if (error) throw error
    return data.map(mapToCardReview)
  }

  async create(input: CreateCardReviewInput): Promise<CardReview> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("card_reviews")
      .insert({
        card_id: input.cardId,
        stability: input.stability,
        difficulty: input.difficulty,
        due: input.due,
        last_review: input.lastReview,
        interval: input.interval,
        reps: input.reps,
        lapses: input.lapses,
        state: input.state,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error
    return mapToCardReview(data)
  }

  async update(id: string, input: UpdateCardReviewInput): Promise<CardReview> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const updateData: Record<string, unknown> = {}
    if (input.stability !== undefined) updateData.stability = input.stability
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty
    if (input.due !== undefined) updateData.due = input.due
    if (input.lastReview !== undefined) updateData.last_review = input.lastReview
    if (input.interval !== undefined) updateData.interval = input.interval
    if (input.reps !== undefined) updateData.reps = input.reps
    if (input.lapses !== undefined) updateData.lapses = input.lapses
    if (input.state !== undefined) updateData.state = input.state

    const { data, error } = await supabase
      .from("card_reviews")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return mapToCardReview(data)
  }

  async delete(cardId: string): Promise<void> {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("card_reviews")
      .delete()
      .eq("card_id", cardId)
      .eq("user_id", userId)

    if (error) throw error
  }
}