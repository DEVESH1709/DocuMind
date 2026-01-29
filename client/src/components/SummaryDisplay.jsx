import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

function SummaryDisplay({ summary }) {
    if (!summary) return null;

    return (
        <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText size={120} />
            </div>

            <h3 className="text-lg font-bold mb-4 text-slate-100 flex items-center gap-2 relative z-10">
                <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/30">
                    <Sparkles size={18} />
                </div>
                AI Summary
            </h3>

            <div className="prose prose-invert prose-sm max-w-none text-slate-300 relative z-10 leading-relaxed">
                {summary.split('\n').map((line, i) => (
                    <p key={i} className="mb-3 last:mb-0">{line}</p>
                ))}
            </div>
        </div>
    );
}

export default SummaryDisplay;
