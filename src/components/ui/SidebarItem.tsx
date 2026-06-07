import { type ReactNode, useState, useEffect } from "react"

export interface SidebarItemData {
  id: string
  label: string
  icon: ReactNode
  children?: SidebarItemData[]
}

interface SidebarItemProps {
  item: SidebarItemData
  onItemClick?: (id: string) => void
  activePath?: string[]
}

export const SidebarItem = ({
  item,
  onItemClick,
  activePath = [],
}: SidebarItemProps) => {
  const isActive = activePath.includes(item.id)
  const hasChildActive = item.children?.some(c => activePath.includes(c.id)) ?? false
  const childCount = item.children?.length ?? 0
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isActive || hasChildActive) {
      const id = requestAnimationFrame(() => setIsExpanded(true))
      return () => cancelAnimationFrame(id)
    }
  }, [isActive, hasChildActive])

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleClick = () => {
    onItemClick?.(item.id)
  }

  return (
    <div>
      <div className="flex items-center">
        {childCount > 0 ? (
          <button
            onClick={handleToggle}
            type="button"
            className="w-8 h-8 flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-slate-100 rounded"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className={`w-4 h-4 ${isExpanded ? "rotate-90" : ""}`}>
              <path d="M6 4l4 4-4 4V4z" />
            </svg>
          </button>
        ) : (
          <span className="w-8 h-8 flex-shrink-0" />
        )}

        <button
          type="button"
          onClick={handleClick}
          className={`flex-1 flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all duration-150 hover:bg-[#f0f1f5] active:scale-[0.98] ${isActive ? "bg-[#eef0ff] text-[#5b76fe] font-medium" : "text-[#555a6a]"}`}
        >
          {item.icon}
          <span className="flex-1 text-left truncate">{item.label}</span>
        </button>
      </div>

      {childCount > 0 && isExpanded && (
        <div className="pl-4">
          {item.children!.map(child => (
            <SidebarItem
              key={child.id}
              item={child}
              onItemClick={onItemClick}
              activePath={activePath}
            />
          ))}
        </div>
      )}
    </div>
  )
}
