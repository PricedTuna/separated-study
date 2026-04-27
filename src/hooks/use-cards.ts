import { useState, useEffect, useCallback } from "react"
import type { Card, CreateCardInput, UpdateCardInput, CardResult } from "../domain/models/card"
import { cardService } from "../lib/container"

export function useCards(documentId?: string) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = documentId
        ? await cardService.getByDocumentId(documentId)
        : await cardService.getAll()
      setCards(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (input: CreateCardInput): Promise<Card> => {
    const card = await cardService.create(input)
    setCards((prev) => [card, ...prev])
    return card
  }, [])

  const update = useCallback(async (id: string, input: UpdateCardInput): Promise<Card> => {
    const card = await cardService.update(id, input)
    setCards((prev) => prev.map((c) => (c.id === id ? card : c)))
    return card
  }, [])

  const recordResult = useCallback(async (id: string, result: CardResult): Promise<Card> => {
    const card = await cardService.recordResult(id, result)
    setCards((prev) => prev.map((c) => (c.id === id ? card : c)))
    return card
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await cardService.delete(id)
    setCards((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { cards, loading, error, create, update, recordResult, remove, reload: load }
}
