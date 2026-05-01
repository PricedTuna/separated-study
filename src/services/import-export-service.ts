import { documentService, deckService, cardService, folderService } from "../lib/container"
import type { ExportData, ExportSelection, ImportResult } from "./import-export-types"

const CURRENT_VERSION = "1.0"

function collectFolderSubtreeIds(folderIds: Set<string>, allFolders: { id: string; parentId: string | null }[]): Set<string> {
  const result = new Set(folderIds)
  let changed = true

  while (changed) {
    changed = false
    for (const folder of allFolders) {
      if (folder.parentId && result.has(folder.parentId) && !result.has(folder.id)) {
        result.add(folder.id)
        changed = true
      }
    }
  }

  return result
}

function includeFolderAncestors(folderIds: Set<string>, allFolders: { id: string; parentId: string | null }[]): Set<string> {
  const result = new Set(folderIds)
  const byId = new Map(allFolders.map((folder) => [folder.id, folder]))

  for (const folderId of Array.from(folderIds)) {
    let current = byId.get(folderId)?.parentId ?? null
    while (current) {
      if (result.has(current)) break
      result.add(current)
      current = byId.get(current)?.parentId ?? null
    }
  }

  return result
}

export async function importData(data: ExportData): Promise<ImportResult> {
  const result: ImportResult = {
    foldersImported: 0,
    documentsImported: 0,
    decksImported: 0,
    cardsImported: 0,
    errors: [],
  }
  const folderIdMap = new Map<string, string>()

  if (data.folders) {
    const pendingFolders = [...data.folders]
    let madeProgress = true

    while (pendingFolders.length > 0 && madeProgress) {
      madeProgress = false

      for (let i = pendingFolders.length - 1; i >= 0; i--) {
        const folder = pendingFolders[i]
        const parentReady = !folder.parentId || folderIdMap.has(folder.parentId)
        if (!parentReady) continue

        try {
          const createdFolder = await folderService.create({
            name: folder.name,
            parentId: folder.parentId ? folderIdMap.get(folder.parentId) ?? null : null,
          })
          if (folder.id) folderIdMap.set(folder.id, createdFolder.id)
          result.foldersImported++
        } catch (e) {
          result.errors.push(`Failed to import folder "${folder.name}": ${(e as Error).message}`)
        }

        pendingFolders.splice(i, 1)
        madeProgress = true
      }
    }

    for (const folder of pendingFolders) {
      result.errors.push(`Failed to import folder "${folder.name}": parent folder was not found in the import file`)
    }
  }

  if (data.documents) {
    for (const doc of data.documents) {
      try {
        await documentService.create({
          title: doc.title,
          content: doc.content,
          folderId: doc.folderId ? folderIdMap.get(doc.folderId) ?? null : null,
        })
        result.documentsImported++
      } catch (e) {
        result.errors.push(`Failed to import document "${doc.title}": ${(e as Error).message}`)
      }
    }
  }

  if (data.decks) {
    for (const deck of data.decks) {
      try {
        const createdDeck = await deckService.create({
          name: deck.name,
          description: deck.description || "",
        })
        result.decksImported++

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

export async function exportAllData(selection?: ExportSelection): Promise<ExportData> {
  const [folders, documents, decks] = await Promise.all([
    folderService.getAll(),
    documentService.getAll(),
    deckService.getAll(),
  ])

  const hasSelection = Boolean(selection)
  const selectedFolderIds = selection?.folderIds ? new Set(selection.folderIds) : new Set(folders.map((folder) => folder.id))
  const selectedDocumentIds = selection?.documentIds ? new Set(selection.documentIds) : new Set(documents.map((document) => document.id))
  const selectedDeckIds = selection?.deckIds ? new Set(selection.deckIds) : new Set(decks.map((deck) => deck.id))

  const folderSubtreeIds = collectFolderSubtreeIds(selectedFolderIds, folders)
  const documentIdsFromFolders = new Set(
    documents
      .filter((document) => document.folderId && folderSubtreeIds.has(document.folderId))
      .map((document) => document.id)
  )

  const finalDocumentIds = hasSelection
    ? new Set([...selectedDocumentIds, ...documentIdsFromFolders])
    : selectedDocumentIds

  const selectedDocuments = documents.filter((document) => finalDocumentIds.has(document.id))
  const requiredFolderIds = includeFolderAncestors(
    new Set([
      ...folderSubtreeIds,
      ...selectedDocuments.map((document) => document.folderId).filter((folderId): folderId is string => Boolean(folderId)),
    ]),
    folders,
  )
  const selectedFolders = folders.filter((folder) => requiredFolderIds.has(folder.id))
  const selectedDecks = decks.filter((deck) => selectedDeckIds.has(deck.id))

  const exportDecks = await Promise.all(
    selectedDecks.map(async (deck) => {
      const cards = await cardService.getByDeckId(deck.id)
      return {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        cards: cards.map((card) => ({
          front: card.front,
          back: card.back,
        })),
      }
    })
  )

  return {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    folders: selectedFolders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
    })),
    documents: selectedDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      content: document.content,
      folderId: document.folderId,
    })),
    decks: exportDecks,
  }
}

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
    const parsed = JSON.parse(content) as ExportData

    if (!parsed.version) {
      return { data: parsed, error: "Missing version field" }
    }

    if (parsed.version !== CURRENT_VERSION) {
      return { data: parsed, error: `Unsupported version: ${parsed.version}. Expected ${CURRENT_VERSION}` }
    }

    return { data: parsed }
  } catch {
    return { data: {} as ExportData, error: "Invalid JSON format" }
  }
}

export function validateImportData(data: ExportData): string[] {
  const errors: string[] = []

  if (!data.folders && !data.documents && !data.decks) {
    errors.push("Export file must contain at least folders, documents or decks")
  }

  if (data.folders) {
    data.folders.forEach((folder, i) => {
      if (!folder.name) errors.push(`Folder ${i + 1}: missing name`)
    })
  }

  if (data.documents) {
    data.documents.forEach((doc, i) => {
      if (!doc.title) errors.push(`Document ${i + 1}: missing title`)
      if (doc.content === undefined || doc.content === null) errors.push(`Document ${i + 1}: missing content`)
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

export type { ExportData, ExportSelection, ImportResult } from "./import-export-types"
