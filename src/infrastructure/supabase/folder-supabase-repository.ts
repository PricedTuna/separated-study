import { createSupabaseAdapter } from "@/lib/storage/supabase-adapter.ts"
import type { IFolderRepository } from "@/domain/repositories/folder-repository.ts"
import type { Folder, CreateFolderInput, UpdateFolderInput } from "@/domain/models/folder.ts"

const adapter = createSupabaseAdapter<{
  id: string
  name: string
  parent_id: string | null
  user_id: string
  created_at: string
  updated_at: string
}>("folders")

function mapToFolder(row: {
  id: string
  name: string
  parent_id: string | null
  user_id: string
  created_at: string
  updated_at: string
}): Folder {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
    const client = (adapter as any).client
    let query = client.from("folders").select("*")
    if (parentId === null) {
      query = query.is("parent_id", null)
    } else {
      query = query.eq("parent_id", parentId)
    }
    const { data, error } = await query
    if (error) throw error
    return (data || []).map(mapToFolder)
  }

  async create(input: CreateFolderInput): Promise<Folder> {
    const row = await adapter.create({
      name: input.name,
      parent_id: input.parentId ?? null,
    })
    return mapToFolder(row as any)
  }

  async update(id: string, input: UpdateFolderInput): Promise<Folder> {
    const row = await adapter.update(id, {
      ...input,
      parent_id: input.parentId ?? null,
    } as any)
    return mapToFolder(row as any)
  }

  async delete(id: string): Promise<void> {
    await adapter.delete(id)
  }
}