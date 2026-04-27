/**
 * container.ts — Composición de dependencias.
 * Acá es donde "conectás" repositorio → servicio.
 * Para pasar a una API real: reemplazá las implementaciones sin tocar nada más.
 */
import { DocumentLocalStorageRepository } from "../infrastructure/local-storage/document-local-storage-repository"
import { CardLocalStorageRepository } from "../infrastructure/local-storage/card-local-storage-repository"
import { DeckLocalStorageRepository } from "../infrastructure/local-storage/deck-local-storage-repository"
import { DocumentService } from "../services/document-service"
import { CardService } from "../services/card-service"
import { DeckService } from "../services/deck-service"

const documentRepo = new DocumentLocalStorageRepository()
const cardRepo = new CardLocalStorageRepository()
const deckRepo = new DeckLocalStorageRepository()

export const documentService = new DocumentService(documentRepo)
export const cardService = new CardService(cardRepo)
export const deckService = new DeckService(deckRepo, cardRepo)