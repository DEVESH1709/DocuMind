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
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-2xl shrink-0 ${isDestructive ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {isDestructive ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div className="space-y-1 pr-4">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md cursor-pointer ${
                            isDestructive 
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20 active:scale-95' 
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-95'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
