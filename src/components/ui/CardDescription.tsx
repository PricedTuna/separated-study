import * as React from "react"
import { cn } from "@/lib/utils"

export type CardDescriptionProps = React.HTMLAttributes<HTMLDivElement>

export const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"
