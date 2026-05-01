import { createSupabaseAdapter } from "@/lib/storage/supabase-adapter.ts"
import type { IFolderRepository } from "@/domain/repositories/folder-repository.ts"
import type { Folder, CreateFolderInput, UpdateFolderInput } from "@/domain/models/folder.ts"

const adapter = createSupabaseAdapter<"folders">("folders")

function mapToFolder(row: Awaited<ReturnType<typeof adapter.findById>>): Folder {
  if (!row) throw new Error("Folder not found")
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    userId: row.user_id,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }
}

export class FolderSupabaseRepository implements IFolderRepository {
  async findAll(): Promise<Folder[]> {
    const rows = await adapter.findAll()
    return rows.map(mapToFolder)
  }

  async findById(id: string): Promise<Folder | null> {
    const row = await adapter.findById(id)
    return row ? mapToFolder(row) : null
  }

  async findByParentId(parentId: string | null): Promise<Folder[]> {
    const all = await adapter.findAll()
    return all.filter((f) => f.parent_id === parentId).map(mapToFolder)
  }

  async create(input: CreateFolderInput): Promise<Folder> {
    const row = await adapter.create({
      name: input.name,
      parent_id: input.parentId ?? null,
    })
    return mapToFolder(row)
  }

  async update(id: string, input: UpdateFolderInput): Promise<Folder> {
    const row = await adapter.update(id, {
      name: input.name,
      parent_id: input.parentId ?? null,
    })
    return mapToFolder(row)
  }

  async delete(id: string): Promise<void> {
    await adapter.delete(id)
  }
}