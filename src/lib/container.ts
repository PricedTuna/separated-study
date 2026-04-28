/**
 * container.ts — Composición de dependencias.
 * Acá es donde "conectás" repositorio → servicio.
 * Actualmente usa Supabase. Cambiá las import para usar localStorage si hay problemas.
 */
import { DocumentSupabaseRepository } from "../infrastructure/supabase/document-supabase-repository"
import { CardSupabaseRepository } from "../infrastructure/supabase/card-supabase-repository"
import { DeckSupabaseRepository } from "../infrastructure/supabase/deck-supabase-repository"
import { CardReviewSupabaseRepository } from "../infrastructure/supabase/card-review-supabase-repository"
import { FolderSupabaseRepository } from "../infrastructure/supabase/folder-supabase-repository"
import { DocumentService } from "../services/document-service"
import { CardService } from "../services/card-service"
import { DeckService } from "../services/deck-service"
import { CardReviewService } from "../services/card-review-service"
import { FolderService } from "../services/folder-service"

const documentRepo = new DocumentSupabaseRepository()
const cardRepo = new CardSupabaseRepository()
const deckRepo = new DeckSupabaseRepository()
const cardReviewRepo = new CardReviewSupabaseRepository()
const folderRepo = new FolderSupabaseRepository()

export const documentService = new DocumentService(documentRepo)
export const cardService = new CardService(cardRepo, cardReviewRepo)
export const deckService = new DeckService(deckRepo, cardRepo)
export const cardReviewService = new CardReviewService(cardReviewRepo)
export const folderService = new FolderService(folderRepo)