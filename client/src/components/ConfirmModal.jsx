import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    isDestructive = true
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#050810]/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-md rounded-3xl shadow-2xl border-shining-dark-blue-strong p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200"
                style={{ background: '#0f1624' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-1.5 rounded-xl text-[#8899bb] hover:text-[#f0f4ff] hover:bg-white/10 transition-colors cursor-pointer border border-blue-900/40"
                    style={{ background: 'rgba(22,31,51,0.6)' }}
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-2xl shrink-0 ${isDestructive ? 'text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-blue-400 border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.2)]'}`} style={isDestructive ? { background: 'rgba(239,68,68,0.1)' } : { background: 'rgba(37,99,235,0.1)' }}>
                        {isDestructive ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div className="space-y-1 pr-4">
                        <h3 className="text-base sm:text-lg font-bold text-[#f0f4ff] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#8899bb] leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 mt-5 pt-3.5 border-t border-blue-900/40">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold text-[#8899bb] hover:text-[#f0f4ff] hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-bold text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer ${
                            isDestructive 
                                ? 'border border-red-500/50 hover:brightness-110 active:scale-95' 
                                : 'border border-blue-500/50 hover:brightness-110 active:scale-95'
                        }`}
                        style={isDestructive ? { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' } : { background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;



