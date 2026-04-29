import type { ButtonHTMLAttributes, FC, ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: ReactNode
}

export const BackButton: FC<BackButtonProps> = ({ label, className = "", children, ...props }) => (
  <button
    {...props}
    className={`btn-secondary flex w-fit items-center gap-1.5 text-sm ${className}`.trim()}
  >
    <ArrowLeft className="w-4 h-4" />
    {label ?? children}
  </button>
)
