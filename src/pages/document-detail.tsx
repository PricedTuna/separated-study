import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Save, Loader2 } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { MilkdownEditor } from "../components/milkdown-editor"
import { BackButton } from "../components/ui/back-button"
import { CardFormDialog, type CardFormValues } from "../components/cards/card-form-dialog"
import { cardService, deckService, documentService } from "../lib/container"
import type { Document } from "../domain/models/document"
import type { Deck } from "../domain/models/deck"

gsap.registerPlugin(useGSAP)

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement | null>(null)
  const [doc, setDoc] = useState<Document | null>(null)
  const [content, setContent] = useState("")
  const contentRef = useRef('')
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [showCardDialog, setShowCardDialog] = useState(false)
  const [cardInitialValues, setCardInitialValues] = useState<CardFormValues>({ front: "", back: "", deckId: "", documentId: "" })
  const [cardError, setCardError] = useState<string | null>(null)
  const [creatingCard, setCreatingCard] = useState(false)

  const handleEditorChange = useCallback((markdown: string) => {
    contentRef.current = markdown
  }, [])

  const load = useCallback(async () => {
    if (!id) return
    const [found, decksData] = await Promise.all([
      documentService.getById(id),
      deckService.getAll(),
    ])
    if (!found) { navigate("/dashboard/documents"); return }
    setDoc(found)
    setTitle(found.title)
    setContent(found.content)
    setDecks(decksData)
    setLoading(false)
  }, [id, navigate])

  useEffect(() => {
    load()
  }, [load])

  useGSAP(() => {
    gsap.fromTo(
      ".document-header, .document-error, .document-editor",
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.08,
      },
    )
  }, { scope: pageRef, dependencies: [loading], revertOnUpdate: true })

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

  const openCardDialog = useCallback((selectedText: string) => {
    setCardError(null)
    setCardInitialValues({
      front: selectedText.trim(),
      back: "",
      deckId: decks[0]?.id || "",
      documentId: doc?.id || "",
    })
    setShowCardDialog(true)
  }, [decks, doc?.id])

  const closeCardDialog = useCallback(() => {
    setShowCardDialog(false)
    setCardError(null)
    setCreatingCard(false)
  }, [])

  const handleCreateCard = useCallback(async (values: CardFormValues) => {
    if (!doc) return
    setCreatingCard(true)
    setCardError(null)
    try {
      await cardService.create({
        front: values.front,
        back: values.back,
        deckId: values.deckId,
        documentId: values.documentId || doc.id,
      })
      closeCardDialog()
      setCardInitialValues({ front: "", back: "", deckId: decks[0]?.id || "", documentId: doc.id })
    } catch (err) {
      setCardError((err as Error).message)
    } finally {
      setCreatingCard(false)
    }
  }, [closeCardDialog, decks, doc])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#5b76fe]" />
      </div>
    )
  }

  return (
    <>
      <div ref={pageRef} className="mx-auto w-full max-w-5xl">
        <div className="document-header flex flex-row flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <BackButton
              onClick={() => navigate("/dashboard/documents")}
              aria-label="Go back to documents"
            />
            <input
              id="document-title-edit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-0 flex-1 border-b border-transparent bg-transparent pb-1 text-lg font-medium transition-colors focus:outline-none"
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
          <div className="document-error px-6 pb-2 text-sm text-red-600">{error}</div>
        )}

        <div className="document-editor">
          <MilkdownEditor
            defaultValue={content}
            onChange={handleEditorChange}
            onAddCard={openCardDialog}
          />
        </div>
      </div>

      <CardFormDialog
        open={showCardDialog}
        onOpenChange={setShowCardDialog}
        mode="create"
        decks={decks}
        documents={doc ? [doc] : []}
        initialValues={cardInitialValues}
        loading={creatingCard}
        error={cardError}
        title="Nueva tarjeta"
        description="Crea una tarjeta a partir del texto seleccionado. Los campos se autorrellenan según el documento actual."
        submitLabel="Agregar tarjeta"
        onSubmit={handleCreateCard}
      />
    </>
  )
}
