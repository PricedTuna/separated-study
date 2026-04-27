import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

interface Deck {
  id: string
  name: string
  cards: number
  lastStudied: string
}

const mockDecks: Deck[] = [
  { id: "1", name: "Spanish Vocabulary", cards: 150, lastStudied: "2 days ago" },
  { id: "2", name: "Biology - Cell Structure", cards: 45, lastStudied: "1 week ago" },
  { id: "3", name: "History Dates", cards: 89, lastStudied: "Never" },
]

export function DashboardPage() {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Decks</h2>
          <p className="text-muted-foreground">Manage and study your flashcard decks</p>
        </div>
        <Button onClick={() => setSelectedDeck(null)}>Create New Deck</Button>
      </div>

      {selectedDeck ? (
        <Card className="animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedDeck.name}</CardTitle>
              <CardDescription>{selectedDeck.cards} cards</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedDeck(null)}>
              Back to Decks
            </Button>
          </CardHeader>
          <CardContent>
            <h1>wawazo</h1>
            {/*<MilkdownEditor/>*/}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockDecks.map((deck, index) => (
            <Card
              key={deck.id}
              className="cursor-pointer hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedDeck(deck)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{deck.name}</CardTitle>
                <CardDescription>{deck.cards} cards</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last studied: {deck.lastStudied}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}