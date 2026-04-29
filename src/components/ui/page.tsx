import type { FC, ReactNode } from "react"
import { Plus, Loader2 } from "lucide-react"

interface PageHeaderProps {
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
          style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}
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

interface EmptyStateProps {
  icon: ReactNode
  iconBgColor: string
  iconColor: string
  title: string
  description: string
  buttonLabel: string
  onButtonClick: () => void
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  iconBgColor,
  iconColor,
  title,
  description,
  buttonLabel,
  onButtonClick,
}) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className={`w-16 h-16 rounded-2xl ${iconBgColor} flex items-center justify-center`}>
      <div className={iconColor}>{icon}</div>
    </div>
    <div className="text-center">
      <p
        className="text-[#1c1c1e] font-medium text-lg"
        style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}
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

export const LoadingState: FC = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="w-6 h-6 animate-spin text-[#5b76fe]" />
  </div>
)

interface PageContainerProps {
  children: ReactNode
}

export const PageContainer: FC<PageContainerProps> = ({ children }) => (
  <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 md:px-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
    {children}
  </div>
)
