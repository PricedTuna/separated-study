import type { IFolderRepository } from "../domain/repositories/folder-repository"
import type { Folder, CreateFolderInput, UpdateFolderInput } from "../domain/models/folder"

/**
 * FolderService — lógica de negocio para carpetas.
 */
export class FolderService {
  constructor(private readonly repo: IFolderRepository) {}

  getAll(): Promise<Folder[]> {
    return this.repo.findAll()
  }

  getById(id: string): Promise<Folder | null> {
    return this.repo.findById(id)
  }

  getByParentId(parentId: string | null): Promise<Folder[]> {
    return this.repo.findByParentId(parentId)
  }

  create(input: CreateFolderInput): Promise<Folder> {
    if (!input.name.trim()) throw new Error("El nombre no puede estar vacío")
    return this.repo.create({
      name: input.name.trim(),
      parentId: input.parentId,
    })
  }

  update(id: string, input: UpdateFolderInput): Promise<Folder> {
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error("El nombre no puede estar vacío")
    }
    return this.repo.update(id, input)
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}