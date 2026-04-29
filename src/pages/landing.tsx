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

        {/* FSRS Explanation Section */}
        <section className="fsrs-section mb-32">
          <div className="text-center mb-16">
            <h2 className="font-['Roobert_PRO_Medium',sans-serif] text-[40px] md:text-[56px] leading-[1.15] tracking-[-1.44px] mb-6">
              The Science of Memory: <span className="text-[#5b76fe]">FSRS</span>
            </h2>
            <p className="text-[20px] text-[#555a6a] max-w-3xl mx-auto leading-[1.45] tracking-[-0.4px]">
              FSRS (Free Spaced Repetition Scheduler) is a modern algorithm that models human memory using three continuous variables to optimize your study time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Variable: Difficulty */}
            <div className="feature-card bg-white p-8 rounded-[24px] border border-[#c7cad5] shadow-sm">
              <div className="text-[12px] font-['Roobert_PRO_Medium',sans-serif] uppercase tracking-wider text-[#5b76fe] mb-2">Variable D</div>
              <h3 className="font-['Roobert_PRO_Medium',sans-serif] text-[24px] mb-4 tracking-[-0.72px]">Difficulty</h3>
              <p className="text-[16px] text-[#555a6a] leading-[1.5]">
                Represents how inherently hard a card is. It adjusts based on your performance—increasing when you struggle and decreasing when you succeed easily.
              </p>
            </div>

            {/* Variable: Stability */}
            <div className="feature-card bg-white p-8 rounded-[24px] border border-[#c7cad5] shadow-sm">
              <div className="text-[12px] font-['Roobert_PRO_Medium',sans-serif] uppercase tracking-wider text-[#00b473] mb-2">Variable S</div>
              <h3 className="font-['Roobert_PRO_Medium',sans-serif] text-[24px] mb-4 tracking-[-0.72px]">Stability</h3>
              <p className="text-[16px] text-[#555a6a] leading-[1.5]">
                How long a memory is expected to last. Stability increases with every successful review, allowing for longer intervals between study sessions.
              </p>
            </div>

            {/* Variable: Retrievability */}
            <div className="feature-card bg-white p-8 rounded-[24px] border border-[#c7cad5] shadow-sm">
              <div className="text-[12px] font-['Roobert_PRO_Medium',sans-serif] uppercase tracking-wider text-[#e3c5c5] mb-2">Variable R</div>
              <h3 className="font-['Roobert_PRO_Medium',sans-serif] text-[24px] mb-4 tracking-[-0.72px]">Retrievability</h3>
              <p className="text-[16px] text-[#555a6a] leading-[1.5]">
                The probability of recalling a card at a given time. Our goal is to review cards when R is ~90%—the "forgetting threshold."
              </p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] text-white rounded-[32px] md:rounded-[40px] p-8 md:p-16 overflow-hidden relative">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <h3 className="font-['Roobert_PRO_Medium',sans-serif] text-[32px] mb-6 tracking-[-0.8px]">The Fundamental Relationship</h3>
                <p className="text-[18px] text-[#a5a8b5] leading-[1.5] mb-8">
                  FSRS calculates your probability of recall using an exponential decay function. This allows for precision that legacy algorithms like SM-2 simply can't match.
                </p>
                <div className="bg-[#2a2a2d] p-6 rounded-2xl font-mono text-[20px] text-[#5b76fe] flex items-center justify-center border border-[#555a6a]/30">
                  R(t) = exp(-t / S)
                </div>
                <p className="mt-4 text-[14px] text-[#555a6a] italic">Where t is days since last review and S is stability.</p>
              </div>

              <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
                <div className="bg-[#2a2a2d] p-6 rounded-[24px] border border-[#555a6a]/30">
                  <div className="text-[#e3c5c5] font-['Roobert_PRO_Medium',sans-serif] text-[20px] mb-2">Again</div>
                  <div className="text-[14px] text-[#a5a8b5]">Stability drops significantly. Difficulty increases.</div>
                </div>
                <div className="bg-[#2a2a2d] p-6 rounded-[24px] border border-[#555a6a]/30">
                  <div className="text-[#ffe6cd] font-['Roobert_PRO_Medium',sans-serif] text-[20px] mb-2">Hard</div>
                  <div className="text-[14px] text-[#a5a8b5]">Small stability increase. Slight difficulty rise.</div>
                </div>
                <div className="bg-[#2a2a2d] p-6 rounded-[24px] border border-[#555a6a]/30">
                  <div className="text-[#00b473] font-['Roobert_PRO_Medium',sans-serif] text-[20px] mb-2">Good</div>
                  <div className="text-[14px] text-[#a5a8b5]">Optimal stability boost. Difficulty stabilizes.</div>
                </div>
                <div className="bg-[#2a2a2d] p-6 rounded-[24px] border border-[#555a6a]/30">
                  <div className="text-[#5b76fe] font-['Roobert_PRO_Medium',sans-serif] text-[20px] mb-2">Easy</div>
                  <div className="text-[14px] text-[#a5a8b5]">Large stability jump. Difficulty decreases.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
             <div>
               <h3 className="font-['Roobert_PRO_Medium',sans-serif] text-[28px] mb-6 tracking-[-0.6px]">Better than Anki Default</h3>
               <p className="text-[#555a6a] mb-4">
                 Traditional algorithms like SM-2 use fixed multipliers. FSRS is a <strong>trainable</strong> model that adapts to how you specifically learn each piece of information.
               </p>
               <ul className="space-y-3">
                 <li className="flex items-center gap-3 text-[#1c1c1e] font-medium">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#5b76fe]"></div>
                   Reduces study load by 20-30%
                 </li>
                 <li className="flex items-center gap-3 text-[#1c1c1e] font-medium">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#5b76fe]"></div>
                   Higher retention with less effort
                 </li>
                 <li className="flex items-center gap-3 text-[#1c1c1e] font-medium">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#5b76fe]"></div>
                   Scientific basis: Ebbinghaus Forgetting Curve
                 </li>
               </ul>
             </div>
             <div className="bg-[#f0f1f5] p-8 rounded-[24px] border border-[#c7cad5]/50">
               <h4 className="font-['Roobert_PRO_Medium',sans-serif] text-[18px] mb-4">Scientific Roots</h4>
               <p className="text-[14px] text-[#555a6a] leading-[1.6]">
                 FSRS is built on decades of cognitive science, from Hermann Ebbinghaus's early research on the forgetting curve to modern work by Cepeda et al. (2006) and Settles & Meeder (2016). It represents the state-of-the-art in distributed practice optimization.
               </p>
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
