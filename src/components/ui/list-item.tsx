import { type FC, type ReactNode } from "react"
import { ArrowRight, Trash2 } from "lucide-react"

interface ListItemProps {
  /** Main icon on the left (e.g., FileText, Folder) */
  icon: ReactNode
  /** Background color for icon container */
  iconBgColor?: string
  /** Icon color class */
  iconColor?: string
  /** Title text */
  title: string
  /** Optional subtitle (e.g., description, date) */
  subtitle?: ReactNode
  /** Click handler for the item */
  onClick: () => void
  /** Click handler for delete button */
  onDelete?: () => void
  /** Delete button visibility */
  showDelete?: boolean
  /** Animation delay for staggered entrance */
  animationDelay?: number
  /** Unique ID for testing */
  id?: string
}

export const ListItem: FC<ListItemProps> = ({
  icon,
  iconBgColor = "bg-[#eef0ff]",
  iconColor = "text-[#5b76fe]",
  title,
  subtitle,
  onClick,
  onDelete,
  showDelete = true,
  animationDelay = 0,
  id,
}) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className="card-miro p-4 flex items-center gap-4 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center shrink-0 ${iconColor}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[#1c1c1e] font-medium text-[15px] truncate"
          style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}
        >
          {title}
        </p>
        {subtitle && (
          <div className="text-[#555a6a] text-xs mt-0.5">
            {subtitle}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {showDelete && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 text-[#a5a8b5] hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <ArrowRight className="w-4 h-4 text-[#a5a8b5] group-hover:text-[#5b76fe] transition-colors" />
      </div>
    </button>
  )
}