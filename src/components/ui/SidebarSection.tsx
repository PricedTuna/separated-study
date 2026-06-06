import { SidebarItem, type SidebarItemData } from "./SidebarItem"

export interface SidebarSectionData {
  title?: string
  items: SidebarItemData[]
}

interface SidebarSectionProps {
  section: SidebarSectionData
  onItemClick?: (id: string) => void
  activePath?: string[]
}

export const SidebarSection = ({
  section,
  onItemClick,
  activePath,
}: SidebarSectionProps) => {
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
