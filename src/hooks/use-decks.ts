import { useState, useEffect, useCallback } from "react"
import { deckService } from "../lib/container"
import type { Deck, CreateDeckInput, UpdateDeckInput } from "../domain/models/deck"

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  const loadDecks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await deckService.getAll()
      setDecks(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
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

  return { decks, loading, create, update, remove, reload: loadDecks }
}
