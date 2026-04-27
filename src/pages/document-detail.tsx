import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { MilkdownEditor } from "../components/milkdown-editor"
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

  useEffect(() => { load() }, [load])

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
    } catch (e) {
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
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex items-start gap-3 px-6 py-4">
        <button
          onClick={() => navigate("/dashboard/documents")}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <input
          id="document-title-edit"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-lg font-medium bg-transparent border-b border-transparent focus:border-[#5b76fe] focus:outline-none pb-2 transition-colors"
          placeholder="Title..."
        />
        <button
          id="save-document-btn"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-60"
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