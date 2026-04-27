import { createLocalStorageAdapter } from "../../lib/storage/local-storage-adapter"
import type { IDocumentRepository } from "../../domain/repositories/document-repository"
import type { Document } from "../../domain/models/document"

const adapter = createLocalStorageAdapter<Document>("spaced-study:documents")

export class DocumentLocalStorageRepository implements IDocumentRepository {
  async findAll() {
    return adapter.findAll()
  }

  async findById(id: string) {
    return adapter.findById(id)
  }

  async create(input: { title: string; content: string }) {
    return adapter.create(input)
  }

  async update(id: string, input: { title?: string; content?: string }) {
    return adapter.update(id, input)
  }

  async delete(id: string) {
    return adapter.delete(id)
  }
}