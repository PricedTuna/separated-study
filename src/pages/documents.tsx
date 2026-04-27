import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Clock } from "lucide-react"
import { useDocuments } from "../hooks/use-documents"
import { useDataRefresh } from "../hooks/use-data-refresh"
import { documentService } from "../lib/container"
import type { CreateDocumentInput } from "../domain/models/document"
import { PageHeader, EmptyState, LoadingState, CreateForm, PageContainer } from "../components/ui/page"
import { ListItem } from "../components/ui/list-item"

export function DocumentsPage() {
  const { documents, loading, create, reload, remove } = useDocuments()
  const navigate = useNavigate()
  const { refreshKey } = useDataRefresh()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reload data when refresh is triggered (e.g., after import)
  useEffect(() => {
    reload()
  }, [refreshKey])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const input: CreateDocumentInput = { title, content: `# ${title}\n\n` }
      const doc = await create(input)
      setTitle("")
      setShowForm(false)
      navigate(`/dashboard/documents/${doc.id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  function handleDelete(id: string) {
    if (confirm(`Delete "${documents.find(d => d.id === id)?.title}"?`)) {
      documentService.delete(id).then(() => reload())
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const description = documents.length === 0
    ? "No documents yet"
    : `${documents.length} document${documents.length !== 1 ? "s" : ""}`

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description={description}
        buttonLabel="New document"
        onButtonClick={() => setShowForm(true)}
        buttonId="create-document-btn"
      />

      {showForm && (
        <CreateForm
          title="New document"
          onSubmit={handleCreate}
          submitLabel="Create"
          onCancel={() => { setShowForm(false); setTitle(""); setError(null) }}
          submitDisabled={!title.trim()}
          loading={creating}
          error={error}
        >
          <div className="flex gap-2">
            <input
              id="document-title-input"
              autoFocus
              type="text"
              placeholder="Document title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-miro flex-1 text-sm"
            />
          </div>
        </CreateForm>
      )}

      {loading ? (
        <LoadingState />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          iconBgColor="bg-[#eef0ff]"
          iconColor="text-[#5b76fe]"
          title="No documents yet"
          description="Create your first document to start studying"
          buttonLabel="Create document"
          onButtonClick={() => setShowForm(true)}
        />
      ) : (
        <div className="grid gap-3">
          {documents.map((doc, i) => (
            <ListItem
              key={doc.id}
              id={`document-item-${doc.id}`}
              icon={<FileText className="w-5 h-5" />}
              iconBgColor="bg-[#eef0ff]"
              iconColor="text-[#5b76fe]"
              title={doc.title}
              subtitle={
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(doc.updatedAt)}
                </span>
              }
              onClick={() => navigate(`/dashboard/documents/${doc.id}`)}
              onDelete={() => handleDelete(doc.id)}
              animationDelay={i * 50}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}