import { useState, useEffect, useRef, type FC } from "react"
import { Folder, FileText, ChevronDown } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

interface NewItemDropdownProps {
  onNewDocument: () => void
  onNewFolder: () => void
}

export const NewItemDropdown: FC<NewItemDropdownProps> = ({
  onNewDocument,
  onNewFolder,
}) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (open) {
      gsap.to(menuRef.current, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
        pointerEvents: "auto"
      })
    } else {
      gsap.to(menuRef.current, {
        autoAlpha: 0,
        y: -10,
        scale: 0.95,
        duration: 0.15,
        ease: "power2.in",
        pointerEvents: "none"
      })
    }
  }, { dependencies: [open], scope: dropdownRef })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap shrink-0"
      >
        <span>New...</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        ref={menuRef}
        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e9eaef] py-1.5 z-50 overflow-hidden"
        style={{ opacity: 0, visibility: 'hidden' }}
      >
        <button
          onClick={() => { onNewDocument(); setOpen(false) }}
          className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1c1c1e] hover:bg-[#f0f1f5] flex items-center gap-2.5 transition-colors"
        >
          <FileText className="w-4 h-4 text-[#5b76fe]" />
          Document
        </button>
        <button
          onClick={() => { onNewFolder(); setOpen(false) }}
          className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1c1c1e] hover:bg-[#f0f1f5] flex items-center gap-2.5 transition-colors"
        >
          <Folder className="w-4 h-4 text-[#f57c00]" />
          Folder
        </button>
      </div>
    </div>
  )
}