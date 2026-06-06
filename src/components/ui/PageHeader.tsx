import type { FC, ReactNode } from "react"
import { Plus } from "lucide-react"

export interface PageHeaderProps {
  title: string
  description: string
  buttonLabel?: string
  onButtonClick?: () => void
  buttonId?: string
  extraButtons?: ReactNode
  backButton?: ReactNode
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  buttonLabel,
  onButtonClick,
  buttonId,
  extraButtons,
  backButton,
}) => (
  <div className="flex flex-row items-center justify-between gap-4">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {backButton}
      <div className="min-w-0 flex-1">
        <h1
          className="text-[28px] font-medium text-[#1c1c1e] leading-[1.15] tracking-[-0.72px] truncate"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          {title}
        </h1>
        <p className="text-[#555a6a] text-sm mt-0.5 truncate">{description}</p>
      </div>
    </div>
    <div className="flex flex-nowrap items-center gap-2 shrink-0">
      {extraButtons}
      {buttonLabel && onButtonClick && (
        <button id={buttonId} onClick={onButtonClick} className="btn-primary flex items-center gap-2 text-sm shrink-0 whitespace-nowrap">
          <Plus className="w-4 h-4 shrink-0" />
          {buttonLabel}
        </button>
      )}
    </div>
  </div>
)
