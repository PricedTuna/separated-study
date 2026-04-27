import { documentService, deckService, cardService } from "../lib/container"
import type { ExportData, ImportResult } from "./import-export-types"

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

// ============================================================================
// Utility functions
// ============================================================================

const CURRENT_VERSION = "1.0"

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

export function downloadAsFile(data: ExportData, filename: string): void {
  const json = exportToJSON(data)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseImportFile(content: string): { data: ExportData; error?: string } {
  try {
    const parsed = JSON.parse(content)
    
    // Validate version
    if (!parsed.version) {
      return { data: parsed, error: "Missing version field" }
    }
    
    if (parsed.version !== CURRENT_VERSION) {
      return { data: parsed, error: `Unsupported version: ${parsed.version}. Expected ${CURRENT_VERSION}` }
    }
    
    return { data: parsed }
  } catch (e) {
    return { data: {} as ExportData, error: "Invalid JSON format" }
  }
}

export function validateImportData(data: ExportData): string[] {
  const errors: string[] = []
  
  if (!data.documents && !data.decks) {
    errors.push("Export file must contain at least documents or decks")
  }
  
  if (data.documents) {
    data.documents.forEach((doc, i) => {
      if (!doc.title) errors.push(`Document ${i + 1}: missing title`)
      if (!doc.content) errors.push(`Document ${i + 1}: missing content`)
    })
  }
  
  if (data.decks) {
    data.decks.forEach((deck, i) => {
      if (!deck.name) errors.push(`Deck ${i + 1}: missing name`)
      
      if (deck.cards) {
        deck.cards.forEach((card, j) => {
          if (!card.front) errors.push(`Deck "${deck.name}" - Card ${j + 1}: missing front`)
          if (!card.back) errors.push(`Deck "${deck.name}" - Card ${j + 1}: missing back`)
        })
      }
    })
  }
  
  return errors
}

// Re-export types
export type { ExportData, ImportResult } from "./import-export-types"