import { createLocalStorageAdapter } from "../../lib/storage/local-storage-adapter"
import type { IDocumentRepository } from "../../domain/repositories/document-repository"
import type { Document, CreateDocumentInput, UpdateDocumentInput } from "../../domain/models/document"

const adapter = createLocalStorageAdapter<Document>("spaced-study:documents")

export class DocumentLocalStorageRepository implements IDocumentRepository {
  async findAll() {
    return adapter.findAll()
  }

  async findById(id: string) {
    return adapter.findById(id)
  }

  async create(input: CreateDocumentInput) {
    return adapter.create({
      ...input,
      folderId: input.folderId ?? null,
    } as unknown as Document)
  }

  async update(id: string, input: UpdateDocumentInput) {
    return adapter.update(id, {
      ...input,
      folderId: input.folderId ?? undefined,
    } as Document)
  }

  async delete(id: string) {
    return adapter.delete(id)
  }
}