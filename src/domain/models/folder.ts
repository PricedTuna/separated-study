export interface Folder {
  id: string
  name: string
  parentId: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export type CreateFolderInput = Pick<Folder, "name" | "parentId">
export type UpdateFolderInput = Partial<Pick<Folder, "name" | "parentId">>