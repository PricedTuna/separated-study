import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP)

export type SelectOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

type SelectSize = "sm" | "md"

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  ariaLabel?: string
  className?: string
  triggerClassName?: string
  menuClassName?: string
  optionClassName?: string
  size?: SelectSize
  emptyMessage?: string
}

const sizeClasses: Record<SelectSize, string> = {
  sm: "min-h-11 px-3.5 py-2 text-sm",
  md: "min-h-[52px] px-4 py-3 text-sm",
}

export const Select = ({
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
  disabled = false,
  id,
  name,
  ariaLabel,
  className,
  triggerClassName,
  menuClassName,
  optionClassName,
  size = "md",
  emptyMessage = "No hay opciones disponibles",
}: SelectProps) => {
  const generatedId = useId()
  const selectId = id ?? `select-${generatedId}`
  const listboxId = `${selectId}-listbox`
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const chevronRef = useRef<SVGSVGElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  const enabledOptions = useMemo(
    () => options.filter((option) => !option.disabled),
    [options],
  )

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  )

  const commitSelection = useCallback((nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
  }, [onChange])

  const moveHighlight = useCallback((direction: 1 | -1) => {
    const enabledIndexes = options
      .map((option, index) => option.disabled ? -1 : index)
      .filter((index) => index !== -1)

    if (enabledIndexes.length === 0) return

    const currentPos = enabledIndexes.findIndex((index) => index === highlightedIndex)
    const fallbackPos = selectedIndex >= 0 ? enabledIndexes.findIndex((index) => index === selectedIndex) : -1
    const startPos = currentPos >= 0 ? currentPos : fallbackPos >= 0 ? fallbackPos : 0
    const nextPos = (startPos + direction + enabledIndexes.length) % enabledIndexes.length
    setHighlightedIndex(enabledIndexes[nextPos])
  }, [highlightedIndex, options, selectedIndex])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!open) {
        setHighlightedIndex(selectedIndex)
        return
      }

      if (selectedIndex >= 0 && !options[selectedIndex]?.disabled) {
        setHighlightedIndex(selectedIndex)
        return
      }

      const firstEnabledIndex = options.findIndex((option) => !option.disabled)
      setHighlightedIndex(firstEnabledIndex)
    })
    return () => cancelAnimationFrame(id)
  }, [open, options, selectedIndex])

  useEffect(() => {
    if (!open || highlightedIndex < 0) return
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" })
  }, [highlightedIndex, open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    window.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      window.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  useGSAP((_, contextSafe) => {
    const safe = contextSafe ?? ((fn: () => void) => fn)

    if (triggerRef.current) {
      gsap.set(triggerRef.current, { transformOrigin: "50% 50%" })
    }

    if (open && menuRef.current) {
      gsap.fromTo(menuRef.current,
        { autoAlpha: 0, y: 10, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        },
      )

      if (chevronRef.current) {
        gsap.to(chevronRef.current, {
          rotate: 180,
          duration: 0.2,
          ease: "power2.out",
        })
      }

      gsap.fromTo(
        ".select-option",
        { autoAlpha: 0, y: 6 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.16,
          stagger: 0.03,
          ease: "power2.out",
        },
      )
    } else if (chevronRef.current) {
      gsap.to(chevronRef.current, {
        rotate: 0,
        duration: 0.2,
        ease: "power2.out",
      })
    }

    const handleFocus = safe(() => {
      if (!triggerRef.current) return
      gsap.to(triggerRef.current, {
        y: -1,
        scale: 1.01,
        boxShadow: "0 0 0 4px rgba(91, 118, 254, 0.14)",
        duration: 0.16,
        ease: "power2.out",
      })
    })

    const handleBlur = safe(() => {
      if (!triggerRef.current || open) return
      gsap.to(triggerRef.current, {
        y: 0,
        scale: 1,
        boxShadow: "0 0 0 0 rgba(91, 118, 254, 0)",
        duration: 0.16,
        ease: "power2.out",
      })
    })

    const triggerEl = triggerRef.current
    triggerEl?.addEventListener("focus", handleFocus)
    triggerEl?.addEventListener("blur", handleBlur)

    return () => {
      triggerEl?.removeEventListener("focus", handleFocus)
      triggerEl?.removeEventListener("blur", handleBlur)
    }
  }, { scope: wrapperRef, dependencies: [open], revertOnUpdate: true })

  const handleToggle = useCallback(() => {
    if (disabled || enabledOptions.length === 0) return
    setOpen((current) => !current)
  }, [disabled, enabledOptions.length])

  const handleSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return

    if (triggerRef.current) {
      gsap.fromTo(triggerRef.current,
        { scale: 1 },
        {
          scale: 1.015,
          duration: 0.12,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        },
      )
    }

    commitSelection(option.value)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [commitSelection])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || enabledOptions.length === 0) return

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        if (!open) setOpen(true)
        moveHighlight(1)
        break
      case "ArrowUp":
        event.preventDefault()
        if (!open) setOpen(true)
        moveHighlight(-1)
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (!open) {
          setOpen(true)
          return
        }
        if (highlightedIndex >= 0) {
          const option = options[highlightedIndex]
          if (option && !option.disabled) handleSelect(option)
        }
        break
      case "Home":
        event.preventDefault()
        setHighlightedIndex(options.findIndex((option) => !option.disabled))
        break
      case "End":
        event.preventDefault()
        setHighlightedIndex([...options].reverse().findIndex((option) => !option.disabled))
        break
      default:
        break
    }
  }, [disabled, enabledOptions.length, highlightedIndex, handleSelect, moveHighlight, open, options])

  const endEnabledIndex = useMemo(() => {
    for (let i = options.length - 1; i >= 0; i -= 1) {
      if (!options[i].disabled) return i
    }
    return -1
  }, [options])

  const triggerLabel = selectedOption?.label ?? placeholder

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key === "End") {
            event.preventDefault()
            setHighlightedIndex(endEnabledIndex)
            return
          }
          handleKeyDown(event)
        }}
        className={cn(
          "relative flex w-full items-center justify-between gap-3 rounded-lg border border-[#e9eaef] bg-white text-left text-[#1c1c1e] transition-colors",
          "focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          sizeClasses[size],
          selectedOption ? "text-[#1c1c1e]" : "text-[#a5a8b5]",
          triggerClassName,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
        <ChevronDown ref={chevronRef} className="h-4 w-4 shrink-0 text-[#888c9e]" />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={cn(
            "absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-[#e9eaef] bg-white",
            "shadow-[0_18px_48px_rgba(28,28,30,0.16)]",
            menuClassName,
          )}
        >
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={selectId}
            className="max-h-64 overflow-y-auto p-2"
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[#888c9e]">{emptyMessage}</div>
            ) : (
              options.map((option, index) => {
                const isSelected = option.value === value
                const isHighlighted = index === highlightedIndex

                return (
                  <button
                    key={option.value}
                    ref={(node) => { optionRefs.current[index] = node }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "select-option flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      isHighlighted ? "bg-[#f5f7ff]" : "bg-white",
                      isSelected ? "text-[#3554f4]" : "text-[#1c1c1e]",
                      option.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-[#f5f7ff]",
                      optionClassName,
                    )}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d9dce5] bg-white">
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#3554f4]" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{option.label}</span>
                      {option.description && (
                        <span className="mt-0.5 block text-xs text-[#777b8c]">{option.description}</span>
                      )}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
