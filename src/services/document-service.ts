import type { IDocumentRepository } from "../domain/repositories/document-repository"
import type { Document, CreateDocumentInput, UpdateDocumentInput } from "../domain/models/document"

/**
 * DocumentService — lógica de negocio pura.
 * No sabe nada de cómo se persisten los datos, solo opera a través del repo.
 */
export class DocumentService {
  constructor(private readonly repo: IDocumentRepository) {}

  getAll(): Promise<Document[]> {
    return this.repo.findAll()
  }

  getById(id: string): Promise<Document | null> {
    return this.repo.findById(id)
  }

  create(input: CreateDocumentInput): Promise<Document> {
    if (!input.title.trim()) throw new Error("El título no puede estar vacío")
    return this.repo.create({
      title: input.title.trim(),
      content: input.content,
    })
  }

  update(id: string, input: UpdateDocumentInput): Promise<Document> {
    if (input.title !== undefined && !input.title.trim()) {
      throw new Error("El título no puede estar vacío")
    }
    return this.repo.update(id, input)
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
