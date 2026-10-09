import React from 'react';
import { X, Sparkles, Cpu, Mic, ShieldCheck, Layers } from 'lucide-react';

function ProModal({ isOpen, onClose, totalFiles = 0 }) {
    if (!isOpen) return null;

    const features = [
        {
            icon: <Cpu className="text-blue-600" size={20} />,
            title: "Groq LPU Acceleration",
            desc: "Sub-second inference using openai/gpt-oss-120b with auto-fallback to Qwen 3.8."
        },
        {
            icon: <Mic className="text-indigo-600" size={20} />,
            title: "Local Whisper STT Engine",
            desc: "Zero-cost, private audio & video transcription with exact timestamp generation."
        },
        {
            icon: <Layers className="text-purple-600" size={20} />,
            title: "Multi-Document Cross-Referencing",
            desc: "Simultaneous analysis across multiple PDFs and multimedia files with contradiction detection."
        },
        {
            icon: <ShieldCheck className="text-emerald-600" size={20} />,
            title: "Enterprise JWT & Argon2 Security",
            desc: "Cryptographically hashed credentials with stateless OAuth2 token lifecycle."
        }
    ];

    const systemStatus = [
        { name: "Backend API (FastAPI)", status: "Online 200 OK" },
        { name: "Database (MongoDB Motor)", status: "Connected" },
        { name: "Rate Limiter (Redis)", status: "Active (5 req/min)" },
        { name: "Speech Processor (FFmpeg)", status: "Installed" }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050810]/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-2xl rounded-3xl shadow-2xl border-shining-dark-blue-strong overflow-hidden animate-in zoom-in-95 duration-200"
                style={{ background: '#0f1624' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Banner */}
                <div className="relative p-6 sm:p-8 text-white border-b border-blue-900/40" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.8), rgba(79,70,229,0.8))' }}>
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/20"
                        style={{ background: 'rgba(22,31,51,0.4)' }}
                        title="Close"
                    >
                        <X size={18} />
                    </button>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-white/30" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                        <Sparkles size={12} className="text-blue-300" />
                        Pro Workspace Active
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        DocuMind Intelligence Suite
                    </h2>
                    <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-lg">
                        You are running on the Pro-tier workspace with unlimited local audio processing and accelerated cloud reasoning.
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-7 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                        <div className="p-3 rounded-2xl border border-blue-500/30" style={{ background: 'rgba(37,99,235,0.1)' }}>
                            <span className="text-xl font-black text-blue-400">{totalFiles}</span>
                            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8899bb] mt-0.5">Files Indexed</p>
                        </div>
                        <div className="p-3 rounded-2xl border border-indigo-500/30" style={{ background: 'rgba(99,102,241,0.1)' }}>
                            <span className="text-xl font-black text-indigo-400">Sub-1s</span>
                            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8899bb] mt-0.5">Inference Speed</p>
                        </div>
                        <div className="p-3 rounded-2xl border border-emerald-500/30" style={{ background: 'rgba(16,185,129,0.1)' }}>
                            <span className="text-xl font-black text-emerald-400">100%</span>
                            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8899bb] mt-0.5">System Health</p>
                        </div>
                    </div>

                    {/* Features List */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#8899bb] mb-2.5">Active Pro Capabilities</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {features.map((feat, idx) => (
                                <div key={idx} className="p-3 rounded-2xl border-shining-dark-blue-subtle hover:border-blue-500/50 transition-all flex items-start gap-2.5" style={{ background: 'rgba(22,31,51,0.6)' }}>
                                    <div className="p-1.5 rounded-xl shrink-0 border border-blue-900/40" style={{ background: 'rgba(8,12,20,0.8)' }}>
                                        {React.cloneElement(feat.icon, { className: 'text-blue-400', size: 16 })}
                                    </div>
                                    <div>
                                        <h5 className="text-xs sm:text-sm font-bold text-[#f0f4ff]">{feat.title}</h5>
                                        <p className="text-xs text-[#8899bb] mt-0.5 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Status Table */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#8899bb] mb-2.5">Live Service Status</h4>
                        <div className="space-y-1.5 rounded-2xl p-3.5 border border-blue-900/40" style={{ background: 'rgba(22,31,51,0.6)' }}>
                            {systemStatus.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                                    <span className="font-semibold text-[#c8d8f0]">{item.name}</span>
                                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5 border-t border-blue-900/40 flex items-center justify-between" style={{ background: 'rgba(8,12,20,0.8)' }}>
                    <span className="text-xs font-medium text-[#8899bb]">Tier: <strong className="text-[#f0f4ff]">DocuMind Pro (Enterprise Demo)</strong></span>
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white border border-blue-500/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 15px rgba(37,99,235,0.3)' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProModal;


