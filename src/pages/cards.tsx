import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, Plus, ArrowRight, Check, X, Eye } from "lucide-react"
import { useCards } from "../hooks/use-cards"
import { useDocuments } from "../hooks/use-documents"
import type { CreateCardInput } from "../domain/models/card"
import { PageHeader, EmptyState, LoadingState, CreateForm, PageContainer } from "../components/ui/page"

type FormState = { front: string; back: string; documentId: string }
const EMPTY: FormState = { front: "", back: "", documentId: "" }

export function CardsPage() {
  const { cards, loading, create, recordResult, remove } = useCards()
  const { documents } = useDocuments()
  const navigate = useNavigate()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const input: CreateCardInput = {
        front: form.front,
        back: form.back,
        documentId: form.documentId || null,
      }
      await create(input)
      setForm(EMPTY)
      setShowForm(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  function toggleFlip(id: string) {
    setFlipped((p) => ({ ...p, [id]: !p[id] }))
  }

  function handleCancel() {
    setShowForm(false)
    setForm(EMPTY)
    setError(null)
  }

  const resultColor: Record<string, string> = {
    remembered: "text-[#00b473]",
    forgot: "text-red-400",
    unseen: "text-[#a5a8b5]",
  }
  const resultLabel: Record<string, string> = {
    remembered: "Recordada",
    forgot: "Olvidada",
    unseen: "Sin revisar",
  }

  const description = cards.length === 0
    ? "Todavía no tenés cards"
    : `${cards.length} card${cards.length !== 1 ? "s" : ""}`

  return (
    <PageContainer>
      <PageHeader
        title="Cards"
        description={description}
        buttonLabel="Nueva card"
        onButtonClick={() => setShowForm(true)}
        buttonId="create-card-btn"
      />

      {showForm && (
        <CreateForm
          title="Nueva flashcard"
          onSubmit={handleCreate}
          submitLabel="Crear card"
          onCancel={handleCancel}
          submitDisabled={!form.front.trim() || !form.back.trim()}
          loading={creating}
          error={error}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555a6a]">Frente</label>
              <textarea
                id="card-front-input"
                autoFocus
                value={form.front}
                onChange={field("front")}
                placeholder="Pregunta o concepto…"
                rows={4}
                className="input-miro w-full text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555a6a]">Reverso</label>
              <textarea
                id="card-back-input"
                value={form.back}
                onChange={field("back")}
                placeholder="Respuesta o definición…"
                rows={4}
                className="input-miro w-full text-sm resize-none"
              />
            </div>
          </div>

          {documents.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555a6a]">
                Vincular a documento <span className="text-[#a5a8b5] font-normal">(opcional)</span>
              </label>
              <select
                id="card-document-select"
                value={form.documentId}
                onChange={field("documentId")}
                className="input-miro w-full text-sm appearance-none"
              >
                <option value="">— Ninguno —</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
          )}
        </CreateForm>
      )}

      {loading ? (
        <LoadingState />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8" />}
          iconBgColor="bg-[#ffd8f4]"
          iconColor="text-[#c050a0]"
          title="Sin cards todavía"
          description="Creá tu primer flashcard para empezar a repasar"
          buttonLabel="Crear card"
          onButtonClick={() => setShowForm(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card, i) => {
            const isFlipped = flipped[card.id] ?? false
            const linkedDoc = documents.find((d) => d.id === card.documentId)
            return (
              <div
                key={card.id}
                id={`card-item-${card.id}`}
                className="card-miro overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="p-5 min-h-[120px] cursor-pointer relative" onClick={() => toggleFlip(card.id)}>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className={`text-[10px] font-medium uppercase tracking-wide ${resultColor[card.lastResult]}`}>
                      {resultLabel[card.lastResult]}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-[#a5a8b5]" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#a5a8b5] mb-2">
                    {isFlipped ? "Reverso" : "Frente"}
                  </p>
                  <p className="text-[#1c1c1e] text-[15px] leading-snug pr-16">
                    {isFlipped ? card.back : card.front}
                  </p>
                </div>

                <div className="border-t border-[#e9eaef] px-4 py-2.5 flex items-center gap-2">
                  {isFlipped ? (
                    <>
                      <button
                        id={`card-remembered-${card.id}`}
                        onClick={() => recordResult(card.id, "remembered")}
                        className="flex items-center gap-1 text-xs text-[#00b473] hover:bg-[#e6f9f3] px-2 py-1 rounded-lg transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Recordé
                      </button>
                      <button
                        id={`card-forgot-${card.id}`}
                        onClick={() => recordResult(card.id, "forgot")}
                        className="flex items-center gap-1 text-xs text-red-400 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Olvidé
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleFlip(card.id)}
                      className="text-xs text-[#5b76fe] hover:bg-[#eef0ff] px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Ver respuesta
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {linkedDoc && (
                      <button
                        onClick={() => navigate(`/dashboard/documents/${linkedDoc.id}`)}
                        className="text-[10px] text-[#a5a8b5] hover:text-[#5b76fe] transition-colors truncate max-w-[120px]"
                      >
                        📄 {linkedDoc.title}
                      </button>
                    )}
                    <button
                      id={`card-delete-${card.id}`}
                      onClick={() => remove(card.id)}
                      className="text-[10px] text-[#a5a8b5] hover:text-red-400 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}