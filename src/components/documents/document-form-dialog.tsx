import { useState, type FC, type FormEvent } from "react"
import { Loader2, Plus } from "lucide-react"
import { Dialog } from "../ui/dialog"
import type { CreateDocumentInput } from "../../domain/models/document"
import type { Document } from "../../domain/models/document"

interface DocumentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateDocumentInput) => Promise<Document>
  onSuccess?: (doc: Document) => void
  onCancel: () => void
  folderId?: string
}

export const DocumentFormDialog: FC<DocumentFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  onSuccess,
  onCancel,
  folderId,
}) => {
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const input: CreateDocumentInput = {
        title,
        content: `# ${title}\n\n`,
        folderId: folderId || null,
      }
      const doc = await onSubmit(input)
      setTitle("")
      onOpenChange(false)
      onSuccess?.(doc)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    setTitle("")
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
      onExited={() => { setTitle(""); setError(null) }}
      title="New document"
      description="Create a document to organize notes and study material."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="document-title-input" className="text-xs font-medium text-[#555a6a]">
            Title
          </label>
          <input
            id="document-title-input"
            autoFocus
            type="text"
            placeholder="Document title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            disabled={!title.trim() || creating}
            className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create
          </button>
        </div>
      </form>
    </Dialog>
  )
}