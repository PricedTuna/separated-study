export type CardResult = "remembered" | "forgot" | "unseen"

export interface Card {
  id: string
  documentId: string | null // optional link to a document
  front: string
  back: string
  lastResult: CardResult
  createdAt: string
  updatedAt: string
}

export type CreateCardInput = Pick<Card, "front" | "back" | "documentId">
export type UpdateCardInput = Partial<Pick<Card, "front" | "back" | "lastResult" | "documentId">>
