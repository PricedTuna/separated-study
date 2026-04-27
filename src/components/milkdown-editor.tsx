// @ts-nocheck
import type { FC } from "react"
import { useEffect, useRef } from "react"
import { Crepe } from "@milkdown/crepe"
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener"
import "@milkdown/crepe/theme/common/style.css"
import "@milkdown/crepe/theme/frame.css"

interface MilkdownEditorProps {
  initialValue?: string
  onChange?: (markdown: string) => void
  className?: string
}

export const MilkdownEditor: FC<MilkdownEditorProps> = ({
  initialValue = "",
  onChange,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!containerRef.current) return

    const crepe = new Crepe({
      root: containerRef.current,
      defaultValue: initialValue,
    })

    crepe.create().then(() => {
      crepe.editor.config((ctx) => {
        ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
          if (onChangeRef.current) {
            onChangeRef.current(markdown)
          }
        })
      })
    })

    return () => {
      crepe.destroy()
    }
  }, [])

  return <div ref={containerRef} className={`${className} w-full h-full`} />
}

export { MilkdownProvider } from "@milkdown/react"