export interface Deck {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export type CreateDeckInput = Pick<Deck, "name" | "description">
export type UpdateDeckInput = Partial<Pick<Deck, "name" | "description">>