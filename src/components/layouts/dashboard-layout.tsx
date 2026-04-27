import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { Sidebar } from "../ui/sidebar"

const sidebarItems = [
  {
    id: "documents",
    label: "Documents",
    path: "/dashboard/documents",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "decks",
    label: "Decks",
    path: "/dashboard/decks",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
]

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = { name: "User" }

  const activeItem =
    sidebarItems.find((item) => location.pathname.startsWith(item.path))?.id ?? "documents"

  const activeLabel = sidebarItems.find((i) => i.id === activeItem)?.label ?? ""

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={(id) => {
          const item = sidebarItems.find((i) => i.id === id)
          if (item) navigate(item.path)
        }}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-12 border-b border-[#e9eaef] bg-white flex items-center justify-between px-4">
          <div className="text-sm text-[#555a6a]">{activeLabel}</div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-[#5b76fe] flex items-center justify-center text-white text-sm font-medium">
              {user.name[0]}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 bg-white">
          <Outlet />
        </div>
      </main>
    </div>
  )
}