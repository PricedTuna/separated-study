import { useState, useEffect, useCallback } from "react"
import type { Document, CreateDocumentInput, UpdateDocumentInput } from "../domain/models/document"
import { documentService } from "../lib/container"
import { getCached, setCache, invalidateCache } from "../lib/cache"
import { useSupabaseTableChanges } from "@/hooks/use-supabase-table-changes"

const CACHE_KEY = "documents"

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>(() => getCached<Document[]>(CACHE_KEY) ?? [])
  const [loading, setLoading] = useState(() => !getCached<Document[]>(CACHE_KEY))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCached<Document[]>(CACHE_KEY)
      if (cached) return cached
    }
    const data = await documentService.getAll()
    setCache(CACHE_KEY, data)
    return data
  }, [])

  useEffect(() => {
    let cancelled = false
    load().then(data => {
      if (!cancelled) setDocuments(data)
    }).catch(e => {
      if (!cancelled) setError((e as Error).message)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [load])

  const reload = useCallback(async (forceRefresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await load(forceRefresh)
      setDocuments(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [load])

  const refreshFromDatabase = useCallback(async () => {
    setError(null)
    try {
      const data = await load(true)
      setDocuments(data)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [load])

  useSupabaseTableChanges({
    table: "documents",
    onChange: refreshFromDatabase,
  })

  const create = useCallback(async (input: CreateDocumentInput): Promise<Document> => {
    const doc = await documentService.create(input)
    setDocuments((prev) => [doc, ...prev])
    invalidateCache(CACHE_KEY)
    return doc
  }, [])

  const update = useCallback(async (id: string, input: UpdateDocumentInput): Promise<Document> => {
    const doc = await documentService.update(id, input)
    setDocuments((prev) => prev.map((d) => (d.id === id ? doc : d)))
    invalidateCache(CACHE_KEY)
    return doc
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await documentService.delete(id)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    invalidateCache(CACHE_KEY)
  }, [])

  return { documents, loading, error, create, update, remove, reload }
}
