import * as React from "react"
import { cn } from "@/lib/utils"

export type CardTitleProps = React.HTMLAttributes<HTMLDivElement>

export const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"
