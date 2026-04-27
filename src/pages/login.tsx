import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    navigate("/dashboard/documents")
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-[#eef0ff] p-12 shrink-0">
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
            Think it.<br />Learn it.<br />Remember it.
          </p>
          <p className="text-[#555a6a] text-[15px] leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            Write markdown documents and create flashcards to study smarter with spaced repetition.
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
              Welcome back
            </h1>
            <p className="text-[#555a6a] text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[#1c1c1e]">Password</label>
                <button type="button" className="text-xs text-[#5b76fe] hover:underline">
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-miro w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-[#555a6a] text-center">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-[#5b76fe] hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}