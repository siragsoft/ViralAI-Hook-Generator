import { useState, useEffect, FormEvent } from 'react';
import { Zap, TrendingUp, Copy, CheckCircle2, Lock, Flame, Share2 } from 'lucide-react';

interface HookResult {
  hook: string;
  psychology: string;
  viralScore: number;
}

export default function App() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<HookResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Monetization State
  const [credits, setCredits] = useState<number>(2);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCrypto, setShowCrypto] = useState(false);

  useEffect(() => {
    fetch('/api/credits')
      .then(res => res.json())
      .then(data => setCredits(data.credits))
      .catch(err => console.error("Failed to fetch credits:", err));
  }, []);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    if (credits <= 0) {
      setShowPaywall(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform })
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === "Out of credits") {
          setShowPaywall(true);
        }
        throw new Error(error.error || "Generation failed");
      }

      const data = await response.json();
      setResults(data.results);
      setCredits(data.credits);
    } catch (error) {
      console.error("Error generating hooks:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const shareOnX = () => {
    const text = encodeURIComponent("I'm using ViralAI to generate scroll-stopping hooks for my videos. Try it for free: ");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brutal brutal-border p-8 max-w-md w-full relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-neon rounded-full flex items-center justify-center brutal-shadow-white">
                <Lock className="text-brutal" size={32} />
              </div>
            </div>
            <h2 className="font-display text-4xl text-center mb-2">OUT OF FREE CREDITS</h2>
            <p className="text-gray-400 text-center mb-8">You've used all your free generations. Upgrade to PRO to keep going viral and unlock full scripts.</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3"><CheckCircle2 className="text-neon" size={20}/> <span className="font-bold">Unlimited Viral Hooks</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="text-neon" size={20}/> <span className="font-bold">Full Video Script Generation</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="text-neon" size={20}/> <span className="font-bold">Competitor Trend Analysis</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="text-neon" size={20}/> <span className="font-bold">Priority AI Processing</span></div>
            </div>

            <div className="flex flex-col gap-4">
              <a 
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=mahamustafa1968@hotmail.com&item_name=ViralAI%20Pro%20Lifetime%20Access&amount=9.99&currency_code=USD" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#0079C1] text-white font-display text-2xl py-4 text-center brutal-shadow-white hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
              >
                PAY $9.99 WITH PAYPAL
              </a>
              
              <button 
                onClick={() => setShowCrypto(!showCrypto)}
                className="block w-full bg-zinc-800 text-white font-display text-2xl py-4 text-center brutal-shadow-white hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
              >
                PAY $9.99 WITH CRYPTO
              </button>

              {showCrypto && (
                <div className="bg-black p-4 border-2 border-zinc-700 text-sm text-left space-y-3 mt-2">
                  <p className="text-neon font-bold mb-2 uppercase tracking-widest">Send exactly $9.99 to:</p>
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-widest">BTC (Bitcoin)</span>
                    <code className="text-white select-all block bg-zinc-900 p-2 mt-1">14PyqTJWHNLfHA9Vup9TdfPPMArdP2WLPi</code>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-widest">ETH / USDT (ERC-20)</span>
                    <code className="text-white select-all block bg-zinc-900 p-2 mt-1">0xd696ee0ff589881938839c716d64ec929b054e61</code>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-widest">SOL (Solana)</span>
                    <code className="text-white select-all block bg-zinc-900 p-2 mt-1">5UMGwP9fPCd6PZ7tByruB4vAEs7XwKfd1Ktgz6Diz5BC</code>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 border-t border-zinc-800 pt-2">
                    After payment, email <strong className="text-white">mahamustafa1968@hotmail.com</strong> with your transaction hash to activate your account.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Marquee Header */}
      <div className="bg-neon text-brutal overflow-hidden py-2 border-b-2 border-white flex justify-between items-center">
        <div className="marquee-track whitespace-nowrap font-display text-xl tracking-wider flex-1">
          <span className="mx-4">🔥 VIRAL HOOK GENERATOR</span>
          <span className="mx-4">///</span>
          <span className="mx-4">STOP THE SCROLL</span>
          <span className="mx-4">///</span>
          <span className="mx-4">10X YOUR ENGAGEMENT</span>
          <span className="mx-4">///</span>
          <span className="mx-4">🔥 VIRAL HOOK GENERATOR</span>
          <span className="mx-4">///</span>
          <span className="mx-4">STOP THE SCROLL</span>
          <span className="mx-4">///</span>
          <span className="mx-4">10X YOUR ENGAGEMENT</span>
          <span className="mx-4">///</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="border-b-2 border-white p-4 flex justify-between items-center bg-brutal">
        <div className="font-display text-2xl tracking-widest text-white">VIRAL<span className="text-neon">AI</span></div>
        <div className="flex items-center gap-4">
          <button 
            onClick={shareOnX}
            className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-white/20 px-3 py-2 hover:bg-white/10 transition-colors"
          >
            <Share2 size={14} /> Share Tool
          </button>
          <div className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} className="text-neon" /> 
            {credits} Free Credits
          </div>
          <button 
            onClick={() => setShowPaywall(true)}
            className="bg-white text-brutal px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-neon transition-colors"
          >
            Upgrade PRO
          </button>
        </div>
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column - Controls */}
        <div className="p-8 lg:p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <h1 className="font-display text-6xl lg:text-8xl leading-none mb-6">
              GO <span className="text-neon">VIRAL.</span><br/>
              ON DEMAND.
            </h1>
            <p className="text-gray-400 mb-10 text-lg">
              Stop guessing what works. Use AI trained on millions of viral videos to generate hooks that guarantee attention.
            </p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Target Platform</label>
                <div className="grid grid-cols-3 gap-4">
                  {['TikTok', 'Instagram', 'YouTube'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`py-3 px-4 text-sm font-bold uppercase transition-all brutal-border ${
                        platform === p ? 'bg-neon text-brutal brutal-shadow-white translate-y-[-2px] translate-x-[-2px]' : 'bg-transparent hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">What is your video about?</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 3 psychological tricks to make anyone like you instantly..."
                  className="w-full bg-transparent brutal-border p-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon h-32 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !topic}
                className="w-full bg-neon text-brutal font-display text-2xl py-4 brutal-shadow-white hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <span className="animate-pulse">ANALYZING TRENDS...</span>
                ) : (
                  <>
                    GENERATE HOOKS <Zap size={24} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="p-8 lg:p-12 bg-white/5 flex flex-col">
          <div className="max-w-xl w-full mx-auto flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-white/20">
              <h2 className="font-display text-3xl">YOUR HOOKS</h2>
              <TrendingUp className="text-neon" size={32} />
            </div>

            {results.length === 0 && !isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-24 h-24 border-4 border-dashed border-white rounded-full flex items-center justify-center mb-6">
                  <Zap size={40} />
                </div>
                <p className="text-xl font-bold uppercase tracking-widest">Awaiting Input</p>
                <p className="text-sm mt-2">Enter your topic to generate viral hooks.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="bg-brutal brutal-border p-6 relative group">
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-neon text-brutal font-display flex items-center justify-center text-xl brutal-border-neon">
                      {index + 1}
                    </div>
                    
                    <div className="flex justify-between items-start mb-4 pt-2">
                      <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-2 py-1 text-neon">
                        {result.psychology}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 text-white">
                        <Flame size={14} className="text-orange-500" /> Score: {result.viralScore}/100
                      </span>
                    </div>

                    <p className="text-xl leading-relaxed font-semibold">"{result.hook}"</p>
                    
                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={() => copyToClipboard(result.hook, index)}
                        className="flex-1 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest bg-white text-brutal py-3 hover:bg-gray-200 transition-colors"
                      >
                        {copiedIndex === index ? (
                          <><CheckCircle2 size={16} /> Copied!</>
                        ) : (
                          <><Copy size={16} /> Copy Hook</>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowPaywall(true)}
                        className="flex-1 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest border-2 border-neon text-neon hover:bg-neon hover:text-brutal transition-colors"
                      >
                        <Lock size={16} /> Full Script
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Benefits Section */}
      <section className="bg-white text-brutal p-12 lg:p-24 border-t-4 border-brutal">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-5xl lg:text-7xl mb-16 tracking-tighter uppercase leading-none">
            Why <span className="text-neon bg-brutal px-4">ViralAI?</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="brutal-border p-8 bg-white hover:translate-y-[-8px] hover:translate-x-[-8px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-12 h-12 bg-neon brutal-border flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="font-display text-2xl mb-4 uppercase">Psychology-Backed</h3>
              <p className="text-sm font-medium leading-relaxed">
                We don't just give you a script; we tell you why it works. Every hook comes with the exact psychological trigger it uses like "Curiosity Gap" or "FOMO".
              </p>
            </div>

            <div className="brutal-border p-8 bg-white hover:translate-y-[-8px] hover:translate-x-[-8px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-12 h-12 bg-neon brutal-border flex items-center justify-center mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="font-display text-2xl mb-4 uppercase">Predictive Scoring</h3>
              <p className="text-sm font-medium leading-relaxed">
                Know your chances before you hit record. Every hook includes a predicted Viral Score based on millions of data points from current trends.
              </p>
            </div>

            <div className="brutal-border p-8 bg-white hover:translate-y-[-8px] hover:translate-x-[-8px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-12 h-12 bg-neon brutal-border flex items-center justify-center mb-6">
                <Flame size={24} />
              </div>
              <h3 className="font-display text-2xl mb-4 uppercase">Platform Optimized</h3>
              <p className="text-sm font-medium leading-relaxed">
                Whether you're on TikTok, Reels, or Shorts, our AI tailors the pacing and tone to the specific platform's algorithm.
              </p>
            </div>

            <div className="brutal-border p-8 bg-white hover:translate-y-[-8px] hover:translate-x-[-8px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-12 h-12 bg-neon brutal-border flex items-center justify-center mb-6">
                <Copy size={24} />
              </div>
              <h3 className="font-display text-2xl mb-4 uppercase">Zero Friction</h3>
              <p className="text-sm font-medium leading-relaxed">
                Generate, click to copy, and paste directly into your script. No fluff, just high-converting hooks in seconds.
              </p>
            </div>

            <div className="brutal-border p-8 bg-white hover:translate-y-[-8px] hover:translate-x-[-8px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-12 h-12 bg-neon brutal-border flex items-center justify-center mb-6">
                <Lock size={24} />
              </div>
              <h3 className="font-display text-2xl mb-4 uppercase">Secure & Private</h3>
              <p className="text-sm font-medium leading-relaxed">
                Your video topics and generated scripts are processed securely. No one else gets your unique viral angles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brutal text-white p-12 border-t-4 border-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="font-display text-4xl tracking-widest mb-6">VIRAL<span className="text-neon">AI</span></div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              ViralAI is the ultimate cheat code for content creators. Stop guessing what works and start going viral on demand with psychology-backed hooks.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-center">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">© 2026 ViralAI Hook Generator</div>
            <div className="flex gap-6">
              <a href="#" className="text-sm font-bold uppercase hover:text-neon transition-colors">Terms</a>
              <a href="#" className="text-sm font-bold uppercase hover:text-neon transition-colors">Privacy</a>
              <a href="mailto:mahamustafa1968@hotmail.com" className="text-sm font-bold uppercase hover:text-neon transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
