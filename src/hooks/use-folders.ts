import { useState, useEffect, useCallback } from "react"
import type { Folder, CreateFolderInput, UpdateFolderInput } from "../domain/models/folder"
import { folderService } from "../lib/container"

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setFolders(await folderService.getAll())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (input: CreateFolderInput): Promise<Folder> => {
    const folder = await folderService.create(input)
    setFolders((prev) => [...prev, folder])
    return folder
  }, [])

  const update = useCallback(async (id: string, input: UpdateFolderInput): Promise<Folder> => {
    const folder = await folderService.update(id, input)
    setFolders((prev) => prev.map((f) => (f.id === id ? folder : f)))
    return folder
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await folderService.delete(id)
    setFolders((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return { folders, loading, error, create, update, remove, reload: load }
}