import type { Folder, CreateFolderInput, UpdateFolderInput } from "../models/folder"

/**
 * IFolderRepository — contrato puro de persistencia para carpetas.
 */
export interface IFolderRepository {
  findAll(): Promise<Folder[]>
  findById(id: string): Promise<Folder | null>
  findByParentId(parentId: string | null): Promise<Folder[]>
  create(input: CreateFolderInput): Promise<Folder>
  update(id: string, input: UpdateFolderInput): Promise<Folder>
  delete(id: string): Promise<void>
}