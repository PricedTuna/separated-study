import { useState, type FC, type FormEvent } from "react"
import { Loader2, Plus } from "lucide-react"
import { Dialog } from "@/components/ui/Dialog"
import type { CreateFolderInput } from "@/domain/models/folder"
import type { Folder } from "@/domain/models/folder"

export interface FolderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateFolderInput) => Promise<Folder>
  onSuccess?: (folder: Folder) => void
  onCancel: () => void
  parentId?: string
}

export const FolderFormDialog: FC<FolderFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  onSuccess,
  onCancel,
  parentId,
}) => {
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const input: CreateFolderInput = {
        name,
        parentId: parentId || null,
      }
      const folder = await onSubmit(input)
      setName("")
      onOpenChange(false)
      onSuccess?.(folder)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    setName("")
    setError(null)
    onCancel()
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) handleCancel()
    else onOpenChange(true)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      onExited={() => { setName(""); setError(null) }}
      title="New folder"
      description="Create a folder to organize your documents."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="folder-name-input" className="text-xs font-medium text-[#555a6a]">
            Name
          </label>
          <input
            id="folder-name-input"
            autoFocus
            type="text"
            placeholder="Folder name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-miro w-full text-sm"
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={handleCancel} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || creating}
            className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create folder
          </button>
        </div>
      </form>
    </Dialog>
  )
}
