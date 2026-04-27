/**
 * LocalStorageAdapter — implementación genérica de StorageAdapter usando localStorage.
 * Usalo como base para cualquier modelo.
 */
import type { StorageAdapter } from "./storage-adapter"

export function createLocalStorageAdapter<T extends { id: string; createdAt: string; updatedAt: string }>(
  key: string
): StorageAdapter<T> {
  const loadAll = (): T[] => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "[]")
    } catch {
      return []
    }
  }

  const saveAll = (items: T[]): void => {
    localStorage.setItem(key, JSON.stringify(items))
  }

  return {
    async findAll(): Promise<T[]> {
      return loadAll().sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    },

    async findById(id: string): Promise<T | null> {
      return loadAll().find((item) => item.id === id) ?? null
    },

    async create(input: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
      const now = new Date().toISOString()
      const item = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      } as T
      saveAll([...loadAll(), item])
      return item
    },

    async update(id: string, input: Partial<T>): Promise<T> {
      const all = loadAll()
      const idx = all.findIndex((item) => item.id === id)
      if (idx === -1) throw new Error(`${key} ${id} not found`)

      const updated: T = {
        ...all[idx],
        ...input,
        updatedAt: new Date().toISOString(),
      }
      all[idx] = updated
      saveAll(all)
      return updated
    },

    async delete(id: string): Promise<void> {
      saveAll(loadAll().filter((item) => item.id !== id))
    },
  }
}