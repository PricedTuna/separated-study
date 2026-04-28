import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { LoginPage } from "./pages/login"
import { SignupPage } from "./pages/signup"
import { DashboardLayout } from "./components/layouts/dashboard-layout"
import { DashboardPage } from "./pages/dashboard"
import { DocumentsPage } from "./pages/documents"
import { DocumentDetailPage } from "./pages/document-detail"
import { DecksPage } from "./pages/decks"
import { DeckDetailPage } from "./pages/deck-detail"
import { DataRefreshProvider } from "./hooks/use-data-refresh"
import { supabase } from "./lib/supabase-client"
import { Loader2 } from "lucide-react"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthenticated(!!data.user)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#5b76fe]" />
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <DataRefreshProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/documents" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="documents" replace />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="documents/:id" element={<DocumentDetailPage />} />
            <Route path="folders/:folderId" element={<DocumentsPage />} />
            <Route path="folders/:folderId/:id" element={<DocumentDetailPage />} />
            <Route path="decks" element={<DecksPage />} />
            <Route path="decks/:id" element={<DeckDetailPage />} />
            <Route path="overview" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataRefreshProvider>
  )
}

export default App