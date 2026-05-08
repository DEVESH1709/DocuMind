import React from 'react';
import { FileText, Music, Video, Info, Loader2, X } from 'lucide-react';

function DocumentLibrary({ files, loading, onDelete }) {
    if (loading && files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-blue-50 shadow-xl shadow-blue-900/5">
                <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Preparing your library...</p>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-blue-50 shadow-xl shadow-blue-900/5 text-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
                    <FileText size={32} className="text-blue-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Your library is empty</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                    Upload documents above to start your AI-powered analysis.
                </p>
            </div>
        );
    }

    const getIcon = (type) => {
        if (type === 'pdf') return <FileText size={24} className="text-red-500" />;
        if (type === 'audio') return <Music size={24} className="text-blue-600" />;
        if (type === 'video') return <Video size={24} className="text-indigo-600" />;
        return <FileText size={24} className="text-slate-400" />;
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Document Library</h2>
                    <p className="text-sm text-slate-500">Manage and explore your knowledge base</p>
                </div>
                <div className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-600/20">
                    {files.length} {files.length === 1 ? 'File' : 'Files'}
                </div>
            </div>

            {files.length > 1 && (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                    <div className="relative flex items-center gap-6 bg-white/80 backdrop-blur-2xl border border-blue-100 p-6 rounded-3xl shadow-xl">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
                            <Info size={28} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">Multi-Document Analysis Active</h4>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                Our AI is now comparing all <span className="font-bold text-blue-600">{files.length} documents</span>. 
                                Ask for <span className="italic font-medium text-indigo-600">similarities, differences, or contradictions</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {files.map((file, idx) => (
                    <div 
                        key={file._id || idx} 
                        className="group relative bg-white hover:bg-blue-50/30 border border-slate-100 hover:border-blue-200 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-900/5"
                    >
                        <button 
                            onClick={() => onDelete(file._id || file.id)}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer border border-slate-100 shadow-sm"
                            title="Remove document"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-white flex items-center justify-center border border-slate-100 group-hover:border-blue-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                                {getIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-base font-bold text-slate-800 truncate pr-10" title={file.filename}>
                                    {file.filename}
                                </h4>
                                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed italic">
                                    {file.summary || "Deep analysis in progress..."}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                 <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">Indexed & Ready</span>
                             </div>
                             <div className="flex gap-2">
                                <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                    <Info size={16} />
                                </button>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DocumentLibrary;
