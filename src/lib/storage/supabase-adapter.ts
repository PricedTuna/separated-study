/**
 * SupabaseAdapter — adapter específico para Supabase.
 * Usa tipos directamente de Database["public"]["Tables"].
 * Requiere user_id del contexto de auth.
 */
import { supabase, getCurrentUserId } from "../supabase-client"
import type { Database } from "../../interfaces/supabase/database.types"

type DbTable = keyof Database["public"]["Tables"]
type DbRow<T extends DbTable> = Database["public"]["Tables"][T]["Row"]
type DbInsert<T extends DbTable> = Database["public"]["Tables"][T]["Insert"]
type DbUpdate<T extends DbTable> = Database["public"]["Tables"][T]["Update"]

export function createSupabaseAdapter<T extends DbTable>(tableName: T) {
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
      return data as DbRow<T>[]
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
      return data as DbRow<T>
    },

    async create(input: Omit<DbInsert<T>, "id" | "created_at" | "updated_at" | "user_id">) {
      const userId = await getCurrentUserId()
      if (!userId) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from(tableName)
        .insert({ ...input, user_id: userId } as Record<string, unknown>)
        .select()
        .single()

      if (error) throw error
      return data as DbRow<T>
    },

    async update(id: string, input: Partial<DbUpdate<T>>) {
      const userId = await getCurrentUserId()
      if (!userId) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from(tableName)
        .update(input as Record<string, unknown>)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) throw error
      return data as DbRow<T>
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

/**
 * Tipos helpers para usar en los repositorios.
 */
export type Row<T extends DbTable> = DbRow<T>
export type Insert<T extends DbTable> = DbInsert<T>
export type Update<T extends DbTable> = DbUpdate<T>