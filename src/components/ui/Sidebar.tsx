import { SidebarSection, type SidebarSectionData } from "./SidebarSection"
import { Brain } from "lucide-react"

export interface SidebarProps {
  sections?: SidebarSectionData[]
  onItemClick?: (id: string) => void
  className?: string
  activePath?: string[]
}

export const Sidebar = ({
  sections = [],
  onItemClick,
  className,
  activePath = [],
}: SidebarProps) => {
  return (
    <aside className={`w-full h-full bg-white flex flex-col shrink-0 border-r border-[#e9eaef] ${className ?? ""}`}>
      <div className="p-3">
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
