import { useState, useEffect, useCallback } from "react"
import type { Document, CreateDocumentInput, UpdateDocumentInput } from "../domain/models/document"
import { documentService } from "../lib/container"
import { getCached, setCache, invalidateCache } from "../lib/cache"

const CACHE_KEY = "documents"

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true)
    setError(null)
    try {
      if (!forceRefresh) {
        const cached = getCached<Document[]>(CACHE_KEY)
        if (cached) {
          setDocuments(cached)
          setLoading(false)
          return
        }
      }
      const data = await documentService.getAll()
      setCache(CACHE_KEY, data)
      setDocuments(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

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

  return { documents, loading, error, create, update, remove, reload: load }
}
