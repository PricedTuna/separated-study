import { createSupabaseAdapter } from "@/lib/storage/supabase-adapter.ts"
import type { IDocumentRepository } from "@/domain/repositories/document-repository.ts"
import type { Document, CreateDocumentInput, UpdateDocumentInput } from "@/domain/models/document.ts"

const adapter = createSupabaseAdapter<{
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}>("documents")

function mapToDocument(row: {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}): Document {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class DocumentSupabaseRepository implements IDocumentRepository {
  async findAll(): Promise<Document[]> {
    const rows = await adapter.findAll()
    return rows.map(mapToDocument)
  }

  async findById(id: string): Promise<Document | null> {
    const row = await adapter.findById(id)
    return row ? mapToDocument(row) : null
  }

  async create(input: CreateDocumentInput): Promise<Document> {
    const row = await adapter.create({
      title: input.title,
      content: input.content,
    })
    return mapToDocument(row as any)
  }

  async update(id: string, input: UpdateDocumentInput): Promise<Document> {
    const row = await adapter.update(id, input as any)
    return mapToDocument(row as any)
  }

  async delete(id: string): Promise<void> {
    await adapter.delete(id)
  }
}