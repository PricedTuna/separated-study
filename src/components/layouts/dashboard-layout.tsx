import { useEffect, useRef, useState, useMemo, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { Download, Upload, FileJson, Loader2, Folder, FileText, Menu, Layers, ChevronDown, LogOut, Mail } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Sidebar, type SidebarSection, type SidebarItem } from "../ui/sidebar"

gsap.registerPlugin(useGSAP)

import { Breadcrumb, type BreadcrumbItem } from "../ui/breadcrumb"
import { Checkbox } from "../ui/checkbox"
import { Dialog } from "../ui/dialog"
import { useDataRefresh } from "../../hooks/use-data-refresh"
import { useFolders } from "../../hooks/use-folders"
import { useDocuments } from "../../hooks/use-documents"
import { useDecks } from "../../hooks/use-decks"
import { exportAllData, importData, downloadAsFile, parseImportFile, validateImportData } from "../../services/import-export-service"
import { supabase } from "../../lib/supabase-client"
import { clearAllCache } from "../../lib/cache"

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

  const [isExporting, setIsExporting] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set())
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set())
  const [selectedDeckIds, setSelectedDeckIds] = useState<Set<string>>(new Set())
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuPanelRef = useRef<HTMLDivElement>(null)
  const userMenuChevronRef = useRef<SVGSVGElement>(null)
  const exportDialogContentRef = useRef<HTMLDivElement>(null)
  const routeContentRef = useRef<HTMLDivElement>(null)
  const { triggerRefresh } = useDataRefresh()
  const { folders, reload: reloadFolders } = useFolders()
  const { documents, reload: reloadDocuments } = useDocuments()
  const { decks, reload: reloadDecks } = useDecks()
  const userEmail = user?.email ?? "User"
  const userInitial = userEmail.charAt(0).toUpperCase()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isUserMenuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    return () => window.removeEventListener("pointerdown", handlePointerDown)
  }, [isUserMenuOpen])

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

  const resetExportSelection = () => {
    setSelectedFolderIds(new Set(folders.map((folder) => folder.id)))
    setSelectedDocumentIds(new Set(documents.map((document) => document.id)))
    setSelectedDeckIds(new Set(decks.map((deck) => deck.id)))
  }

  const handleExportClick = () => {
    resetExportSelection()
    setIsExportDialogOpen(true)
  }

  const updateSet = (
    setter: Dispatch<SetStateAction<Set<string>>>,
    id: string,
    checked: boolean,
  ) => {
    setter((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const getDescendantFolderIds = (folderId: string): string[] => {
    const descendants: string[] = []
    const collect = (parentId: string) => {
      folders
        .filter((folder) => folder.parentId === parentId)
        .forEach((folder) => {
          descendants.push(folder.id)
          collect(folder.id)
        })
    }
    collect(folderId)
    return descendants
  }

  const getAncestorFolderIds = (folderId: string | null): string[] => {
    const ancestors: string[] = []
    let currentId = folderId

    while (currentId) {
      ancestors.push(currentId)
      currentId = folders.find((folder) => folder.id === currentId)?.parentId ?? null
    }

    return ancestors
  }

  const setFolderSelection = (folderId: string, checked: boolean) => {
    const folderIds = [folderId, ...getDescendantFolderIds(folderId)]
    const documentIds = documents
      .filter((document) => document.folderId && folderIds.includes(document.folderId))
      .map((document) => document.id)

    setSelectedFolderIds((current) => {
      const next = new Set(current)
      folderIds.forEach((id) => checked ? next.add(id) : next.delete(id))
      return next
    })
    setSelectedDocumentIds((current) => {
      const next = new Set(current)
      documentIds.forEach((id) => checked ? next.add(id) : next.delete(id))
      return next
    })
  }

  const setDocumentSelection = (documentId: string, folderId: string | null, checked: boolean) => {
    updateSet(setSelectedDocumentIds, documentId, checked)

    if (!checked && folderId) {
      const ancestorFolderIds = getAncestorFolderIds(folderId)
      setSelectedFolderIds((current) => {
        const next = new Set(current)
        ancestorFolderIds.forEach((id) => next.delete(id))
        return next
      })
    }
  }

  const selectedItemCount = selectedFolderIds.size + selectedDocumentIds.size + selectedDeckIds.size

  const handleExport = async () => {
    if (selectedItemCount === 0) return
    setIsExporting(true)
    try {
      const data = await exportAllData({
        folderIds: [...selectedFolderIds],
        documentIds: [...selectedDocumentIds],
        deckIds: [...selectedDeckIds],
      })
      const timestamp = new Date().toISOString().split("T")[0]
      downloadAsFile(data, `spaced-study-${timestamp}.spaced.json`)
      setIsExportDialogOpen(false)
    } catch (e) {
      console.error("Export failed:", e)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      clearAllCache()
      navigate("/login", { replace: true })
    } finally {
      setIsLoggingOut(false)
      setIsUserMenuOpen(false)
    }
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
          message: `Imported ${result.foldersImported} folders, ${result.documentsImported} documents, ${result.decksImported} decks, ${result.cardsImported} cards. Some errors occurred: ${result.errors.join(", ")}`,
        })
        triggerRefresh()
        reloadFolders()
        reloadDocuments()
        reloadDecks()
      } else {
        setImportResult({
          success: true,
          message: `Successfully imported ${result.foldersImported} folders, ${result.documentsImported} documents, ${result.decksImported} decks, and ${result.cardsImported} cards!`,
        })
        triggerRefresh()
        reloadFolders()
        reloadDocuments()
        reloadDecks()
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

  const renderExportFolderTree = (parentId: string | null, depth: number): ReactNode => {
    const childFolders = folders.filter((folder) => folder.parentId === parentId)

    return childFolders.map((folder) => {
      const childDocuments = documents.filter((document) => document.folderId === folder.id)

      return (
        <div key={folder.id} className="space-y-1">
          <label
            className="export-option flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-[#1c1c1e] hover:bg-white"
            style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
          >
            <Checkbox
              checked={selectedFolderIds.has(folder.id)}
              onCheckedChange={(checked) => setFolderSelection(folder.id, checked === true)}
            />
            <Folder className="h-4 w-4 text-[#8e92a3]" />
            <span className="truncate">{folder.name}</span>
          </label>

          {renderExportFolderTree(folder.id, depth + 1)}

          {childDocuments.map((document) => (
            <label
              key={document.id}
              className="export-option flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-[#1c1c1e] hover:bg-white"
              style={{ paddingLeft: `${1.75 + depth * 1}rem` }}
            >
              <Checkbox
                checked={selectedDocumentIds.has(document.id)}
                onCheckedChange={(checked) => setDocumentSelection(document.id, document.folderId, checked === true)}
              />
              <FileText className="h-4 w-4 text-[#8e92a3]" />
              <span className="truncate">{document.title}</span>
            </label>
          ))}
        </div>
      )
    })
  }

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

  useGSAP(() => {
    if (!userMenuPanelRef.current) return

    gsap.to(userMenuPanelRef.current, {
      autoAlpha: isUserMenuOpen ? 1 : 0,
      y: isUserMenuOpen ? 0 : -8,
      scale: isUserMenuOpen ? 1 : 0.98,
      duration: isUserMenuOpen ? 0.24 : 0.16,
      ease: isUserMenuOpen ? "power3.out" : "power2.in",
      overwrite: "auto",
      transformOrigin: "100% 0%",
    })

    gsap.to(userMenuChevronRef.current, {
      rotate: isUserMenuOpen ? 180 : 0,
      duration: 0.22,
      ease: "power2.out",
      overwrite: "auto",
    })

    if (isUserMenuOpen) {
      gsap.fromTo(
        ".user-menu-item",
        { autoAlpha: 0, y: 5 },
        { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.04, ease: "power2.out", delay: 0.05 }
      )
    }
  }, { scope: userMenuRef, dependencies: [isUserMenuOpen] })

  useGSAP(() => {
    if (!isExportDialogOpen || !exportDialogContentRef.current) return

    gsap.fromTo(
      ".export-section",
      { autoAlpha: 0, y: 10, scale: 0.99 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.06, ease: "power3.out", delay: 0.08 }
    )

    gsap.fromTo(
      ".export-option",
      { autoAlpha: 0, x: -6 },
      { autoAlpha: 1, x: 0, duration: 0.22, stagger: 0.018, ease: "power2.out", delay: 0.16 }
    )
  }, { scope: exportDialogContentRef, dependencies: [isExportDialogOpen] })

  useGSAP(() => {
    if (!routeContentRef.current) return

    gsap.fromTo(
      routeContentRef.current,
      {
        autoAlpha: 0,
        clipPath: "inset(0 0 10px 0)",
      },
      {
        autoAlpha: 1,
        clipPath: "inset(0 0 0px 0)",
        duration: 0.26,
        ease: "power3.out",
        overwrite: "auto",
        clearProps: "clipPath,opacity,visibility",
      }
    )
  }, { scope: routeContentRef, dependencies: [location.pathname] })

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#fbfbfd] lg:flex">
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
      <main className="flex h-[100dvh] min-w-0 flex-1 flex-col overflow-hidden">
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
              onClick={handleExportClick}
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

            {/* User dropdown */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="flex h-9 items-center gap-1 rounded-full bg-[#5b76fe] pl-1 pr-2 text-sm font-medium text-white shadow-sm shadow-[#5b76fe]/25 transition-colors hover:bg-[#4a63df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b76fe] focus-visible:ring-offset-2"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/18">
                  {userInitial}
                </span>
                <ChevronDown ref={userMenuChevronRef} className="h-3.5 w-3.5" />
              </button>

              <div
                ref={userMenuPanelRef}
                role="menu"
                aria-hidden={!isUserMenuOpen}
                className={`invisible absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-2xl border border-[#e9eaef] bg-white p-2 opacity-0 shadow-[0_18px_45px_rgba(28,28,30,0.12)] ${isUserMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
              >
                <div className="user-menu-item flex items-start gap-3 rounded-xl bg-[#fbfbfd] px-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5b76fe] text-sm font-semibold text-white">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#888c9e]">Signed in as</p>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-[#1c1c1e]">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#8e92a3]" />
                      <span className="truncate">{userEmail}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="user-menu-item mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#d75252] transition-colors hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  {isLoggingOut ? "Signing out..." : "Logout"}
                </button>
              </div>
            </div>
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

        <Dialog
          open={isExportDialogOpen}
          onOpenChange={setIsExportDialogOpen}
          title="Export data"
          description="Choose the folders, documents and decks that should be included in the JSON file."
          size="lg"
          footer={(
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#555a6a]">
                {selectedItemCount} selected item{selectedItemCount === 1 ? "" : "s"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportDialogOpen(false)}
                  className="rounded-xl border border-[#e1e3ea] px-4 py-2 text-sm font-medium text-[#555a6a] transition-colors hover:bg-[#f5f5f7] hover:text-[#1c1c1e]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting || selectedItemCount === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5b76fe] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#5b76fe]/25 transition-colors hover:bg-[#4a63df] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export JSON
                </button>
              </div>
            </div>
          )}
        >
          <div ref={exportDialogContentRef} className="grid gap-4 lg:grid-cols-2">
            <div className="export-section space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1c1c1e]">Library</h3>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFolderIds(new Set(folders.map((folder) => folder.id)))
                    setSelectedDocumentIds(new Set(documents.map((document) => document.id)))
                  }}
                  className="text-xs font-medium text-[#5b76fe] hover:underline"
                >
                  Select all
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-2xl border border-[#e9eaef] bg-[#fbfbfd] p-3">
                {folders.length === 0 && documents.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-[#8e92a3]">No folders or documents yet.</p>
                ) : (
                  <div className="space-y-1">
                    {renderExportFolderTree(null, 0)}
                    {documents.filter((document) => document.folderId === null).map((document) => (
                      <label key={document.id} className="export-option flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-[#1c1c1e] hover:bg-white">
                        <Checkbox
                          checked={selectedDocumentIds.has(document.id)}
                          onCheckedChange={(checked) => setDocumentSelection(document.id, document.folderId, checked === true)}
                        />
                        <FileText className="h-4 w-4 text-[#8e92a3]" />
                        <span className="truncate">{document.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="export-section space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1c1c1e]">Decks</h3>
                <button
                  type="button"
                  onClick={() => setSelectedDeckIds(new Set(decks.map((deck) => deck.id)))}
                  className="text-xs font-medium text-[#5b76fe] hover:underline"
                >
                  Select all
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-2xl border border-[#e9eaef] bg-[#fbfbfd] p-3">
                {decks.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-[#8e92a3]">No decks yet.</p>
                ) : (
                  <div className="space-y-1">
                    {decks.map((deck) => (
                      <label key={deck.id} className="export-option flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-[#1c1c1e] hover:bg-white">
                        <Checkbox
                          checked={selectedDeckIds.has(deck.id)}
                          onCheckedChange={(checked) => updateSet(setSelectedDeckIds, deck.id, checked === true)}
                        />
                        <Layers className="h-4 w-4 text-[#8e92a3]" />
                        <span className="truncate">{deck.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog>

        {/* Content */}
        <div ref={routeContentRef} className="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[#fbfbfd] will-change-opacity">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
