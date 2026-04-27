/**
 * SupabaseAdapter — implementación de StorageAdapter usando Supabase.
 * Requiere user_id del contexto de auth.
 */
import { supabase, getCurrentUserId } from "../supabase-client"
import type { StorageAdapter } from "./storage-adapter"

export function createSupabaseAdapter<T extends { id: string }>(
  tableName: "documents" | "decks" | "cards"
): StorageAdapter<T> {
  return {
    async findAll() {
      const userId = await getCurrentUserId()
      if (!userId) return []
      
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
      
      if (error) throw error
      return data as T[]
    },

    async findById(id: string) {
      const userId = await getCurrentUserId()
      if (!userId) return null

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single()
      
      if (error || !data) return null
      return data as T
    },

    async create(input: Omit<T, "id" | "created_at" | "updated_at" | "user_id">) {
      const userId = await getCurrentUserId()
      if (!userId) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from(tableName)
        .insert({ ...input, user_id: userId })
        .select()
        .single()
      
      if (error) throw error
      return data as T
    },

    async update(id: string, input: Partial<T>) {
      const userId = await getCurrentUserId()
      if (!userId) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from(tableName)
        .update(input)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()
      
      if (error) throw error
      return data as T
    },

    async delete(id: string) {
      const userId = await getCurrentUserId()
      if (!userId) throw new Error("Not authenticated")

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
      
      if (error) throw error
    },
  }
}