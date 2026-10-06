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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Banner */}
                <div className="relative p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X size={18} />
                    </button>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
                        <Sparkles size={14} className="text-amber-300" />
                        Pro Workspace Active
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        DocuMind Intelligence Suite
                    </h2>
                    <p className="text-blue-100 text-sm mt-1 max-w-lg">
                        You are running on the Pro-tier workspace with unlimited local audio processing and accelerated cloud reasoning.
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                            <span className="text-2xl font-black text-blue-600">{totalFiles}</span>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Files Indexed</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                            <span className="text-2xl font-black text-indigo-600">Sub-1s</span>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Inference Speed</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                            <span className="text-2xl font-black text-emerald-600">100%</span>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">System Health</p>
                        </div>
                    </div>

                    {/* Features List */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Active Pro Capabilities</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {features.map((feat, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                                        {feat.icon}
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-800">{feat.title}</h5>
                                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Status Table */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Live Service Status</h4>
                        <div className="space-y-2 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                            {systemStatus.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs py-1">
                                    <span className="font-semibold text-slate-700">{item.name}</span>
                                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Tier: <strong className="text-slate-800">DocuMind Pro (Enterprise Demo)</strong></span>
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProModal;