import { useState, useEffect } from "react"
import { deckService } from "../lib/container"
import type { Deck, CreateDeckInput, UpdateDeckInput } from "../domain/models/deck"

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDecks()
  }, [])

  async function loadDecks() {
    setLoading(true)
    const data = await deckService.getAll()
    setDecks(data)
    setLoading(false)
  }

  async function create(input: CreateDeckInput): Promise<Deck> {
    const deck = await deckService.create(input)
    setDecks((prev) => [deck, ...prev])
    return deck
  }

  async function update(id: string, input: UpdateDeckInput): Promise<Deck> {
    const deck = await deckService.update(id, input)
    setDecks((prev) => prev.map((d) => (d.id === id ? deck : d)))
    return deck
  }

  async function remove(id: string): Promise<void> {
    await deckService.delete(id)
    setDecks((prev) => prev.filter((d) => d.id !== id))
  }

  return { decks, loading, create, update, remove, reload: loadDecks }
}