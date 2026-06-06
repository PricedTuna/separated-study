import { type FC, type KeyboardEvent, type ReactNode } from "react"
import { ArrowRight, Trash2 } from "lucide-react"
import { confirmDelete } from "@/lib/swal"

export interface ListItemProps {
  icon: ReactNode
  iconBgColor?: string
  iconColor?: string
  title: string
  subtitle?: ReactNode
  onClick: () => void
  onDelete?: () => void
  deleteConfirmMessage?: string
  showDelete?: boolean
  animationDelay?: number
  id?: string
  deleting?: boolean
}

export const ListItem: FC<ListItemProps> = ({
  icon,
  iconBgColor = "bg-[#eef0ff]",
  iconColor = "text-[#5b76fe]",
  title,
  subtitle,
  onClick,
  onDelete,
  deleteConfirmMessage,
  showDelete = true,
  animationDelay = 0,
  id,
  deleting = false,
}) => {
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (deleting) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!deleting) onClick()
      }}
      onKeyDown={handleKeyDown}
      className="card-miro p-4 flex items-center gap-4 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center shrink-0 ${iconColor}`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[#1c1c1e] font-medium text-[15px] truncate"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          {title}
        </p>
        {subtitle && (
          <div className="text-[#555a6a] text-xs mt-0.5">
            {subtitle}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {showDelete && onDelete && (
          <button
            onClick={async (e) => {
              e.stopPropagation()
              if (deleting) return
              const defaultMessage = `Delete "${title}"?`
              const message = deleteConfirmMessage || defaultMessage

              const { isConfirmed } = await confirmDelete(title, message)
              if (isConfirmed) {
                onDelete()
              }
            }}
            disabled={deleting}
            className="p-1.5 text-[#a5a8b5] hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            {deleting ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#a5a8b5] border-t-transparent" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
        <ArrowRight className="w-4 h-4 text-[#a5a8b5] group-hover:text-[#5b76fe] transition-colors" />
      </div>
    </div>
  )
}
