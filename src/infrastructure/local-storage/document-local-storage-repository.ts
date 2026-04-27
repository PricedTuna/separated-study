import { v4 as uuid } from "../../lib/uuid"
import type { IDocumentRepository } from "../../domain/repositories/document-repository"
import type { Document, CreateDocumentInput, UpdateDocumentInput } from "../../domain/models/document"

const KEY = "spaced-study:documents"

function loadAll(): Document[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]")
  } catch {
    return []
  }
}

function saveAll(docs: Document[]): void {
  localStorage.setItem(KEY, JSON.stringify(docs))
}

export class DocumentLocalStorageRepository implements IDocumentRepository {
  async findAll(): Promise<Document[]> {
    return loadAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async findById(id: string): Promise<Document | null> {
    return loadAll().find((d) => d.id === id) ?? null
  }

  async create(input: CreateDocumentInput): Promise<Document> {
    const now = new Date().toISOString()
    const doc: Document = {
      id: uuid(),
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    }
    saveAll([...loadAll(), doc])
    return doc
  }

  async update(id: string, input: UpdateDocumentInput): Promise<Document> {
    const all = loadAll()
    const idx = all.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error(`Document ${id} not found`)

    const updated: Document = {
      ...all[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    }
    all[idx] = updated
    saveAll(all)
    return updated
  }

  async delete(id: string): Promise<void> {
    saveAll(loadAll().filter((d) => d.id !== id))
  }
}
