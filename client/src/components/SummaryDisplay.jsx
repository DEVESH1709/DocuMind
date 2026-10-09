import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

function SummaryDisplay({ summary }) {
    if (!summary) return null;

    return (
        <div className="p-5 sm:p-6 rounded-3xl border-shining-dark-blue relative overflow-hidden group transition-all duration-300" style={{ background: '#0f1624' }}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none text-blue-400">
                <FileText size={100} />
            </div>

            <h3 className="text-base sm:text-lg font-bold mb-3 text-[#f0f4ff] flex items-center gap-2 relative z-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="p-1.5 rounded-xl border border-blue-500/30 text-blue-400" style={{ background: 'rgba(37,99,235,0.15)' }}>
                    <Sparkles size={16} />
                </div>
                AI Summary
            </h3>

            <div className="text-xs sm:text-sm text-[#8899bb] relative z-10 leading-relaxed space-y-2">
                {summary.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>
        </div>
    );
}

export default SummaryDisplay;



