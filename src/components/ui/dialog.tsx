import { useEffect, useRef, useState, type FC, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { X } from "lucide-react"

gsap.registerPlugin(useGSAP)

type DialogSize = "sm" | "md" | "lg"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: DialogSize
  closeLabel?: string
  onExited?: () => void
}

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
}

export const Dialog: FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  onExited,
  size = "md",
  closeLabel = "Close",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const initializedRef = useRef(false)

  // Internal state to keep content rendered during exit animation
  const [shouldRenderContent, setShouldRenderContent] = useState(open)

  useEffect(() => {
    if (open) {
      setShouldRenderContent(true)
    } else {
      // Delay unmounting until after animation
      const timer = setTimeout(() => {
        setShouldRenderContent(false)
        onExited?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [open, onExited])

  useGSAP(
    () => {
      gsap.set(overlayRef.current, {
        opacity: 0,
        backdropFilter: "blur(0px)",
        WebkitBackdropFilter: "blur(0px)",
      })
      gsap.set(panelRef.current, {
        opacity: 0,
        y: 18,
        scale: 0.98,
        transformOrigin: "50% 50%",
      })
      gsap.set([headerRef.current, bodyRef.current, footerRef.current].filter(Boolean), {
        opacity: 0,
        y: 8,
      })
    },
    { scope: containerRef },
  )

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      if (!open) return
    }

    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
    })

    if (open) {
      tl.to(overlayRef.current, {
        opacity: 1,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        duration: 0.38,
        ease: "power2.out",
      })
        .to(panelRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: "power3.out",
        }, 0.02)
        .to(headerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.24,
          ease: "power2.out",
        }, 0.1)
        .to(bodyRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.24,
          ease: "power2.out",
        }, 0.14)

      if (footerRef.current) {
        tl.to(footerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.24,
          ease: "power2.out",
        }, 0.18)
      }
    } else {
      tl.to([headerRef.current, bodyRef.current, footerRef.current].filter(Boolean), {
        opacity: 0,
        y: 6,
        duration: 0.18,
        ease: "power2.in",
      })
        .to(panelRef.current, {
          opacity: 0,
          y: 12,
          scale: 0.985,
          duration: 0.24,
          ease: "power2.inOut",
        }, 0.02)
        .to(overlayRef.current, {
          opacity: 0,
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          duration: 0.22,
          ease: "power2.in",
        }, 0.04)
    }

    return () => {
      tl.kill()
    }
  }, [open])

  useEffect(() => {
    if (open) {
      // Focus the first element with autoFocus or the first input/textarea
      // We use a slightly longer delay and requestAnimationFrame to ensure
      // the DOM is ready, not inert, and animations are in progress
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          const el = panelRef.current?.querySelector(
            '[autofocus], [autoFocus], input:not([type="hidden"]), textarea, select'
          ) as HTMLElement
          if (el) {
            el.focus()
            // If it's a text input, ensure cursor is visible/at end
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
              const val = el.value
              el.value = ""
              el.value = val
            }
          }
        })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onOpenChange])

  return createPortal(
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      role="presentation"
      aria-hidden={!open}
      inert={!open ? "" : undefined}
    >
      <button
        ref={overlayRef}
        aria-label={closeLabel}
        className="fixed inset-0 bg-black/30"
        onClick={() => onOpenChange(false)}
        type="button"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        className={`relative z-10 w-full ${sizeClasses[size]} rounded-3xl bg-white p-0`}
        style={{ boxShadow: "rgb(224, 226, 232) 0px 0px 0px 1px, 0 24px 60px rgba(28, 28, 30, 0.12)" }}
      >
        <div
          ref={headerRef}
          className="flex items-start justify-between gap-4 border-b border-[#e9eaef] px-6 py-5"
        >
          <div className="min-w-0">
            <h2
              id="dialog-title"
              className="text-[22px] font-medium text-[#1c1c1e] leading-[1.15] tracking-[-0.44px]"
              style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}
            >
              {title}
            </h2>
            {description && (
              <p id="dialog-description" className="mt-1 text-sm text-[#555a6a]">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-[#a5a8b5] hover:bg-[#f5f5f7] hover:text-[#1c1c1e] transition-colors"
            aria-label={closeLabel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={bodyRef} className="px-6 py-5">
          {shouldRenderContent && children}
        </div>

        {footer && (
          <div ref={footerRef} className="border-t border-[#e9eaef] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
