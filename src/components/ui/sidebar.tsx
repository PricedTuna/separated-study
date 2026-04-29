import { type ReactNode, useState, useEffect } from "react"
import { Brain } from "lucide-react"

export interface SidebarItem {
  id: string
  label: string
  icon: ReactNode
  children?: SidebarItem[]
}

export interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

export interface SidebarProps {
  sections?: SidebarSection[]
  onItemClick?: (id: string) => void
  className?: string
  activePath?: string[]
}

/**
 * SidebarItem - Individual navigation item with optional nested children
 */
function SidebarItem({
  item,
  onItemClick,
  activePath = [],
}: {
  item: SidebarItem
  onItemClick?: (id: string) => void
  activePath?: string[]
}) {
  const isActive = activePath.includes(item.id)
  const hasChildActive = item.children?.some(c => activePath.includes(c.id)) ?? false
  const childCount = item.children?.length ?? 0
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isActive || hasChildActive) {
      setIsExpanded(true)
    }
  }, [activePath.join(","), item.id])

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

/**
 * SidebarSection
 */
function SidebarSection({
  section,
  onItemClick,
  activePath,
}: {
  section: SidebarSection
  onItemClick?: (id: string) => void
  activePath?: string[]
}) {
  return (
    <div className="space-y-0.5">
      {section.title && (
        <div className="px-3 py-2 text-xs font-medium text-[#a5a8b5] uppercase">
          {section.title}
        </div>
      )}
      {section.items.map(item => (
        <SidebarItem
          key={item.id}
          item={item}
          onItemClick={onItemClick}
          activePath={activePath}
        />
      ))}
    </div>
  )
}

/**
 * Sidebar
 */
export function Sidebar({
  sections = [],
  onItemClick,
  className,
  activePath = [],
}: SidebarProps) {
  return (
    <aside className={`w-56 bg-white flex flex-col shrink-0 border-r border-[#e9eaef] ${className ?? ""}`}>
      <div className="p-3 border-b border-[#e9eaef]">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
          <div className="w-6 h-6 rounded bg-[#5b76fe] flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium text-[#1c1c1e]">Spaced Study</span>
        </div>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        {sections.map((section, idx) => (
          <SidebarSection
            key={section.title || idx}
            section={section}
            onItemClick={onItemClick}
            activePath={activePath}
          />
        ))}
      </nav>


    </aside>
  )
}