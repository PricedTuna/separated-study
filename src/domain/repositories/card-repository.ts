import type { Card, CreateCardInput, UpdateCardInput } from "../models/card"

/**
 * ICardRepository — contrato puro de persistencia.
 * Cambiar la implementación (localStorage → API → IndexedDB) sin tocar nada más.
 */
export interface ICardRepository {
  findAll(): Promise<Card[]>
  findById(id: string): Promise<Card | null>
  findByDocumentId(documentId: string): Promise<Card[]>
  create(input: CreateCardInput): Promise<Card>
  update(id: string, input: UpdateCardInput): Promise<Card>
  delete(id: string): Promise<void>
}
