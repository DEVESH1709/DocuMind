import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
        const id = Date.now() + Math.random().toString(36).substr(2, 5);
        setToasts((prev) => [...prev, { id, type, title, message }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback((message, title = 'Success') => {
        addToast({ type: 'success', title, message });
    }, [addToast]);

    const error = useCallback((message, title = 'Error') => {
        addToast({ type: 'error', title, message, duration: 6000 });
    }, [addToast]);

    const info = useCallback((message, title = 'Notice') => {
        addToast({ type: 'info', title, message });
    }, [addToast]);

    const warning = useCallback((message, title = 'Warning') => {
        addToast({ type: 'warning', title, message, duration: 5000 });
    }, [addToast]);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />;
            case 'error':
                return <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />;
            case 'warning':
                return <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />;
            default:
                return <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />;
        }
    };

    const getBorderColor = (type) => {
        switch (type) {
            case 'success': return 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-[#0d1a18]/95';
            case 'error': return 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-[#1c0f14]/95';
            case 'warning': return 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-[#1a160d]/95';
            default: return 'border-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.2)] bg-[#0f1624]/95';
        }
    };

    return (
        <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
            {children}
            
            {/* Toast Container - Positioned at Top Right so it never covers chat input */}
            <div className="fixed top-4 sm:top-5 right-3 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-[calc(100vw-24px)] sm:max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${getBorderColor(toast.type)}`}
                        style={{ backdropFilter: 'blur(16px)' }}
                    >
                        {getIcon(toast.type)}
                        <div className="flex-1 min-w-0">
                            {toast.title && (
                                <h4 className="text-xs sm:text-sm font-bold text-[#f0f4ff] tracking-tight leading-none mb-1">
                                    {toast.title}
                                </h4>
                            )}
                            <p className="text-xs sm:text-[13px] text-[#c8d8f0] leading-relaxed font-normal break-words">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-[#8899bb] hover:text-[#f0f4ff] transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
                            title="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}


