import { type ReactNode } from "react"
import { cn } from "../../lib/utils"

interface SidebarItem {
  id: string
  label: string
  icon: ReactNode
  active?: boolean
  count?: number
}

interface SidebarProps {
  items: SidebarItem[]
  activeItem?: string
  onItemClick?: (id: string) => void
  className?: string
}

/**
 * SidebarItem - Individual navigation item with Notion/Miro style
 * Features:
 * - Hover state with subtle background
 * - Active state with accent color
 * - Smooth transitions
 * - Optional count badge
 */
export function SidebarItem({
  item,
  isActive = false,
  onClick,
  className,
}: {
  item: SidebarItem
  isActive?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150",
        "hover:bg-[#f0f1f5] active:scale-[0.98]",
        isActive
          ? "bg-[#eef0ff] text-[#5b76fe] font-medium"
          : "text-[#555a6a] hover:text-[#1c1c1e] font-normal",
        className
      )}
    >
      <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
      <span className="flex-1 text-left truncate">{item.label}</span>
      {item.count !== undefined && (
        <span className="text-xs text-[#a5a8b5] bg-slate-100 px-2 py-0.5 rounded-full">
          {item.count}
        </span>
      )}
    </button>
  )
}

/**
 * Sidebar - Notion/Miro inspired sidebar
 * Features:
 * - Minimal header
 * - Animated item selection
 * - Hover states
 * - Ring shadow border
 */
export function Sidebar({ items, activeItem, onItemClick, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-56 bg-white flex flex-col shrink-0",
        "border-r border-[#e9eaef]",
        className
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-[#e9eaef]">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="w-5 h-5 rounded bg-[#5b76fe] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
              <path d="M2 2h8v8H2V2zm1 1v6h6V3H3z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-[#1c1c1e]">Spaced Study</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        <div className="px-3 py-2 text-xs font-medium text-[#a5a8b5] uppercase tracking-wider">
          Workspace
        </div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="animate-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "backwards",
            }}
          >
            <SidebarItem
              item={item}
              isActive={activeItem === item.id}
              onClick={() => onItemClick?.(item.id)}
            />
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-[#e9eaef]">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f0f1f5] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New</span>
        </button>
      </div>
    </aside>
  )
}