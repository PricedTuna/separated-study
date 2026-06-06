import React, { forwardRef } from "react";
import { Crepe, type CrepeConfig } from "@milkdown/crepe";
import { Milkdown, useEditor } from "@milkdown/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

gsap.registerPlugin(useGSAP)

export interface MilkdownEditorProps extends CrepeConfig {
  onChange?: (markdown: string, prevMarkdown: string) => void;
  onAddCard?: (selectedText: string) => void;
}

type SelectionMenuState = {
  top: number;
  left: number;
  visible: boolean;
  selectedText: string;
};

export const MilkdownEditor = forwardRef<{ getMarkdown: () => string }, MilkdownEditorProps>(({ onChange, onAddCard, ...props }, ref) => {
  const crepeRef = React.useRef<Crepe | null>(null)
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const [selectionMenu, setSelectionMenu] = React.useState<SelectionMenuState>({
    top: 0,
    left: 0,
    visible: false,
    selectedText: "",
  })

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      ...props,
    });

    crepeRef.current = crepe

    crepe.on((listener) => {
      listener.markdownUpdated((_, markdown, prevMarkdown) => {
        onChange?.(markdown, prevMarkdown);
      })
    })

    return crepe;
  }, [onChange]);

  React.useEffect(() => {
    const updateSelectionMenu = () => {
      const selection = window.getSelection()
      const wrapper = wrapperRef.current

      if (!selection || !wrapper || selection.rangeCount === 0 || selection.isCollapsed) {
        setSelectionMenu((prev) => (prev.visible ? { ...prev, visible: false, selectedText: "" } : prev))
        return
      }

      const range = selection.getRangeAt(0)
      const editorRoot = wrapper.querySelector('.ProseMirror')
      const commonAncestor = range.commonAncestorContainer
      const isInsideEditor = editorRoot?.contains(
        commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentNode : commonAncestor,
      )
      const selectedText = selection.toString().trim()

      if (!editorRoot || !isInsideEditor || !selectedText) {
        setSelectionMenu((prev) => (prev.visible ? { ...prev, visible: false, selectedText: "" } : prev))
        return
      }

      const rect = range.getBoundingClientRect()
      const wrapperRect = wrapper.getBoundingClientRect()

      if (!rect.width && !rect.height) {
        setSelectionMenu((prev) => (prev.visible ? { ...prev, visible: false, selectedText: "" } : prev))
        return
      }

      setSelectionMenu({
        top: rect.top - wrapperRect.top - 92,
        left: rect.left - wrapperRect.left + rect.width / 2,
        visible: true,
        selectedText,
      })
    }

    document.addEventListener('selectionchange', updateSelectionMenu)
    window.addEventListener('resize', updateSelectionMenu)
    window.addEventListener('scroll', updateSelectionMenu, true)

    return () => {
      document.removeEventListener('selectionchange', updateSelectionMenu)
      window.removeEventListener('resize', updateSelectionMenu)
      window.removeEventListener('scroll', updateSelectionMenu, true)
    }
  }, [])

  useGSAP(() => {
    if (!buttonRef.current) return

    if (selectionMenu.visible) {
      gsap.fromTo(buttonRef.current,
        { autoAlpha: 0, y: 8, scale: 0.92 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.22,
          ease: "power2.out",
        },
      )
    }
  }, { scope: wrapperRef, dependencies: [selectionMenu.visible, selectionMenu.top, selectionMenu.left], revertOnUpdate: true })

  React.useImperativeHandle(ref, () => ({
    getMarkdown: () => crepeRef.current?.getMarkdown() ?? "",
  }), []);

  const handleAddCard = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.96,
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
        onComplete: () => onAddCard?.(selectionMenu.selectedText),
      })
      setSelectionMenu((prev) => ({ ...prev, visible: false }))
      return
    }

    onAddCard?.(selectionMenu.selectedText)
    setSelectionMenu((prev) => ({ ...prev, visible: false }))
  }

  return (
    <div ref={wrapperRef} className="milkdown-editor relative">
      {selectionMenu.visible && (
        <button
          ref={buttonRef}
          type="button"
          className="selection-menu-button"
          style={{
            top: selectionMenu.top,
            left: selectionMenu.left,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleAddCard}
        >
          Agregar tarjeta
        </button>
      )}
      <Milkdown />
    </div>
  );
});
