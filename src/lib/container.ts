/**
 * container.ts — Composición de dependencias.
 * Acá es donde "conectás" repositorio → servicio.
 * Actualmente usa Supabase. Cambiá las import para usar localStorage si hay problemas.
 */
import { DocumentSupabaseRepository } from "../infrastructure/supabase/document-supabase-repository"
import { CardSupabaseRepository } from "../infrastructure/supabase/card-supabase-repository"
import { DeckSupabaseRepository } from "../infrastructure/supabase/deck-supabase-repository"
import { DocumentService } from "../services/document-service"
import { CardService } from "../services/card-service"
import { DeckService } from "../services/deck-service"

const documentRepo = new DocumentSupabaseRepository()
const cardRepo = new CardSupabaseRepository()
const deckRepo = new DeckSupabaseRepository()

export const documentService = new DocumentService(documentRepo)
export const cardService = new CardService(cardRepo)
export const deckService = new DeckService(deckRepo, cardRepo)