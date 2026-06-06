import type { ReactNode } from "react"

export interface PageContainerProps {
  children: ReactNode
}

export const PageContainer = ({ children }: PageContainerProps) => (
  <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 md:px-8 space-y-6">
    {children}
  </div>
)
