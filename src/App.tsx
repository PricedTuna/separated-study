import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage } from "./pages/login"
import { SignupPage } from "./pages/signup"
import { DashboardLayout } from "./components/layouts/dashboard-layout"
import { DashboardPage } from "./pages/dashboard"
import { DocumentsPage } from "./pages/documents"
import { DocumentDetailPage } from "./pages/document-detail"
import { CardsPage } from "./pages/cards"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/documents" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="documents" replace />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/:id" element={<DocumentDetailPage />} />
          <Route path="cards" element={<CardsPage />} />
          <Route path="overview" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App