export interface Document {
  id: string
  title: string
  content: string // markdown content
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export type CreateDocumentInput = Pick<Document, "title" | "content">
export type UpdateDocumentInput = Partial<Pick<Document, "title" | "content">>
