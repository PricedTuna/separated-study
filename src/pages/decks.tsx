import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Folder } from "lucide-react"
import { useDecks } from "../hooks/use-decks"
import { useDataRefresh } from "../hooks/use-data-refresh"
import { deckService } from "../lib/container"
import { PageHeader, EmptyState, LoadingState, CreateForm, PageContainer } from "../components/ui/page"
import { ListItem } from "../components/ui/list-item"
import type { CreateDeckInput } from "../domain/models/deck"

export function DecksPage() {
  const { decks, loading, create, remove, reload } = useDecks()
  const navigate = useNavigate()
  const { refreshKey } = useDataRefresh()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })
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
      const input: CreateDeckInput = { name: form.name, description: form.description }
      const deck = await create(input)
      setForm({ name: "", description: "" })
      setShowForm(false)
      navigate(`/dashboard/decks/${deck.id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  function handleCancel() {
    setShowForm(false)
    setForm({ name: "", description: "" })
    setError(null)
  }

  function handleDelete(id: string) {
    const deck = decks.find(d => d.id === id)
    if (deck && confirm(`Delete "${deck.name}"? All cards in this deck will also be deleted.`)) {
      deckService.delete(id).then(() => reload())
    }
  }

  const description = decks.length === 0
    ? "No decks yet"
    : `${decks.length} deck${decks.length !== 1 ? "s" : ""}`

  return (
    <PageContainer>
      <PageHeader
        title="Decks"
        description={description}
        buttonLabel="New deck"
        onButtonClick={() => setShowForm(true)}
        buttonId="create-deck-btn"
      />

      {showForm && (
        <CreateForm
          title="New deck"
          onSubmit={handleCreate}
          submitLabel="Create deck"
          onCancel={handleCancel}
          submitDisabled={!form.name.trim()}
          loading={creating}
          error={error}
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555a6a]">Name</label>
              <input
                autoFocus
                type="text"
                placeholder="Deck name..."
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="input-miro w-full text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#555a6a]">Description <span className="text-[#a5a8b5] font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="Deck description..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="input-miro w-full text-sm"
              />
            </div>
          </div>
        </CreateForm>
      )}

      {loading ? (
        <LoadingState />
      ) : decks.length === 0 ? (
        <EmptyState
          icon={<Folder className="w-8 h-8" />}
          iconBgColor="bg-[#eef0ff]"
          iconColor="text-[#5b76fe]"
          title="No decks yet"
          description="Create your first deck to organize your flashcards"
          buttonLabel="Create deck"
          onButtonClick={() => setShowForm(true)}
        />
      ) : (
        <div className="grid gap-3">
          {decks.map((deck, i) => (
            <ListItem
              key={deck.id}
              icon={<Folder className="w-5 h-5" />}
              iconBgColor="bg-[#ffd8f4]"
              iconColor="text-[#c050a0]"
              title={deck.name}
              subtitle={deck.description}
              onClick={() => navigate(`/dashboard/decks/${deck.id}`)}
              onDelete={() => handleDelete(deck.id)}
              animationDelay={i * 50}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}