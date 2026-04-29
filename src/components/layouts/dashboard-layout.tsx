import { useRef, useState, useMemo } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { Download, Upload, FileJson, Loader2, Folder, FileText, Menu } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Sidebar, type SidebarSection, type SidebarItem } from "../ui/sidebar"

gsap.registerPlugin(useGSAP)

import { Breadcrumb, type BreadcrumbItem } from "../ui/breadcrumb"
import { useDataRefresh } from "../../hooks/use-data-refresh"
import { useFolders } from "../../hooks/use-folders"
import { useDocuments } from "../../hooks/use-documents"
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { triggerRefresh } = useDataRefresh()
  const { folders, reload: reloadFolders } = useFolders()
  const { documents } = useDocuments()

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
    const buildFolderTree = (parentId: string | null): SidebarItem[] => {
      const childFolders = folders
        .filter(f => f.parentId === parentId)
        .map(folder => ({
          id: `folder-${folder.id}`,
          label: folder.name,
          icon: <Folder className="w-4 h-4" />,
          children: buildFolderTree(folder.id),
        }))

      const childDocs = documents
        .filter(d => d.folderId === parentId)
        .map(doc => ({
          id: `doc-${doc.id}`,
          label: doc.title,
          icon: <FileText className="w-4 h-4" />,
        }))

      return [...childFolders, ...childDocs]
    }

    const sections: SidebarSection[] = [
      {
        title: "Workspace",
        items: mainNavItems.map((item) => ({
          ...item,
          active: activeSection === item.id,
        })),
      },
    ]

    const folderTree = buildFolderTree(null)
    if (folderTree.length > 0 || documents.some(d => d.folderId === null)) {
      sections.push({
        title: "Library",
        items: folderTree,
      })
    }

    return sections
  }, [folders, documents, activeSection])

  const handleSidebarItemClick = (id: string) => {
    // Check Documents/Decks links
    const mainItem = mainNavItems.find((item) => item.id === id)
    if (mainItem) {
      navigate(mainItem.path)
      setIsSidebarOpen(false)
      return
    }

    // Check folders
    if (id.startsWith("folder-")) {
      const folderId = id.replace("folder-", "")
      navigate(`/dashboard/folders/${folderId}`)
      setIsSidebarOpen(false)
      return
    }

    // Check documents
    if (id.startsWith("doc-")) {
      const docId = id.replace("doc-", "")
      navigate(`/dashboard/documents/${docId}`)
      setIsSidebarOpen(false)
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

  const activePath = [
    activeSection,
    ...breadcrumbItems.map(f => `folder-${f.id}`),
    ...(location.pathname.includes("/documents/") || location.pathname.match(/\/folders\/[^/]+\/[^/]+$/)
      ? [`doc-${location.pathname.split("/").pop()}`]
      : [])
  ].filter(id => id !== "doc-documents" && id !== "doc-decks")

  useGSAP(() => {
    const mm = gsap.matchMedia()
    
    mm.add("(max-width: 1023px)", () => {
      if (isSidebarOpen) {
        gsap.to(backdropRef.current, { autoAlpha: 1, duration: 0.3, ease: "power2.out" })
        gsap.to(sidebarRef.current, { x: 0, duration: 0.3, ease: "power3.out" })
      } else {
        gsap.to(backdropRef.current, { autoAlpha: 0, duration: 0.3, ease: "power2.in" })
        gsap.to(sidebarRef.current, { x: "-100%", duration: 0.3, ease: "power3.in" })
      }
    })

    mm.add("(min-width: 1024px)", () => {
      gsap.set(sidebarRef.current, { clearProps: "all" })
      gsap.set(backdropRef.current, { clearProps: "all" })
    })

    return () => mm.revert()
  }, { dependencies: [isSidebarOpen] })

  return (
    <div className="min-h-[100dvh] bg-[#fbfbfd] lg:flex">
      <button
        ref={backdropRef}
        type="button"
        aria-label="Close sidebar"
        className="fixed inset-0 z-30 bg-[#1c1c1e]/35 backdrop-blur-sm lg:hidden invisible opacity-0"
        onClick={() => setIsSidebarOpen(false)}
      />

      <div 
        ref={sidebarRef}
        className="fixed inset-y-0 left-0 z-40 w-72 -translate-x-full lg:sticky lg:top-0 lg:z-auto lg:h-[100dvh] lg:translate-x-0"
      >
        <Sidebar
          sections={sidebarSections}
          onItemClick={handleSidebarItemClick}
          activePath={activePath}
        />
      </div>

      {/* Main content */}
      <main className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-3 border-b border-[#e9eaef] bg-white/90 px-3 backdrop-blur sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#555a6a] transition-colors hover:bg-[#f0f1f5] hover:text-[#1c1c1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b76fe] lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            {breadcrumbItems.length > 0 ? (
              <div className="min-w-0 overflow-hidden">
                <Breadcrumb items={breadcrumbItems} className="!mb-0" />
              </div>
            ) : (
              <div className="truncate text-sm font-medium text-[#555a6a]">{activeLabel}</div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Export button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-[#555a6a] transition-colors hover:bg-[#f0f1f5] hover:text-[#1c1c1e] disabled:opacity-50 sm:px-3"
              title="Export all data"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Import button */}
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-[#555a6a] transition-colors hover:bg-[#f0f1f5] hover:text-[#1c1c1e] disabled:opacity-50 sm:px-3"
              title="Import data"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Import</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.spaced.json"
              onChange={handleImportFile}
              className="hidden"
            />

            {/* User avatar */}
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5b76fe] text-sm font-medium text-white shadow-sm shadow-[#5b76fe]/25">
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
        <div className="flex-1 bg-[#fbfbfd]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}