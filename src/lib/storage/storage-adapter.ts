/**
 * StorageAdapter — contrato genérico para persistencia.
 * Implementá esta interfaz para cambiar el backend (localStorage, IndexedDB, API, etc.)
 */
export interface StorageAdapter<T extends { id: string }> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(item: T): Promise<T>
  update(id: string, item: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}