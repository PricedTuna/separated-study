import { useState, useEffect, useCallback } from "react"
import type { Folder, CreateFolderInput, UpdateFolderInput } from "../domain/models/folder"
import { folderService } from "../lib/container"
import { getCached, setCache, invalidateCache } from "../lib/cache"

const CACHE_KEY = "folders"

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>(() => getCached<Folder[]>(CACHE_KEY) ?? [])
  const [loading, setLoading] = useState(() => !getCached<Folder[]>(CACHE_KEY))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCached<Folder[]>(CACHE_KEY)
      if (cached) return cached
    }
    const data = await folderService.getAll()
    setCache(CACHE_KEY, data)
    return data
  }, [])

  useEffect(() => {
    let cancelled = false
    load().then(data => {
      if (!cancelled) setFolders(data)
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
      setFolders(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [load])

  const create = useCallback(async (input: CreateFolderInput): Promise<Folder> => {
    const folder = await folderService.create(input)
    setFolders((prev) => [...prev, folder])
    invalidateCache(CACHE_KEY)
    return folder
  }, [])

  const update = useCallback(async (id: string, input: UpdateFolderInput): Promise<Folder> => {
    const folder = await folderService.update(id, input)
    setFolders((prev) => prev.map((f) => (f.id === id ? folder : f)))
    invalidateCache(CACHE_KEY)
    return folder
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await folderService.delete(id)
    setFolders((prev) => prev.filter((f) => f.id !== id))
    invalidateCache(CACHE_KEY)
  }, [])

  return { folders, loading, error, create, update, remove, reload }
}