import { useRef, useState } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { Download, Upload, FileJson, Loader2 } from "lucide-react"
import { Sidebar } from "../ui/sidebar"
import { useDataRefresh } from "../../hooks/use-data-refresh"
import { exportAllData, importData, downloadAsFile, parseImportFile, validateImportData } from "../../services/import-export-service"

const sidebarItems = [
  {
    id: "documents",
    label: "Documents",
    path: "/dashboard/documents",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "decks",
    label: "Decks",
    path: "/dashboard/decks",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
]

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = { name: "User" }
  
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { triggerRefresh } = useDataRefresh()

  const activeItem =
    sidebarItems.find((item) => location.pathname.startsWith(item.path))?.id ?? "documents"

  const activeLabel = sidebarItems.find((i) => i.id === activeItem)?.label ?? ""

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportAllData()
      const timestamp = new Date().toISOString().split("T")[0]
      downloadAsFile(data, `spaced-study-${timestamp}.spaced.json`)
    } catch (e) {
      console.error("Export failed:", e)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const content = await file.text()
      const { data, error: parseError } = parseImportFile(content)
      
      if (parseError) {
        setImportResult({ success: false, message: parseError })
        setIsImporting(false)
        return
      }

      const validationErrors = validateImportData(data)
      if (validationErrors.length > 0) {
        setImportResult({ success: false, message: validationErrors.join(", ") })
        setIsImporting(false)
        return
      }

      const result = await importData(data)
      
      if (result.errors.length > 0) {
        setImportResult({ 
          success: true, 
          message: `Imported ${result.documentsImported} documents, ${result.decksImported} decks, ${result.cardsImported} cards. Some errors occurred: ${result.errors.join(", ")}` 
        })
        triggerRefresh()
      } else {
        setImportResult({ 
          success: true, 
          message: `Successfully imported ${result.documentsImported} documents, ${result.decksImported} decks, and ${result.cardsImported} cards!` 
        })
        triggerRefresh()
      }
    } catch (e) {
      setImportResult({ success: false, message: `Import failed: ${(e as Error).message}` })
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={(id) => {
          const item = sidebarItems.find((i) => i.id === id)
          if (item) navigate(item.path)
        }}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-12 border-b border-[#e9eaef] bg-white flex items-center justify-between px-4">
          <div className="text-sm text-[#555a6a]">{activeLabel}</div>
          <div className="flex items-center gap-2">
            {/* Export button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f0f1f5] rounded-lg transition-colors disabled:opacity-50"
              title="Export all data"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export
            </button>
            
            {/* Import button */}
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f0f1f5] rounded-lg transition-colors disabled:opacity-50"
              title="Import data"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Import
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.spaced.json"
              onChange={handleImportFile}
              className="hidden"
            />

            {/* User avatar */}
            <button className="w-8 h-8 rounded-full bg-[#5b76fe] flex items-center justify-center text-white text-sm font-medium">
              {user.name[0]}
            </button>
          </div>
        </header>

        {/* Import result toast */}
        {importResult && (
          <div 
            className={`mx-4 mt-2 px-4 py-3 rounded-lg text-sm ${
              importResult.success 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
            onClick={() => setImportResult(null)}
          >
            <div className="flex items-center gap-2">
              {importResult.success ? (
                <FileJson className="w-4 h-4" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{importResult.message}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 bg-white">
          <Outlet />
        </div>
      </main>
    </div>
  )
}