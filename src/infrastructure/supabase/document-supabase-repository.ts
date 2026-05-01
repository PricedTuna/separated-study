import { createSupabaseAdapter } from "@/lib/storage/supabase-adapter.ts"
import type { IDocumentRepository } from "@/domain/repositories/document-repository.ts"
import type { Document, CreateDocumentInput, UpdateDocumentInput } from "@/domain/models/document.ts"

const adapter = createSupabaseAdapter<"documents">("documents")

function mapToDocument(row: Awaited<ReturnType<typeof adapter.findById>>): Document {
  if (!row) throw new Error("Document not found")
  return {
    id: row.id,
    title: row.title,
    content: row.content ?? "",
    folderId: row.folder_id,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
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
      content: input.content ?? null,
      folder_id: input.folderId ?? null,
    })
    return mapToDocument(row)
  }

  async update(id: string, input: UpdateDocumentInput): Promise<Document> {
    const row = await adapter.update(id, {
      title: input.title,
      content: input.content ?? null,
      folder_id: input.folderId ?? null,
    })
    return mapToDocument(row)
  }

  async delete(id: string): Promise<void> {
    await adapter.delete(id)
  }
}