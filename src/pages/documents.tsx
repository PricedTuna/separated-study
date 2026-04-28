import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Folder, FileText, Clock, Loader2, Plus } from "lucide-react"
import { useDocuments } from "../hooks/use-documents"
import { useFolders } from "../hooks/use-folders"
import { useDataRefresh } from "../hooks/use-data-refresh"
import { documentService, folderService } from "../lib/container"
import type { CreateDocumentInput } from "../domain/models/document"
import type { CreateFolderInput } from "../domain/models/folder"
import { PageHeader, EmptyState, LoadingState, PageContainer } from "../components/ui/page"
import { Dialog } from "../components/ui/dialog"
import { ListItem } from "../components/ui/list-item"

export function DocumentsPage() {
  const { documents, loading: docsLoading, create: createDoc, reload: reloadDocs } = useDocuments()
  const { folders, loading: foldersLoading, create: createFolder, reload: reloadFolders } = useFolders()
  const { folderId } = useParams()
  const navigate = useNavigate()
  const { refreshKey } = useDataRefresh()
  const didMountRef = useRef(false)

  const [showDocForm, setShowDocForm] = useState(false)
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [title, setTitle] = useState("")
  const [folderName, setFolderName] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter documents and folders based on current folder context
  const currentFolder = useMemo(() => {
    if (!folderId) return null
    return folders.find(f => f.id === folderId) || null
  }, [folders, folderId])

  const subfolders = useMemo(() => {
    return folders.filter(f => f.parentId === folderId)
  }, [folders, folderId])

  const docsInFolder = useMemo(() => {
    if (!folderId) {
      // Root: show documents with no folder
      return documents.filter(d => d.folderId === null)
    }
    return documents.filter(d => d.folderId === folderId)
  }, [documents, folderId])

  const rootFolders = useMemo(() => {
    return folders.filter(f => f.parentId === null)
  }, [folders])

  const docsWithoutFolder = useMemo(() => {
    return documents.filter(d => d.folderId === null)
  }, [documents])

  // Reload data when refresh is triggered
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    reloadDocs()
    reloadFolders()
  }, [refreshKey, reloadDocs, reloadFolders])

  // Computed values for display
  const isRoot = !folderId
  const description = isRoot
    ? `${rootFolders.length} folder${rootFolders.length !== 1 ? "s" : ""}, ${docsWithoutFolder.length} document${docsWithoutFolder.length !== 1 ? "s" : ""}`
    : `${subfolders.length} folder${subfolders.length !== 1 ? "s" : ""}, ${docsInFolder.length} document${docsInFolder.length !== 1 ? "s" : ""}`

  const hasItems = isRoot
    ? rootFolders.length > 0 || docsWithoutFolder.length > 0
    : subfolders.length > 0 || docsInFolder.length > 0

  async function handleCreateDocument(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const input: CreateDocumentInput = {
        title,
        content: `# ${title}\n\n`,
        folderId: folderId || null,
      }
      const doc = await createDoc(input)
      setTitle("")
      setShowDocForm(false)
      if (folderId) {
        navigate(`/dashboard/folders/${folderId}/${doc.id}`)
      } else {
        navigate(`/dashboard/documents/${doc.id}`)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const input: CreateFolderInput = {
        name: folderName,
        parentId: folderId || null,
      }
      const folder = await createFolder(input)
      setFolderName("")
      setShowFolderForm(false)
      if (folderId) {
        navigate(`/dashboard/folders/${folderId}`)
      } else {
        navigate(`/dashboard/folders/${folder.id}`)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  function handleDeleteDoc(id: string) {
    documentService.delete(id).then(() => reloadDocs())
  }

  function handleDeleteFolder(id: string) {
    folderService.delete(id).then(() => reloadFolders())
  }

  function handleCancel() {
    setShowDocForm(false)
    setShowFolderForm(false)
    setTitle("")
    setFolderName("")
    setError(null)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const loading = docsLoading || foldersLoading

  return (
    <PageContainer>
      <PageHeader
        title={isRoot ? "Documents" : currentFolder?.name || "Folder"}
        description={description}
        buttonLabel="New document"
        onButtonClick={() => setShowDocForm(true)}
        buttonId="create-document-btn"
        extraButtons={
          <button
            onClick={() => setShowFolderForm(true)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New folder
          </button>
        }
      />

      {/* New Document Dialog */}
      <Dialog
        open={showDocForm}
        onOpenChange={(open) => {
          if (!open) handleCancel()
          else setShowDocForm(true)
        }}
        title="New document"
        description="Create a document to organize notes and study material."
        size="md"
      >
        <form onSubmit={handleCreateDocument} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="document-title-input" className="text-xs font-medium text-[#555a6a]">
              Title
            </label>
            <input
              id="document-title-input"
              autoFocus
              type="text"
              placeholder="Document title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-miro w-full text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={handleCancel} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || creating}
              className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
        </form>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog
        open={showFolderForm}
        onOpenChange={(open) => {
          if (!open) handleCancel()
          else setShowFolderForm(true)
        }}
        title="New folder"
        description="Create a folder to organize your documents."
        size="md"
      >
        <form onSubmit={handleCreateFolder} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="folder-name-input" className="text-xs font-medium text-[#555a6a]">
              Name
            </label>
            <input
              id="folder-name-input"
              autoFocus
              type="text"
              placeholder="Folder name..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="input-miro w-full text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={handleCancel} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || creating}
              className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create folder
            </button>
          </div>
        </form>
      </Dialog>

      {loading ? (
        <LoadingState />
      ) : !hasItems ? (
        <EmptyState
          icon={<Folder className="w-8 h-8" />}
          iconBgColor="bg-[#eef0ff]"
          iconColor="text-[#5b76fe]"
          title={isRoot ? "No documents yet" : "Empty folder"}
          description={isRoot ? "Create your first document to start studying" : "Add documents or subfolders to this folder"}
          buttonLabel="Create document"
          onButtonClick={() => setShowDocForm(true)}
        />
      ) : (
        <div className="grid gap-3">
          {/* Folders first */}
          {(isRoot ? rootFolders : subfolders).map((folder, i) => (
            <ListItem
              key={folder.id}
              id={`folder-item-${folder.id}`}
              icon={<Folder className="w-5 h-5" />}
              iconBgColor="bg-[#fff3e0]"
              iconColor="text-[#f57c00]"
              title={folder.name}
              onClick={() => navigate(`/dashboard/folders/${folder.id}`)}
              onDelete={() => handleDeleteFolder(folder.id)}
              deleteConfirmMessage={`Delete "${folder.name}"? All contents will be deleted.`}
              animationDelay={i * 50}
            />
          ))}

          {/* Documents */}
          {(isRoot ? docsWithoutFolder : docsInFolder).map((doc, i) => (
            <ListItem
              key={doc.id}
              id={`document-item-${doc.id}`}
              icon={<FileText className="w-5 h-5" />}
              iconBgColor="bg-[#eef0ff]"
              iconColor="text-[#5b76fe]"
              title={doc.title}
              subtitle={
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(doc.updatedAt)}
                </span>
              }
              onClick={() => navigate(isRoot ? `/dashboard/documents/${doc.id}` : `/dashboard/folders/${folderId}/${doc.id}`)}
              onDelete={() => handleDeleteDoc(doc.id)}
              deleteConfirmMessage={`Delete "${doc.title}"?`}
              animationDelay={(isRoot ? rootFolders : subfolders).length * 50 + i * 50}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}