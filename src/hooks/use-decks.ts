import { useState, useEffect, useCallback } from "react"
import { deckService } from "../lib/container"
import type { Deck, CreateDeckInput, UpdateDeckInput } from "../domain/models/deck"

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDecks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await deckService.getAll()
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
    return deck
  }, [])

  const update = useCallback(async (id: string, input: UpdateDeckInput): Promise<Deck> => {
    const deck = await deckService.update(id, input)
    setDecks((prev) => prev.map((d) => (d.id === id ? deck : d)))
    return deck
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await deckService.delete(id)
    setDecks((prev) => prev.filter((d) => d.id !== id))
  }, [])

  return { decks, loading, error, create, update, remove, reload: loadDecks }
}
