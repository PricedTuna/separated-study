import type { ReactNode } from "react"
import { Plus } from "lucide-react"

export interface EmptyStateProps {
  icon: ReactNode
  iconBgColor: string
  iconColor: string
  title: string
  description: string
  buttonLabel: string
  onButtonClick: () => void
}

export const EmptyState = ({
  icon,
  iconBgColor,
  iconColor,
  title,
  description,
  buttonLabel,
  onButtonClick,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className={`w-16 h-16 rounded-2xl ${iconBgColor} flex items-center justify-center`}>
      <div className={iconColor}>{icon}</div>
    </div>
    <div className="text-center">
      <p
        className="text-[#1c1c1e] font-medium text-lg"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {title}
      </p>
      <p className="text-[#555a6a] text-sm mt-1">{description}</p>
    </div>
    <button onClick={onButtonClick} className="btn-primary flex items-center gap-2 text-sm">
      <Plus className="w-4 h-4" />
      {buttonLabel}
    </button>
  </div>
)
