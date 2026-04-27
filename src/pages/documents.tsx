import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Plus, Clock, ArrowRight } from "lucide-react"
import { useDocuments } from "../hooks/use-documents"
import type { CreateDocumentInput } from "../domain/models/document"
import { PageHeader, EmptyState, LoadingState, CreateForm, PageContainer } from "../components/ui/page"

export function DocumentsPage() {
  const { documents, loading, create } = useDocuments()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  function formatDate(iso: string) {
    return new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso))
  }

  const description = documents.length === 0
    ? "Todavía no tenés documentos"
    : `${documents.length} documento${documents.length !== 1 ? "s" : ""}`

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description={description}
        buttonLabel="Nuevo documento"
        onButtonClick={() => setShowForm(true)}
        buttonId="create-document-btn"
      />

      {showForm && (
        <CreateForm
          title="Nuevo documento"
          onSubmit={handleCreate}
          submitLabel="Crear"
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
              placeholder="Título del documento…"
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
          title="Sin documentos todavía"
          description="Creá tu primer documento para empezar a estudiar"
          buttonLabel="Crear documento"
          onButtonClick={() => setShowForm(true)}
        />
      ) : (
        <div className="grid gap-3">
          {documents.map((doc, i) => (
            <button
              key={doc.id}
              id={`document-item-${doc.id}`}
              onClick={() => navigate(`/dashboard/documents/${doc.id}`)}
              className="card-miro p-4 flex items-center gap-4 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#5b76fe]" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[#1c1c1e] font-medium text-[15px] truncate"
                  style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}
                >
                  {doc.title}
                </p>
                <p className="text-[#555a6a] text-xs flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDate(doc.updatedAt)}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#a5a8b5] group-hover:text-[#5b76fe] transition-colors" />
            </button>
          ))}
        </div>
      )}
    </PageContainer>
  )
}