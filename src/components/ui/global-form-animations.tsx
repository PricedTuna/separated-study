import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

const GLOBAL_FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([data-no-gsap-focus="true"])',
  'textarea:not([data-no-gsap-focus="true"])',
  'select:not([data-no-gsap-focus="true"])',
  '[data-gsap-focus="true"]',
].join(', ')

export function GlobalFormAnimations() {
  const scopeRef = useRef<HTMLDivElement | null>(null)

  useGSAP((_, contextSafe) => {
    const safe = contextSafe ?? ((fn: (event: Event) => void) => fn)

    const handleFocusIn = safe((event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.matches(GLOBAL_FIELD_SELECTOR)) return
      if (target.dataset.gsapActiveFocus === "true") return

      target.dataset.gsapActiveFocus = "true"
      gsap.killTweensOf(target)
      gsap.set(target, { transformOrigin: "50% 50%" })
      gsap.to(target, {
        y: -1,
        scale: 1.005,
        borderColor: "#5b76fe",
        boxShadow: "0 0 0 4px rgba(91, 118, 254, 0.12)",
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      })
    })

    const handleFocusOut = safe((event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.matches(GLOBAL_FIELD_SELECTOR)) return

      target.dataset.gsapActiveFocus = "false"
      gsap.killTweensOf(target)
      gsap.to(target, {
        y: 0,
        scale: 1,
        borderColor: target.classList.contains("input-miro") ? "#e9eaef" : "transparent",
        boxShadow: "0 0 0 0 rgba(91, 118, 254, 0)",
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      })
    })

    document.addEventListener("focusin", handleFocusIn)
    document.addEventListener("focusout", handleFocusOut)

    return () => {
      document.removeEventListener("focusin", handleFocusIn)
      document.removeEventListener("focusout", handleFocusOut)
    }
  }, { scope: scopeRef })

  return <div ref={scopeRef} aria-hidden="true" />
}
