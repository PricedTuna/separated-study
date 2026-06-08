import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Folder, FileText, Clock } from "lucide-react"
import { useDocuments } from "../hooks/use-documents"
import { useFolders } from "../hooks/use-folders"
import { useDataRefresh } from "../hooks/use-data-refresh"
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingState } from "@/components/ui/LoadingState"
import { PageContainer } from "@/components/ui/PageContainer"
import { ListItem } from "@/components/ui/ListItem"
import { BackButton } from "@/components/ui/BackButton"
import { DocumentFormDialog } from "@/components/documents/DocumentFormDialog"
import { FolderFormDialog } from "@/components/documents/FolderFormDialog"
import { NewItemDropdown } from "@/components/documents/NewItemDropdown"

export function DocumentsPage() {
  const { documents, loading: docsLoading, create: createDoc, remove: removeDoc, reload: reloadDocs } = useDocuments()
  const { folders, loading: foldersLoading, create: createFolder, remove: removeFolder, reload: reloadFolders } = useFolders()
  const { folderId } = useParams()
  const navigate = useNavigate()
  const { refreshKey } = useDataRefresh()
  const didMountRef = useRef(false)

  const [showDocForm, setShowDocForm] = useState(false)
  const [showFolderForm, setShowFolderForm] = useState(false)

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
    reloadDocs(true)
    reloadFolders(true)
  }, [refreshKey, reloadDocs, reloadFolders])

  // Computed values for display
  const isRoot = !folderId
  const description = isRoot
    ? `${rootFolders.length} folder${rootFolders.length !== 1 ? "s" : ""}, ${docsWithoutFolder.length} document${docsWithoutFolder.length !== 1 ? "s" : ""}`
    : `${subfolders.length} folder${subfolders.length !== 1 ? "s" : ""}, ${docsInFolder.length} document${docsInFolder.length !== 1 ? "s" : ""}`

  const hasItems = isRoot
    ? rootFolders.length > 0 || docsWithoutFolder.length > 0
    : subfolders.length > 0 || docsInFolder.length > 0

  async function handleDeleteDoc(id: string) {
    await removeDoc(id)
  }

  async function handleDeleteFolder(id: string) {
    await removeFolder(id)
    await Promise.all([reloadDocs(true), reloadFolders(true)])
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
        backButton={
          !isRoot ? (
            <BackButton
              onClick={() => {
                if (currentFolder?.parentId) {
                  navigate(`/dashboard/folders/${currentFolder.parentId}`)
                } else {
                  navigate("/dashboard/documents")
                }
              }}
            />
          ) : undefined
        }
        extraButtons={
          <NewItemDropdown
            onNewDocument={() => setShowDocForm(true)}
            onNewFolder={() => setShowFolderForm(true)}
          />
        }
      />

      <DocumentFormDialog
        open={showDocForm}
        onOpenChange={setShowDocForm}
        onSubmit={createDoc}
        onSuccess={(doc) => {
          if (folderId) {
            navigate(`/dashboard/folders/${folderId}/${doc.id}`)
          } else {
            navigate(`/dashboard/documents/${doc.id}`)
          }
        }}
        onCancel={() => setShowDocForm(false)}
        folderId={folderId}
      />

      <FolderFormDialog
        open={showFolderForm}
        onOpenChange={setShowFolderForm}
        onSubmit={createFolder}
        onSuccess={(folder) => {
          if (folderId) {
            navigate(`/dashboard/folders/${folderId}`)
          } else {
            navigate(`/dashboard/folders/${folder.id}`)
          }
        }}
        onCancel={() => setShowFolderForm(false)}
        parentId={folderId}
      />

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
