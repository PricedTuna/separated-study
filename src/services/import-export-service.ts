import { documentService, deckService, cardService } from "../lib/container"
import type { ExportData, ImportResult } from "../services/import-export-service"

export async function importData(data: ExportData): Promise<ImportResult> {
  const result: ImportResult = {
    documentsImported: 0,
    decksImported: 0,
    cardsImported: 0,
    errors: [],
  }

  // Import documents
  if (data.documents) {
    for (const doc of data.documents) {
      try {
        await documentService.create({
          title: doc.title,
          content: doc.content,
        })
        result.documentsImported++
      } catch (e) {
        result.errors.push(`Failed to import document "${doc.title}": ${(e as Error).message}`)
      }
    }
  }

  // Import decks with their cards
  if (data.decks) {
    for (const deck of data.decks) {
      try {
        // Create deck
        const createdDeck = await deckService.create({
          name: deck.name,
          description: deck.description || "",
        })
        result.decksImported++

        // Add cards to deck
        if (deck.cards) {
          for (const card of deck.cards) {
            try {
              await cardService.create({
                front: card.front,
                back: card.back,
                deckId: createdDeck.id,
                documentId: null,
              })
              result.cardsImported++
            } catch (e) {
              result.errors.push(`Failed to import card in deck "${deck.name}": ${(e as Error).message}`)
            }
          }
        }
      } catch (e) {
        result.errors.push(`Failed to import deck "${deck.name}": ${(e as Error).message}`)
      }
    }
  }

  return result
}

export async function exportAllData(): Promise<ExportData> {
  const documents = await documentService.getAll()
  const decks = await deckService.getAll()

  const exportDecks = await Promise.all(
    decks.map(async (deck) => {
      const cards = await cardService.getByDeckId(deck.id)
      return {
        name: deck.name,
        description: deck.description,
        cards: cards.map((c) => ({
          front: c.front,
          back: c.back,
        })),
      }
    })
  )

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    documents: documents.map((d) => ({
      title: d.title,
      content: d.content,
    })),
    decks: exportDecks,
  }
}