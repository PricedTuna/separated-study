export interface ExportFolder {
  id?: string
  name: string
  parentId: string | null
}

export interface ExportDocument {
  id?: string
  title: string
  content: string
  folderId?: string | null
}

export interface ExportCard {
  front: string
  back: string
}

export interface ExportDeck {
  id?: string
  name: string
  description?: string
  cards?: ExportCard[]
}

export interface ExportData {
  version: string
  exportedAt?: string
  folders?: ExportFolder[]
  documents?: ExportDocument[]
  decks?: ExportDeck[]
}

export interface ExportSelection {
  folderIds?: string[]
  documentIds?: string[]
  deckIds?: string[]
}

export interface ImportResult {
  foldersImported: number
  documentsImported: number
  decksImported: number
  cardsImported: number
  errors: string[]
}
