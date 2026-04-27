import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

export function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    navigate("/dashboard/documents")
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-[#ffd8f4] p-12 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#5b76fe] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
              <rect x="1" y="1" width="4" height="4" rx="0.5" />
              <rect x="7" y="1" width="4" height="4" rx="0.5" />
              <rect x="1" y="7" width="4" height="4" rx="0.5" />
            </svg>
          </div>
          <span
            className="text-[#1c1c1e] text-[15px] font-medium"
            style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}
          >
            Spaced Study
          </span>
        </div>

        <div className="space-y-4">
          <p
            className="text-[40px] font-medium text-[#1c1c1e] leading-[1.15] tracking-[-1.2px]"
            style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}
          >
            Your second<br />brain starts<br />here.
          </p>
          <p className="text-[#555a6a] text-[15px] leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            Create an account and start building your knowledge base with documents and flashcards.
          </p>
        </div>

        <p className="text-[#a5a8b5] text-xs">© 2026 Spaced Study</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[360px] space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#5b76fe] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <rect x="1" y="1" width="4" height="4" rx="0.5" />
                <rect x="7" y="1" width="4" height="4" rx="0.5" />
                <rect x="1" y="7" width="4" height="4" rx="0.5" />
              </svg>
            </div>
            <span className="text-[#1c1c1e] text-[15px] font-medium" style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}>
              Spaced Study
            </span>
          </div>

          <div>
            <h1
              className="text-[28px] font-medium text-[#1c1c1e] leading-[1.15] tracking-[-0.72px]"
              style={{ fontFamily: "'Roobert PRO Medium', system-ui, sans-serif" }}
            >
              Create an account
            </h1>
            <p className="text-[#555a6a] text-sm mt-1">Start your spaced study journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-[#1c1c1e]">Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-miro w-full text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#1c1c1e]">Email</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-miro w-full text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#1c1c1e]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-miro w-full text-sm"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#c7cad5] accent-[#5b76fe]"
              />
              <label htmlFor="terms" className="text-sm text-[#555a6a] leading-snug cursor-pointer">
                I agree to the{" "}
                <span className="text-[#5b76fe] hover:underline cursor-pointer">Terms of Service</span>
                {" "}and{" "}
                <span className="text-[#5b76fe] hover:underline cursor-pointer">Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-[#555a6a] text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#5b76fe] hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}