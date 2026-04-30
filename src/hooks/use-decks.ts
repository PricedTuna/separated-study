import { useState, useEffect, useCallback } from "react"
import { deckService } from "../lib/container"
import { getCached, setCache, invalidateCache } from "../lib/cache"
import type { Deck, CreateDeckInput, UpdateDeckInput } from "../domain/models/deck"

const CACHE_KEY = "decks"

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDecks = useCallback(async (forceRefresh = false) => {
    setLoading(true)
    setError(null)
    try {
      if (!forceRefresh) {
        const cached = getCached<Deck[]>(CACHE_KEY)
        if (cached) {
          setDecks(cached)
          setLoading(false)
          return
        }
      }
      const data = await deckService.getAll()
      setCache(CACHE_KEY, data)
      setDecks(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDecks()
  }, [loadDecks])

  const create = useCallback(async (input: CreateDeckInput): Promise<Deck> => {
    const deck = await deckService.create(input)
    setDecks((prev) => [deck, ...prev])
    invalidateCache(CACHE_KEY)
    return deck
  }, [])

  const update = useCallback(async (id: string, input: UpdateDeckInput): Promise<Deck> => {
    const deck = await deckService.update(id, input)
    setDecks((prev) => prev.map((d) => (d.id === id ? deck : d)))
    invalidateCache(CACHE_KEY)
    return deck
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await deckService.delete(id)
    setDecks((prev) => prev.filter((d) => d.id !== id))
    invalidateCache(CACHE_KEY)
  }, [])

  return { decks, loading, error, create, update, remove, reload: loadDecks }
}
