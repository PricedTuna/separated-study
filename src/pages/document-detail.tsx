import { useState, useEffect, useCallback } from "react"
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
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

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

  async function handleSave() {
    if (!doc) return
    setSaving(true)
    try {
      await documentService.update(doc.id, { title: title.trim() || doc.title, content })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

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
      <div className="flex items-center gap-3 px-6 py-4">
        <button
          onClick={() => navigate("/dashboard/documents")}
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
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

      {/* Editor */}
      <div className="bg-white min-h-[calc(100vh-120px)] border-l border-[#e5e7eb] pl-6">
        <MilkdownEditor
          initialValue={content}
          onChange={setContent}
        />
      </div>
    </div>
  )
}