import type { Document, CreateDocumentInput, UpdateDocumentInput } from "../models/document"

/**
 * IDocumentRepository — contrato puro de persistencia.
 * Cambiar la implementación (localStorage → API → IndexedDB) sin tocar nada más.
 */
export interface IDocumentRepository {
  findAll(): Promise<Document[]>
  findById(id: string): Promise<Document | null>
  create(input: CreateDocumentInput): Promise<Document>
  update(id: string, input: UpdateDocumentInput): Promise<Document>
  delete(id: string): Promise<void>
}
