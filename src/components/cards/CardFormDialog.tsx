import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Plus, Save } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Dialog } from "@/components/ui/Dialog"
import { Select } from "@/components/ui/Select"
import type { Deck } from "@/domain/models/deck"
import type { Document } from "@/domain/models/document"

gsap.registerPlugin(useGSAP)

export type CardFormValues = {
  front: string
  back: string
  deckId: string
  documentId: string
}

export interface CardFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExited?: () => void
  mode: "create" | "edit"
  decks: Deck[]
  documents: Document[]
  initialValues: CardFormValues
  loading?: boolean
  error?: string | null
  title?: string
  description?: string
  submitLabel?: string
  onSubmit: (values: CardFormValues) => Promise<void> | void
}

const EMPTY_OPTION = { value: "", label: "Sin documento" }

export const CardFormDialog = ({
  open,
  onOpenChange,
  onExited,
  mode,
  decks,
  documents,
  initialValues,
  loading = false,
  error,
  title,
  description,
  submitLabel,
  onSubmit,
}: CardFormDialogProps) => {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [values, setValues] = useState<CardFormValues>(initialValues)

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setValues(initialValues))
      return () => cancelAnimationFrame(id)
    }
  }, [initialValues, open])

  useGSAP(() => {
    if (!open || !formRef.current) return

    gsap.fromTo(
      ".card-dialog-field, .card-dialog-actions",
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
        stagger: 0.07,
      },
    )
  }, { scope: formRef, dependencies: [open], revertOnUpdate: true })

  const deckOptions = useMemo(() => decks.map((deck) => ({
    value: deck.id,
    label: deck.name,
    description: deck.description || undefined,
  })), [decks])

  const documentOptions = useMemo(() => [
    EMPTY_OPTION,
    ...documents.map((document) => ({
      value: document.id,
      label: document.title,
    })),
  ], [documents])

  const resolvedTitle = title ?? (mode === "edit" ? "Edit flashcard" : "New flashcard")
  const resolvedDescription = description ?? "Complete the fields and save your flashcard."
  const resolvedSubmitLabel = submitLabel ?? (mode === "edit" ? "Save changes" : "Add Card")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await onSubmit(values)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onExited={onExited}
      title={resolvedTitle}
      description={resolvedDescription}
      size="lg"
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div className="card-dialog-field space-y-1.5">
          <label htmlFor="card-deck-select" className="text-xs font-medium text-[#555a6a]">
            Deck
          </label>
          <Select
            id="card-deck-select"
            value={values.deckId}
            onChange={(deckId) => setValues((current) => ({ ...current, deckId }))}
            disabled={decks.length === 0}
            placeholder="Selecciona un deck"
            emptyMessage="No hay decks disponibles"
            options={deckOptions}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card-dialog-field space-y-1.5">
            <label htmlFor="card-front-input" className="text-xs font-medium text-[#555a6a]">Front</label>
            <textarea
              id="card-front-input"
              autoFocus
              value={values.front}
              onChange={(event) => setValues((current) => ({ ...current, front: event.target.value }))}
              placeholder="Question or concept..."
              rows={5}
              className="input-miro w-full text-sm resize-none"
            />
          </div>
          <div className="card-dialog-field space-y-1.5">
            <label htmlFor="card-back-input" className="text-xs font-medium text-[#555a6a]">Back</label>
            <textarea
              id="card-back-input"
              value={values.back}
              onChange={(event) => setValues((current) => ({ ...current, back: event.target.value }))}
              placeholder="Answer or explanation..."
              rows={5}
              className="input-miro w-full text-sm resize-none"
            />
          </div>
        </div>

        <div className="card-dialog-field space-y-1.5">
          <label htmlFor="card-document-select" className="text-xs font-medium text-[#555a6a]">
            Documento relacionado <span className="text-[#a5a8b5] font-normal">(opcional)</span>
          </label>
          <Select
            id="card-document-select"
            value={values.documentId}
            onChange={(documentId) => setValues((current) => ({ ...current, documentId }))}
            placeholder="Selecciona un documento"
            emptyMessage="No hay documentos disponibles"
            options={documentOptions}
          />
        </div>

        {error && <p className="card-dialog-field text-xs text-red-500">{error}</p>}
        {decks.length === 0 && (
          <p className="card-dialog-field text-xs text-[#555a6a]">Primero crea un deck para poder guardar la tarjeta.</p>
        )}

        <div className="card-dialog-actions flex justify-end gap-2">
          <button type="button" onClick={() => onOpenChange(false)} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !values.deckId || !values.front.trim() || !values.back.trim()}
            className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "edit" ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {resolvedSubmitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
