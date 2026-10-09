import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Music, Video, Sparkles, ArrowRight, Play, CheckCircle2,
  Zap, Shield, Search, Clock, Cpu, Layers, MessageSquare, ChevronRight,
  Check, Volume2, Film, ExternalLink, Menu, X
} from 'lucide-react';
import Auth from './Auth';

const SAMPLE_DEMO_ITEMS = [
  {
    id: 'financial',
    title: 'Financial Q3 Highlights',
    query: 'What caused the 14% margin compression in Q3, and what did the CFO say in the earnings call?',
    sources: [
      { name: 'Q3_Financial_Report.pdf', type: 'pdf', ref: 'Page 18' },
      { name: 'Earnings_Call_Debrief.mp3', type: 'audio', ref: '04:12' }
    ],
    answer: `Based on **Q3_Financial_Report.pdf** and the recorded **Earnings_Call_Debrief.mp3**:\n\n1. **Supply Chain Inflation**: Direct hardware freight costs rose by **14.2%** due to expedited air deliveries (Page 18).\n2. **CFO Clarification at [04:12]**: CFO Sarah Jenkins confirmed this margin dip was temporary: *"We incurred one-time expedited freight surcharges during the EMEA warehouse migration, which normalize next quarter."*\n3. **Cross-Doc Consistency**: Both documents corroborate that gross margin will rebound above **68%** in Q4.`,
    activeTimestamp: { seconds: 252, label: '04:12', media: 'Earnings_Call_Debrief.mp3' }
  },
  {
    id: 'keynote',
    title: 'Product Roadmap & Pricing',
    query: 'When does the team announce the self-hosted enterprise tier in the keynote recording?',
    sources: [
      { name: 'Product_Keynote_2024.mp4', type: 'video', ref: '12:45' },
      { name: 'Enterprise_Spec_Sheet.pdf', type: 'pdf', ref: 'Page 4' }
    ],
    answer: `The self-hosted enterprise tier announcement occurs at **[12:45]** in **Product_Keynote_2024.mp4**:\n\n- **Video Citation [12:45]**: Head of Product begins the live demo showing on-premise Docker & Kubernetes deployment scripts.\n- **Enterprise Capabilities**: As cross-referenced with **Enterprise_Spec_Sheet.pdf** (Page 4), it includes custom SSO, air-gapped vector indexing, and SOC2 compliance out of the box.`,
    activeTimestamp: { seconds: 765, label: '12:45', media: 'Product_Keynote_2024.mp4' }
  },
  {
    id: 'interview',
    title: 'Legal vs Verbal Terms',
    query: 'Did the verbal interview agree to the indemnity limits specified in the written contract?',
    sources: [
      { name: 'Master_Services_Agreement.pdf', type: 'pdf', ref: 'Clause 9.2' },
      { name: 'Negotiation_Meeting.mp3', type: 'audio', ref: '19:30' }
    ],
    answer: `**Contradiction Detected**:\n- In **Master_Services_Agreement.pdf** (Clause 9.2), liability is capped at **2x annual contract value**.\n- However, during **Negotiation_Meeting.mp3** at **[19:30]**, the partner verbally requested an uncapped carve-out for IP infringement: *"We require mutual un-capped indemnification for proprietary patent claims."*\n- **Recommendation**: Align the executed addendum with the verbal concession prior to signature.`,
    activeTimestamp: { seconds: 1170, label: '19:30', media: 'Negotiation_Meeting.mp3' }
  }
];

const FEATURES = [
  {
    icon: Zap, color: 'blue',
    title: 'Sub-Second Groq LPU Speed',
    desc: 'Experience blazing-fast AI responses powered by Groq LPUs. Questions are answered within 300–500ms—no frustrating lag.'
  },
  {
    icon: Clock, color: 'indigo',
    title: 'Interactive Clickable Timestamps',
    desc: 'Every statement linked to an exact timestamp like [04:15]. Click it and the built-in media player jumps directly to that second.'
  },
  {
    icon: Layers, color: 'violet',
    title: 'Cross-Doc Contradiction Detection',
    desc: 'Detect discrepancies between written PDF contracts and what was agreed verbally in audio recordings or video meetings.'
  },
  {
    icon: Volume2, color: 'amber',
    title: 'Whisper Speech-to-Text Pipeline',
    desc: 'High-precision transcription with punctuation, speaker segments, and temporal alignment for MP3, WAV, M4A, and MP4.'
  },
  {
    icon: Search, color: 'emerald',
    title: 'Dense Semantic Embeddings',
    desc: 'Queries mapped across vector spaces using state-of-the-art embedding models — finds answers even without exact keyword matches.'
  },
  {
    icon: Shield, color: 'sky',
    title: 'Isolated User Security & JWT',
    desc: 'Each user has a completely isolated document repository. Your files and chats are never shared or used to train foundational models.'
  }
];

const ICON_COLOR_MAP = {
  blue:   { bg: 'bg-blue-900/40',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  indigo: { bg: 'bg-indigo-900/40', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  violet: { bg: 'bg-violet-900/40', text: 'text-violet-400', border: 'border-violet-500/30' },
  amber:  { bg: 'bg-amber-900/40',  text: 'text-amber-400',  border: 'border-amber-500/30' },
  emerald:{ bg: 'bg-emerald-900/40',text: 'text-emerald-400',border: 'border-emerald-500/30' },
  sky:    { bg: 'bg-sky-900/40',    text: 'text-sky-400',    border: 'border-sky-500/30' }
};

export default function LandingPage({ onLoginSuccess }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authIsLogin, setAuthIsLogin] = useState(true);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [simulatedSeek, setSimulatedSeek] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openAuth = (isLogin = true) => {
    setAuthIsLogin(isLogin);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const currentDemo = SAMPLE_DEMO_ITEMS[activeDemoIndex];

  const handleDemoTimestampClick = (ts) => {
    setSimulatedSeek({ seconds: ts.seconds, label: ts.label, media: ts.media, timestamp: Date.now() });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (authModalOpen) setAuthModalOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, mobileMenuOpen]);

  return (
    <div className="min-h-screen text-[#f0f4ff] selection:bg-blue-600 selection:text-white" style={{ background: '#080c14', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-[45%] left-[35%] w-[30%] h-[30%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-blue-900/30" style={{ background: 'rgba(8,12,20,0.9)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs border border-blue-500/40" style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', boxShadow: '0 0 16px rgba(37,99,235,0.4)' }}>
              DM
            </div>
            <span className="text-lg font-black tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Docu<span className="text-blue-500">Mind</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/30" style={{ background: 'rgba(37,99,235,0.12)' }}>AI</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-[#8899bb]">
            {['#interactive-demo', '#features', '#how-it-works', '#comparison'].map((href, i) => (
              <a key={href} href={href} className="hover:text-[#f0f4ff] transition-colors duration-200 relative group">
                {['Demo', 'Features', 'How It Works', 'Comparison'][i]}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => openAuth(true)} className="px-3.5 py-1.5 text-[13px] font-semibold text-[#8899bb] hover:text-[#f0f4ff] transition-colors cursor-pointer">
              Sign In
            </button>
            <button onClick={() => openAuth(false)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer border border-blue-500/50" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}>
              Get Started <ArrowRight size={13} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(v => !v)} className="md:hidden p-2 rounded-xl text-[#8899bb] hover:text-white transition-colors cursor-pointer border border-blue-900/30" style={{ background: 'rgba(15,22,36,0.8)' }}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-900/30 px-6 py-6 space-y-4 animate-fade-up" style={{ background: 'rgba(8,12,20,0.97)' }}>
            {['#interactive-demo', '#features', '#how-it-works', '#comparison'].map((href, i) => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-[#8899bb] hover:text-white transition-colors py-1">
                {['Demo', 'Features', 'How It Works', 'Comparison'][i]}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-blue-900/20">
              <button onClick={() => openAuth(true)} className="w-full py-2.5 rounded-xl text-xs font-bold text-[#f0f4ff] border border-blue-900/40 cursor-pointer" style={{ background: 'rgba(15,22,36,0.9)' }}>Sign In</button>
              <button onClick={() => openAuth(false)} className="w-full py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer border border-blue-500/40" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 max-w-7xl mx-auto px-6 text-center">

        {/* Badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-blue-400 border border-blue-500/30 mb-4 sm:mb-5" style={{ background: 'rgba(37,99,235,0.1)', backdropFilter: 'blur(12px)' }}>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          Multimodal Intelligence: PDF · Audio · Video
          <span className="text-blue-600">|</span>
          <span className="flex items-center gap-1 text-indigo-400 font-extrabold"><Zap size={11} className="fill-indigo-400" /> Groq LPU</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up animate-fade-up-delay-1 text-3xl sm:text-5xl md:text-6xl lg:text-[70px] font-black tracking-tight leading-[1.12] sm:leading-[1.1] max-w-5xl mx-auto py-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Unlock Instant Intelligence from{' '}
          <span className="inline-block" style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Any Media.
          </span>
        </h1>

        {/* Subtext */}
        <p className="animate-fade-up animate-fade-up-delay-2 mt-3.5 sm:mt-4 text-xs sm:text-sm md:text-base text-[#8899bb] max-w-2xl mx-auto leading-relaxed font-normal">
          Stop scrubbing through hours of recordings and skimming dense PDFs.
          DocuMind indexes text, transcribed speech, and video — delivering{' '}
          <span className="text-[#f0f4ff] font-semibold" style={{ textDecoration: 'underline', textDecorationColor: 'rgba(37,99,235,0.5)', textUnderlineOffset: '4px' }}>
            exact clickable timestamps
          </span>{' '}
          in milliseconds.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up animate-fade-up-delay-3 mt-6 sm:mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => openAuth(false)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all hover:scale-[1.03] active:scale-95 cursor-pointer border border-blue-500/50" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 30px rgba(37,99,235,0.35)' }}>
            Start Free Workspace <ArrowRight size={16} />
          </button>
          <a href="#interactive-demo" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-[#f0f4ff] transition-all hover:scale-[1.02] cursor-pointer border border-blue-900/50 hover:border-blue-700/60" style={{ background: 'rgba(15,22,36,0.9)' }}>
            <Play size={14} className="text-blue-400 fill-blue-400" /> Try Interactive Demo
          </a>
        </div>

        {/* Metric Pills */}
        <div className="animate-fade-up animate-fade-up-delay-4 mt-8 sm:mt-9 pt-5 sm:pt-6 border-t border-blue-900/25 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-3xl mx-auto">
          {[
            { stat: '< 500ms', label: 'Groq LPU Speed' },
            { stat: '3-in-1', label: 'PDF · Audio · Video' },
            { stat: 'Whisper', label: 'Word-Level STT' },
            { stat: 'JWT', label: 'Enterprise Auth' }
          ].map(({ stat, label }) => (
            <div key={stat} className="flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-2xl border border-blue-900/30 transition-all hover:border-blue-700/50 hover:-translate-y-0.5" style={{ background: 'rgba(15,22,36,0.8)' }}>
              <span className="text-base sm:text-lg font-black text-blue-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat}</span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8899bb] font-semibold text-center">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section id="interactive-demo" className="relative z-10 py-16 border-y border-blue-900/25" style={{ background: 'rgba(15,22,36,0.6)' }}>
        <div className="max-w-7xl mx-auto px-6">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-up">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/30 mb-4" style={{ background: 'rgba(37,99,235,0.1)' }}>
              Live Product Sandbox
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#f0f4ff] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              See Cross-Referencing in Action
            </h2>
            <p className="text-[#8899bb] text-sm mt-3">
              Click any scenario to see DocuMind query both documents and media — returning answers with live jumpable timestamps.
            </p>
          </div>

          {/* Scenario Tabs */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8">
            {SAMPLE_DEMO_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => { setActiveDemoIndex(idx); setSimulatedSeek(null); }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  activeDemoIndex === idx
                    ? 'text-white border-blue-500/60 scale-[1.02]'
                    : 'text-[#8899bb] border-blue-900/30 hover:text-[#f0f4ff] hover:border-blue-700/40'
                }`}
                style={activeDemoIndex === idx ? { background: 'linear-gradient(135deg, #1e40af, #3730a3)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' } : { background: 'rgba(15,22,36,0.8)' }}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Terminal Sandbox */}
          <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border-shining-dark-blue-neon" style={{ background: '#050810' }}>
            {/* Terminal titlebar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-blue-800/40" style={{ background: 'rgba(5,8,16,0.95)' }}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" style={{ boxShadow: '0 0 8px rgba(239,68,68,0.5)' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" style={{ boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                </div>
                <span className="text-xs font-mono text-blue-400/70">documind-sandbox · v1.2</span>
              </div>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-500/30" style={{ background: 'rgba(16,185,129,0.1)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Groq LPU · 0.32s
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Sources */}
              <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl border border-blue-700/30" style={{ background: 'rgba(15,22,36,0.8)' }}>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Ingested Sources:</span>
                {currentDemo.sources.map((src, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium text-[#f0f4ff] border border-blue-600/40" style={{ background: 'rgba(5,8,16,0.9)', boxShadow: '0 0 10px rgba(37,99,235,0.2)' }}>
                    {src.type === 'pdf'   && <FileText size={12} className="text-rose-400" />}
                    {src.type === 'audio' && <Music size={12} className="text-amber-400" />}
                    {src.type === 'video' && <Video size={12} className="text-blue-400" />}
                    <span>{src.name}</span>
                    <span className="text-blue-400/60 text-[11px]">({src.ref})</span>
                  </div>
                ))}
              </div>

              {/* Chat */}
              <div className="space-y-3.5">
                {/* User */}
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-2xl text-xs sm:text-sm font-medium text-white border border-blue-400/40" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.3)' }}>
                    {currentDemo.query}
                  </div>
                </div>

                {/* Bot */}
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm p-4 sm:p-5 max-w-3xl text-xs sm:text-sm leading-relaxed space-y-2.5 border border-blue-600/40" style={{ background: 'rgba(15,22,36,0.95)', boxShadow: '0 0 30px rgba(37,99,235,0.2)' }}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider pb-1">
                      <Sparkles size={12} /> DocuMind Unified Response
                    </div>
                    <div className="text-[#c8d8f0] whitespace-pre-line text-xs sm:text-sm leading-relaxed">{currentDemo.answer}</div>
                    <div className="pt-2.5 border-t border-blue-800/40 flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-bold text-blue-400">Click to jump in player:</span>
                      <button
                        onClick={() => handleDemoTimestampClick(currentDemo.activeTimestamp)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-blue-200 hover:text-white border border-blue-400/60 transition-all cursor-pointer animate-pulse hover:animate-none"
                        style={{ background: 'rgba(37,99,235,0.25)', boxShadow: '0 0 16px rgba(37,99,235,0.35)' }}
                      >
                        <Play size={10} className="fill-blue-300" />
                        Seek to [{currentDemo.activeTimestamp.label}] in {currentDemo.activeTimestamp.media}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated seek feedback */}
                {simulatedSeek && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-blue-400/60 animate-fade-up" style={{ background: 'rgba(13,26,64,0.7)', boxShadow: '0 0 24px rgba(37,99,235,0.3)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-blue-400/50" style={{ background: 'rgba(37,99,235,0.2)' }}>
                        <Volume2 size={16} className="text-blue-300 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          Synchronized to [{simulatedSeek.label}] <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                        <div className="text-[11px] font-mono text-blue-400 mt-0.5">File: {simulatedSeek.media} · {simulatedSeek.seconds}s offset</div>
                      </div>
                    </div>
                    <div className="w-full sm:w-44 h-2 rounded-full overflow-hidden border border-blue-700/40" style={{ background: 'rgba(5,8,16,0.9)' }}>
                      <div className="h-full w-2/3 rounded-full animate-pulse" style={{ background: 'linear-gradient(90deg, #3b82f6, #818cf8)', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* CTA strip */}
              <div className="pt-4 border-t border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-[#8899bb] font-medium">Ready to upload your own files and experience real-time cross-referencing?</span>
                <button onClick={() => openAuth(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white border border-blue-500/40 cursor-pointer transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                  Upload Your Files Now <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO GRID ── */}
      <section id="features" className="relative z-10 py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14 animate-fade-up">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/30 mb-4" style={{ background: 'rgba(37,99,235,0.1)' }}>
            Engineered for Speed & Depth
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#f0f4ff] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Everything You Need to Interrogate Complex Media
          </h2>
          <p className="text-[#8899bb] text-sm mt-3">
            Built from scratch to overcome the limits of traditional PDF-only assistants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => {
            const c = ICON_COLOR_MAP[color];
            return (
              <div
                key={title}
                className={`group p-6 sm:p-7 rounded-3xl border border-blue-900/30 transition-all duration-300 hover:border-blue-700/50 hover:-translate-y-1.5 animate-fade-up animate-fade-up-delay-${i + 1}`}
                style={{ background: 'rgba(15,22,36,0.8)', boxShadow: '0 0 0 0 transparent' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(37,99,235,0.15)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0 transparent'}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 border ${c.bg} ${c.text} ${c.border} group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#f0f4ff] mb-2 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                <p className="text-[#8899bb] text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative z-10 py-20 border-y border-blue-900/25" style={{ background: 'rgba(15,22,36,0.5)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 animate-fade-up">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/30 mb-4" style={{ background: 'rgba(37,99,235,0.1)' }}>
              Seamless 3-Step Pipeline
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#f0f4ff] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              From Raw Media to Actionable Answers in Seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {/* connector line on desktop */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)' }} />

            {[
              { num: '01', title: 'Ingest Any File', desc: 'Drag & drop PDF contracts, MP3 recordings, podcasts, or MP4 video recordings directly into your workspace library.', foot: <><FileText size={13} className="text-blue-400" /><Music size={13} className="text-amber-400" /><Video size={13} className="text-indigo-400" /><span>Up to 50MB per file</span></>, grad: 'from-blue-600 to-indigo-600', glow: '0 0 20px rgba(37,99,235,0.35)' },
              { num: '02', title: 'Automated Neural Index', desc: 'Whisper transcribes speech with word-level timestamps while documents are chunked and embedded in vector space.', foot: <><CheckCircle2 size={13} className="text-emerald-400" /><span className="text-emerald-400">Zero manual tagging required</span></>, grad: 'from-indigo-600 to-violet-600', glow: '0 0 20px rgba(99,102,241,0.35)' },
              { num: '03', title: 'Ask & Timestamp Seek', desc: 'Ask nuanced questions. DocuMind synthesizes written and spoken facts — citing exact pages and providing clickable video/audio jumps.', foot: <><Play size={12} className="fill-blue-400 text-blue-400" /><span>Click timestamps to seek playback</span></>, grad: 'from-violet-600 to-blue-700', glow: '0 0 20px rgba(139,92,246,0.35)' }
            ].map(({ num, title, desc, foot, grad, glow }, i) => (
              <div key={num} className={`p-6 sm:p-7 rounded-3xl border border-blue-900/30 flex flex-col justify-between animate-fade-up animate-fade-up-delay-${i + 1}`} style={{ background: 'rgba(15,22,36,0.9)' }}>
                <div>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${grad} text-white font-black text-xs flex items-center justify-center mb-5 border border-blue-400/30`} style={{ boxShadow: glow }}>
                    {num}
                  </div>
                  <h3 className="text-lg font-bold text-[#f0f4ff] mb-2 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                  <p className="text-[#8899bb] text-xs sm:text-sm leading-relaxed">{desc}</p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-blue-900/20 flex items-center gap-2 text-xs font-bold text-[#8899bb]">
                  {foot}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section id="comparison" className="relative z-10 py-20 max-w-5xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-up">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/30 mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
            Why DocuMind?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#f0f4ff] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Traditional Document Chatbots vs. DocuMind
          </h2>
        </div>

        <div className="rounded-3xl border-shining-dark-blue-strong overflow-hidden" style={{ background: 'rgba(15,22,36,0.9)' }}>
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-blue-900/30 text-xs font-bold uppercase tracking-wider text-[#8899bb]" style={{ background: 'rgba(22,31,51,0.8)' }}>
                <th className="p-3.5 sm:p-5">Feature / Capability</th>
                <th className="p-3.5 sm:p-5 text-[#8899bb]/60">Typical Document RAG</th>
                <th className="p-3.5 sm:p-5 font-extrabold text-blue-400 border-l border-blue-900/30" style={{ background: 'rgba(13,26,64,0.5)' }}>DocuMind Unified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/20 font-medium">
              {[
                ['Media Support', 'PDF and TXT only', 'PDF, Audio (MP3/WAV) & Video (MP4)'],
                ['Inference Response Time', '8–15 seconds', 'Sub-second (< 500ms) with Groq LPU'],
                ['Audio & Video Seeking', 'Not possible', 'Clickable timestamps jump live player'],
                ['Cross-Modal Synthesis', 'Siloed per document', 'Correlates written contracts with spoken audio'],
                ['History & Audit Trail', 'Lost on tab refresh', 'Persistent conversation & source history']
              ].map(([feat, them, us]) => (
                <tr key={feat} className="hover:bg-blue-900/10 transition-colors">
                  <td className="p-3.5 sm:p-5 font-bold text-[#f0f4ff]">{feat}</td>
                  <td className="p-3.5 sm:p-5 text-[#8899bb]">{them}</td>
                  <td className="p-3.5 sm:p-5 font-bold text-[#f0f4ff] border-l border-blue-900/20" style={{ background: 'rgba(13,26,64,0.35)' }}>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-blue-500 shrink-0" />
                      <span>{us}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative z-10 py-16 md:py-20 max-w-7xl mx-auto px-6">
        <div className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden border border-blue-500/25" style={{ background: 'linear-gradient(135deg, #0a1128, #0d1a40, #080c14)', boxShadow: '0 0 60px rgba(37,99,235,0.2)' }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }} />
          <div className="relative z-10 max-w-3xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-[#f0f4ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ready to Upgrade How You Work with Files & Media?
            </h2>
            <p className="text-[#8899bb] text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Create an account in 10 seconds. Ingest your first PDF, recording, or video lecture immediately.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => openAuth(false)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-[#080c14] transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20" style={{ background: '#f0f4ff', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
                Get Started for Free <ArrowRight size={15} />
              </button>
              <button onClick={() => openAuth(true)} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-[#f0f4ff] border border-blue-700/50 transition-all hover:border-blue-500/70 cursor-pointer" style={{ background: 'rgba(15,22,36,0.8)' }}>
                Sign In to Existing Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-blue-900/25 py-8 text-[#8899bb] text-xs" style={{ background: 'rgba(8,12,20,0.9)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-white text-[11px] border border-blue-500/30" style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}>
              DM
            </div>
            <span className="font-bold text-[#f0f4ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DocuMind</span>
            <span>— Unified Multimodal Intelligence</span>
          </div>
          <div className="flex items-center gap-5 font-semibold">
            <button onClick={() => openAuth(true)} className="hover:text-[#f0f4ff] transition-colors cursor-pointer">Sign In</button>
            <button onClick={() => openAuth(false)} className="hover:text-[#f0f4ff] transition-colors cursor-pointer">Register Free</button>
            <a href="https://github.com/DEVESH1709/DocuMind" target="_blank" rel="noreferrer" className="hover:text-[#f0f4ff] transition-colors flex items-center gap-1">
              GitHub <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </footer>

      {/* ── AUTH MODAL ── */}
      {authModalOpen && (
        <div 
          onClick={() => setAuthModalOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-up cursor-pointer" 
          style={{ background: 'rgba(8,12,20,0.8)' }}
        >
          <div 
            className="relative w-full max-w-md cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <Auth
              initialIsLogin={authIsLogin}
              onLoginSuccess={(token) => { setAuthModalOpen(false); onLoginSuccess(token); }}
              onClose={() => setAuthModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}



