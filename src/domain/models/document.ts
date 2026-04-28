export interface Document {
  id: string
  title: string
  content: string // markdown content
  folderId: string | null
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export type CreateDocumentInput = Pick<Document, "title" | "content" | "folderId">
export type UpdateDocumentInput = Partial<Pick<Document, "title" | "content" | "folderId">>
