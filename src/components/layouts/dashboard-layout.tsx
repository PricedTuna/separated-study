import { useRef, useState, useMemo } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { Download, Upload, FileJson, Loader2, Folder } from "lucide-react"
import { Sidebar, type SidebarSection } from "../ui/sidebar"
import { Breadcrumb, type BreadcrumbItem } from "../ui/breadcrumb"
import { useDataRefresh } from "../../hooks/use-data-refresh"
import { useFolders } from "../../hooks/use-folders"
import { exportAllData, importData, downloadAsFile, parseImportFile, validateImportData } from "../../services/import-export-service"

const mainNavItems = [
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
  const { folders, reload: reloadFolders } = useFolders()

  // Only root folders (no parent)
  const rootFolders = useMemo(() => {
    return folders.filter(f => f.parentId === null)
  }, [folders])

  // Determine active section based on path
  const activeSection = useMemo(() => {
    const path = location.pathname
    if (path.startsWith("/dashboard/folders/")) {
      return "documents"
    }
    if (path.startsWith("/dashboard/decks")) {
      return "decks"
    }
    return "documents"
  }, [location.pathname])

  const activeLabel = mainNavItems.find((i) => i.id === activeSection)?.label ?? "Documents"

  // Extract folder ID from URL if in a folder
  const folderIdFromUrl = useMemo(() => {
    const path = location.pathname
    const match = path.match(/^\/dashboard\/folders\/([^/]+)/)
    return match ? match[1] : null
  }, [location.pathname])

  // Build breadcrumb path for current folder (including all ancestors)
  // Protected against infinite loops from circular parent references
  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    if (!folderIdFromUrl) return []

    const path: BreadcrumbItem[] = []
    const visited = new Set<string>()
    let currentId: string | null = folderIdFromUrl
    const maxDepth = 20 // Prevent infinite loops

    for (let i = 0; i < maxDepth && currentId; i++) {
      if (visited.has(currentId)) break // Cycle detected
      visited.add(currentId)

      const folder = folders.find(f => f.id === currentId)
      if (!folder) break

      path.unshift({ id: folder.id, name: folder.name })
      currentId = folder.parentId
    }

    return path
  }, [folderIdFromUrl, folders])

  // Build sidebar sections
  const sidebarSections = useMemo((): SidebarSection[] => {
    const sections: SidebarSection[] = []

    // Workspace section
    sections.push({
      title: "Workspace",
      items: mainNavItems.map((item) => ({
        ...item,
        active: activeSection === item.id,
      })),
    })

    // Documents section with folders
    if (activeSection === "documents" || rootFolders.length > 0) {
      const folderItems = rootFolders.map((folder) => ({
        id: `folder-${folder.id}`,
        label: folder.name,
        path: `/dashboard/folders/${folder.id}`,
        icon: <Folder className="w-4 h-4" />,
      }))

      sections.push({
        title: "Folders",
        items: folderItems,
      })
    }

    return sections
  }, [activeSection, rootFolders])

  const handleSidebarItemClick = (id: string) => {
    // Check main nav items first
    const mainItem = mainNavItems.find((item) => item.id === id)
    if (mainItem) {
      navigate(mainItem.path)
      return
    }

    // Check folders
    if (id.startsWith("folder-")) {
      const folderId = id.replace("folder-", "")
      navigate(`/dashboard/folders/${folderId}`)
      return
    }
  }

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
          message: `Imported ${result.documentsImported} documents, ${result.decksImported} decks, ${result.cardsImported} cards. Some errors occurred: ${result.errors.join(", ")}`,
        })
        triggerRefresh()
        reloadFolders()
      } else {
        setImportResult({
          success: true,
          message: `Successfully imported ${result.documentsImported} documents, ${result.decksImported} decks, and ${result.cardsImported} cards!`,
        })
        triggerRefresh()
        reloadFolders()
      }
    } catch (e) {
      setImportResult({ success: false, message: `Import failed: ${(e as Error).message}` })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Determine active item for sidebar
  const activeItem = useMemo(() => {
    const path = location.pathname
    if (path === "/dashboard/documents" || path.startsWith("/dashboard/documents/")) {
      return "documents"
    }
    if (path.startsWith("/dashboard/folders/")) {
      const folderId = path.split("/")[3]
      return `folder-${folderId}`
    }
    if (path.startsWith("/dashboard/decks")) {
      return "decks"
    }
    return "documents"
  }, [location.pathname])

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar
        sections={sidebarSections}
        activeItem={activeItem}
        onItemClick={handleSidebarItemClick}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-12 border-b border-[#e9eaef] bg-white flex items-center justify-between px-4">
          {breadcrumbItems.length > 0 ? (
            <Breadcrumb items={breadcrumbItems} className="!mb-0" />
          ) : (
            <div className="text-sm text-[#555a6a]">{activeLabel}</div>
          )}
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