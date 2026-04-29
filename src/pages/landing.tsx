import { useRef } from "react"
import { Link } from "react-router-dom"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { Brain, FileText, FolderTree, ArrowRight } from "lucide-react"

gsap.registerPlugin(useGSAP)

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Hero Animations
    gsap.from(".hero-text", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
    })

    // Feature Cards Animations
    gsap.from(".feature-card", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
      delay: 0.5,
    })

    // CTA Animation
    gsap.from(".cta-section", {
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 1,
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-[#1c1c1e] font-sans selection:bg-[#5b76fe]/15 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#c7cad5]/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#5b76fe]" />
          <span className="font-medium text-[20px] font-['Roobert_PRO_Medium',sans-serif] tracking-[-0.4px]">
            Spaced Study
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="font-['Roobert_PRO_Medium',sans-serif] text-[17.5px] text-[#1c1c1e] hover:text-[#5b76fe] transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary font-['Roobert_PRO_Medium',sans-serif]">
            Sign up free
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-32 flex flex-col items-center">
          <h1 className="hero-text font-['Roobert_PRO_Medium',sans-serif] text-[56px] md:text-[72px] leading-[1.15] tracking-[-1.68px] mb-6 max-w-4xl">
            Learn better with <span className="text-[#5b76fe]">confidence-based</span> repetition.
          </h1>
          <p className="hero-text text-[22px] text-[#555a6a] max-w-2xl mb-10 leading-[1.35] tracking-[-0.44px]">
            A modern study platform powered by the FSRS algorithm. Create rich markdown documents, generate flashcards, and optimize your memory retention.
          </p>
          <div className="hero-text flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/signup" className="btn-primary text-[17.5px] px-8 py-4 rounded-xl flex items-center gap-2 font-['Roobert_PRO_Medium',sans-serif]">
              Start studying now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-32">
          {/* Feature 1 */}
          <div className="feature-card bg-[#fde0f0] p-8 rounded-[24px] border border-[#c7cad5]/20 hover:shadow-[rgb(224,226,232)_0px_0px_0px_1px] transition-shadow duration-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <FileText className="w-6 h-6 text-[#5b76fe]" />
            </div>
            <h3 className="font-['Roobert_PRO_Medium',sans-serif] text-[24px] mb-3 tracking-[-0.72px]">Rich Documents</h3>
            <p className="text-[16px] text-[#555a6a] leading-[1.5]">
              Write naturally with our Notion-like Milkdown editor. Seamlessly generate study cards directly from your notes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card bg-[#ffe6cd] p-8 rounded-[24px] border border-[#c7cad5]/20 hover:shadow-[rgb(224,226,232)_0px_0px_0px_1px] transition-shadow duration-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <FolderTree className="w-6 h-6 text-[#746019]" />
            </div>
            <h3 className="font-['Roobert_PRO_Medium',sans-serif] text-[24px] mb-3 tracking-[-0.72px]">Organized Decks</h3>
            <p className="text-[16px] text-[#555a6a] leading-[1.5]">
              Structure your knowledge with hierarchical folders and dedicated decks. Keep every subject perfectly categorized.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card bg-[#c3faf5] p-8 rounded-[24px] border border-[#c7cad5]/20 hover:shadow-[rgb(224,226,232)_0px_0px_0px_1px] transition-shadow duration-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Brain className="w-6 h-6 text-[#187574]" />
            </div>
            <h3 className="font-['Roobert_PRO_Medium',sans-serif] text-[24px] mb-3 tracking-[-0.72px]">FSRS Algorithm</h3>
            <p className="text-[16px] text-[#555a6a] leading-[1.5]">
              The Free Spaced Repetition Scheduler optimizes your review intervals to maximize retention and minimize study time.
            </p>
          </div>
        </section>

        {/* FSRS Details Section */}
        <section className="cta-section bg-[#1c1c1e] text-white rounded-[32px] md:rounded-[40px] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h2 className="font-['Roobert_PRO_Medium',sans-serif] text-[40px] md:text-[48px] leading-[1.15] tracking-[-1.44px] mb-6">
              Why FSRS?
            </h2>
            <p className="text-[18px] text-[#a5a8b5] leading-[1.45] mb-6">
              FSRS models human memory using three continuous variables: <strong className="text-white">Difficulty</strong>, <strong className="text-white">Stability</strong>, and <strong className="text-white">Retrievability</strong>. 
            </p>
            <p className="text-[18px] text-[#a5a8b5] leading-[1.45]">
              Unlike older algorithms like SM-2, FSRS adapts to your personal learning curve, ensuring you only study a card when you're about to forget it—keeping your memory target at ~90%.
            </p>
          </div>
          <div className="md:w-1/2 bg-[#2a2a2d] p-8 rounded-[24px] w-full">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#555a6a]/30 pb-4">
                <span className="font-['Roobert_PRO_Medium',sans-serif] text-[#e3c5c5]">Again</span>
                <span className="text-[#a5a8b5] text-sm">Reduces stability significantly</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#555a6a]/30 pb-4">
                <span className="font-['Roobert_PRO_Medium',sans-serif] text-[#ffe6cd]">Hard</span>
                <span className="text-[#a5a8b5] text-sm">Small stability increase</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#555a6a]/30 pb-4">
                <span className="font-['Roobert_PRO_Medium',sans-serif] text-[#00b473]">Good</span>
                <span className="text-[#a5a8b5] text-sm">Normal stability increase</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-['Roobert_PRO_Medium',sans-serif] text-[#5b76fe]">Easy</span>
                <span className="text-[#a5a8b5] text-sm">Large stability increase</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-[#c7cad5]/30 py-8 text-center text-[#555a6a] text-sm">
        <p>© {new Date().getFullYear()} Spaced Study. A modern study tool.</p>
      </footer>
    </div>
  )
}
