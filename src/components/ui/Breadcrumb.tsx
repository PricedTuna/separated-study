import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRef, useState, useEffect } from "react"

gsap.registerPlugin(useGSAP)

export interface BreadcrumbItem {
  id: string
  name: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  rootLabel?: string
  rootPath?: string
  className?: string
}

export const Breadcrumb = ({
  items,
  rootLabel = "Documents",
  rootPath = "/dashboard/documents",
  className,
}: BreadcrumbProps) => {
  const containerRef = useRef(null)
  const [animatedItems, setAnimatedItems] = useState<BreadcrumbItem[]>(items)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (animatedItems.length === 0 && items.length > 0) {
      const id = requestAnimationFrame(() => setAnimatedItems(items))
      return () => cancelAnimationFrame(id)
    }
    if (JSON.stringify(animatedItems) !== JSON.stringify(items)) {
      const id = requestAnimationFrame(() => setIsExiting(true))
      return () => cancelAnimationFrame(id)
    }
  }, [items, animatedItems])

  useEffect(() => {
    if (!isExiting) return
    const ctx = gsap.context(() => {
      gsap.to(".breadcrumb-item", {
        opacity: 0,
        x: -10,
        duration: 0.2,
        stagger: 0.05,
        ease: "power2.in",
        onComplete: () => {
          setAnimatedItems(items)
          setIsExiting(false)
        },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [isExiting, items])

  useGSAP(
    () => {
      if (isExiting) return
      gsap.fromTo(
        ".breadcrumb-container",
        { opacity: 0, y: -5 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
      )
      gsap.fromTo(
        ".breadcrumb-root",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", delay: 0.05 }
      )
      gsap.fromTo(
        ".breadcrumb-item",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.1, ease: "power2.out", delay: 0.1 }
      )
    },
    {
      scope: containerRef,
      dependencies: [animatedItems, isExiting],
    }
  )

  if (items.length === 0 && !isExiting) return null

  const displayItems = animatedItems

  return (
    <div ref={containerRef} className={cn("breadcrumb-container flex items-center gap-1 mb-4 flex-wrap min-w-0", className)}>
      <Link
        to={rootPath}
        className="breadcrumb-root flex items-center gap-1 text-xs text-[#555a6a] hover:text-[#1c1c1e] transition-colors shrink-0"
      >
        <ArrowLeft className="w-3 h-3" />
        {rootLabel}
      </Link>

      {displayItems.length > 1 && (
        <div className="breadcrumb-item flex items-center gap-1 sm:hidden shrink-0">
          <ChevronRight className="w-3 h-3 text-[#a5a8b5]" />
          <span className="text-xs text-[#555a6a]">...</span>
        </div>
      )}

      {displayItems.map((item, idx) => {
        const isLast = idx === displayItems.length - 1
        return (
          <div
            key={item.id}
            className={cn(
              "breadcrumb-item flex items-center gap-1 min-w-0",
              !isLast && "hidden sm:flex"
            )}
          >
            <ChevronRight className="w-3 h-3 text-[#a5a8b5] shrink-0" />
            {isLast ? (
              <span className="text-xs font-medium text-[#1c1c1e] truncate max-w-[120px] sm:max-w-none">
                {item.name}
              </span>
            ) : (
              <Link
                to={`/dashboard/folders/${item.id}`}
                className="text-xs text-[#555a6a] hover:text-[#1c1c1e] transition-colors truncate"
              >
                {item.name}
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}
