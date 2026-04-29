import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Save, Loader2 } from "lucide-react"
import { MilkdownEditor } from "../components/milkdown-editor"
import { BackButton } from "../components/ui/back-button"
import { documentService } from "../lib/container"
import type { Document } from "../domain/models/document"

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<Document | null>(null)
  const [content, setContent] = useState("")
  const contentRef = useRef('')
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    const found = await documentService.getById(id)
    if (!found) { navigate("/dashboard/documents"); return }
    setDoc(found)
    setTitle(found.title)
    setContent(found.content)
    setLoading(false)
  }, [id, navigate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const handleSave = useCallback(async () => {
    if (!doc) return
    setSaving(true)
    setError(null)
    try {
      const updated = await documentService.update(doc.id, { title: title.trim() || doc.title, content: contentRef.current })
      if (updated) {
        setDoc(updated)
        setTitle(updated.title)
        setContent(updated.content)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError("No se pudo guardar el documento. Intenta de nuevo.")
    } finally {
      setSaving(false)
    }
  }, [doc, title])

  // Keyboard shortcut: Ctrl/Cmd + S to save
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSaveCombo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's'
      if (isSaveCombo) {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#5b76fe]" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex flex-row flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <BackButton
            onClick={() => navigate("/dashboard/documents")}
            aria-label="Go back to documents"
          />
          <input
            id="document-title-edit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-w-0 flex-1 border-b border-transparent bg-transparent pb-1 text-lg font-medium transition-colors focus:border-[#5b76fe] focus:outline-none"
            placeholder="Title..."
          />
        </div>
        <button
          id="save-document-btn"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center justify-center gap-1.5 text-sm disabled:opacity-60 shrink-0"
        >
          {saving
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save"}
        </button>
      </div>

      {error && (
        <div className="px-6 pb-2 text-sm text-red-600">{error}</div>
      )}

      {/* Editor */}
      <div>
        <MilkdownEditor
          defaultValue={content}
          onChange={(markdown) => contentRef.current = markdown}
        />
      </div>
    </div>
  )
}
