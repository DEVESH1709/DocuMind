import React from 'react';
import { FileText, Music, Video, Info, Loader2, X } from 'lucide-react';

function DocumentLibrary({ files, loading, onDelete }) {
    if (loading && files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-800/20 rounded-2xl border border-white/5">
                <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400">Loading your document library...</p>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-800/20 rounded-2xl border border-white/5 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center mb-4">
                    <FileText size={24} className="text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-300">No documents yet</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                    Upload documents to start analyzing and cross-referencing them.
                </p>
            </div>
        );
    }

    const getIcon = (type) => {
        if (type === 'pdf') return <FileText size={20} className="text-red-400" />;
        if (type === 'audio') return <Music size={20} className="text-blue-400" />;
        if (type === 'video') return <Video size={20} className="text-purple-400" />;
        return <FileText size={20} className="text-slate-400" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Document Library 
                    <span className="text-xs font-normal bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                        {files.length} {files.length === 1 ? 'file' : 'files'}
                    </span>
                </h2>
            </div>

            {files.length > 1 && (
                <div className="relative group overflow-hidden">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center gap-4 bg-slate-800/80 backdrop-blur-xl border border-blue-500/20 p-4 rounded-xl shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="p-2.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <Info size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-400">Multi-Document Analysis Enabled!</h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                                You can now ask questions like <span className="text-blue-300 font-medium italic">"Compare these documents"</span> or <span className="text-blue-300 font-medium italic">"Find contradictions"</span> in the chat.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file, idx) => (
                    <div 
                        key={file._id || idx} 
                        className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-blue-500/30 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-blue-500/5"
                    >
                        <button 
                            onClick={() => onDelete(file._id || file.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-700/50 text-slate-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                            title="Remove document"
                        >
                            <X size={14} />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-slate-700/50 group-hover:scale-110 transition-transform duration-300">
                                {getIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-slate-200 truncate pr-8" title={file.filename}>
                                    {file.filename}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                                    {file.summary || "Processing..."}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                 <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Indexed</span>
                             </div>
                             <button className="text-slate-500 hover:text-blue-400 transition-colors">
                                 <Info size={14} />
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DocumentLibrary;
