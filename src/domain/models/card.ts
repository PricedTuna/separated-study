export type CardResult = "again" | "hard" | "good" | "easy" | "unseen"

export interface Card {
  id: string
  deckId: string
  documentId: string | null // optional link to a document
  front: string
  back: string
  lastResult: CardResult
  createdAt: string
  updatedAt: string
}

export type CreateCardInput = Pick<Card, "front" | "back" | "deckId" | "documentId">
export type UpdateCardInput = Partial<Pick<Card, "front" | "back" | "lastResult" | "documentId">>