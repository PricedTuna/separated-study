import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

export interface BreadcrumbItem {
  id: string
  name: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  rootLabel?: string
  rootPath?: string
  className?: string
}

/**
 * Breadcrumb - Navigation breadcrumb for nested folder hierarchy
 * Shows: Root > Folder1 > Folder2 > Current
 * - Root is always shown as link
 * - All items except last are clickable links
 * - Last item is shown as text (current location)
 */
export function Breadcrumb({
  items,
  rootLabel = "Documents",
  rootPath = "/dashboard/documents",
  className,
}: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <div className={cn("flex items-center gap-1 mb-4 flex-wrap", className)}>
      <Link
        to={rootPath}
        className="flex items-center gap-1 text-xs text-[#555a6a] hover:text-[#1c1c1e] transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        {rootLabel}
      </Link>
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-[#a5a8b5]" />
          {idx === items.length - 1 ? (
            <span className="text-xs font-medium text-[#1c1c1e]">{item.name}</span>
          ) : (
            <Link
              to={`/dashboard/folders/${item.id}`}
              className="text-xs text-[#555a6a] hover:text-[#1c1c1e] transition-colors"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}