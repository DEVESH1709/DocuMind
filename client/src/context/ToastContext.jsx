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
            case 'success': return 'border-emerald-200 bg-white/95 shadow-emerald-500/10';
            case 'error': return 'border-red-200 bg-white/95 shadow-red-500/10';
            case 'warning': return 'border-amber-200 bg-white/95 shadow-amber-500/10';
            default: return 'border-blue-200 bg-white/95 shadow-blue-500/10';
        }
    };

    return (
        <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${getBorderColor(toast.type)}`}
                    >
                        {getIcon(toast.type)}
                        <div className="flex-1 min-w-0">
                            {toast.title && (
                                <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                                    {toast.title}
                                </h4>
                            )}
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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


