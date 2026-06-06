import type { ButtonHTMLAttributes, FC, ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

export interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: ReactNode
}

export const BackButton: FC<BackButtonProps> = ({ label, className = "", children, ...props }) => (
  <button
    {...props}
    className={`flex w-fit items-center gap-1.5 text-sm text-[#555a6a] p-1.5 rounded-lg hover:bg-[#f0f1f5] hover:text-[#1c1c1e] transition-colors ${className}`.trim()}
  >
    <ArrowLeft className="w-4 h-4" />
    {label ?? children}
  </button>
)
