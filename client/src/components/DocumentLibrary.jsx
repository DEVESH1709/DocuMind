import React, { useState, useMemo } from 'react';
import { FileText, Music, Video, Info, Loader2, X, Play, Search, Filter } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

function DocumentLibrary({ files, loading, onDelete, onSelectMedia, activeMediaId }) {
    const [fileToDelete, setFileToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all' | 'pdf' | 'audio' | 'video'

    const getIcon = (type) => {
        if (type === 'pdf') return <FileText size={24} className="text-red-500" />;
        if (type === 'audio') return <Music size={24} className="text-blue-600" />;
        if (type === 'video') return <Video size={24} className="text-indigo-600" />;
        return <FileText size={24} className="text-slate-400" />;
    };

    const filteredFiles = useMemo(() => {
        return files.filter(f => {
            const matchesSearch = !searchQuery || 
                f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (f.summary && f.summary.toLowerCase().includes(searchQuery.toLowerCase()));

            if (!matchesSearch) return false;
            if (filterType === 'all') return true;
            if (filterType === 'pdf') return f.type === 'pdf' || f.filename.endsWith('.pdf');
            if (filterType === 'audio') return f.type === 'audio' || /\.(mp3|wav|m4a)$/i.test(f.filename);
            if (filterType === 'video') return f.type === 'video' || /\.(mp4|mov|webm)$/i.test(f.filename);
            return true;
        });
    }, [files, searchQuery, filterType]);

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

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Document Library</h2>
                    <p className="text-sm text-slate-500">Manage and explore your knowledge base</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm w-44 sm:w-56"
                        />
                    </div>
                    <div className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 whitespace-nowrap">
                        {files.length} {files.length === 1 ? 'File' : 'Files'}
                    </div>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                    { id: 'all', label: 'All Files', count: files.length },
                    { id: 'pdf', label: 'PDFs', count: files.filter(f => f.type === 'pdf' || f.filename.endsWith('.pdf')).length },
                    { id: 'audio', label: 'Audio', count: files.filter(f => f.type === 'audio' || /\.(mp3|wav|m4a)$/i.test(f.filename)).length },
                    { id: 'video', label: 'Video', count: files.filter(f => f.type === 'video' || /\.(mp4|mov|webm)$/i.test(f.filename)).length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterType(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            filterType === tab.id
                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${filterType === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Multi-Document Banner */}
            {files.length > 1 && (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                    <div className="relative flex items-center gap-5 bg-white/90 backdrop-blur-xl border border-blue-100 p-5 rounded-3xl shadow-lg">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
                            <Info size={24} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900">Multi-Document Analysis Active</h4>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                Our AI is cross-referencing all <span className="font-bold text-blue-600">{files.length} documents</span>. 
                                Ask the chat to compare, spot differences, or locate common points.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Grid of Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredFiles.map((file, idx) => (
                    <div 
                        key={file._id || idx} 
                        className="group relative bg-white hover:bg-blue-50/20 border border-slate-100 hover:border-blue-200 rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-900/5"
                    >
                        <button 
                            onClick={() => setFileToDelete(file)}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer border border-slate-100 shadow-sm"
                            title="Remove document"
                        >
                            <X size={15} />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-white flex items-center justify-center border border-slate-100 group-hover:border-blue-100 group-hover:scale-105 transition-all duration-300 shadow-sm shrink-0">
                                {getIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 truncate pr-8" title={file.filename}>
                                    {file.filename}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed italic">
                                    {file.summary || "Deep analysis in progress..."}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                 <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Indexed & Ready</span>
                             </div>
                             <div className="flex items-center gap-2">
                                {(['audio', 'video'].includes(file.type) || (file.filename && /\.(mp4|mp3|wav|m4a)$/i.test(file.filename))) && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onSelectMedia) onSelectMedia(file);
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                                            (activeMediaId === (file._id || file.id))
                                                ? 'bg-blue-600 text-white shadow-blue-600/20'
                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                                        }`}
                                        title="Play in Media Player"
                                    >
                                        <Play size={11} className="fill-current" />
                                        {(activeMediaId === (file._id || file.id)) ? 'Playing' : 'Play'}
                                    </button>
                                )}
                             </div>
                        </div>
                    </div>
                ))}

                {filteredFiles.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
                        <Search size={24} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-semibold">No documents match "{searchQuery}"</p>
                    </div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={Boolean(fileToDelete)}
                onClose={() => setFileToDelete(null)}
                onConfirm={() => {
                    if (fileToDelete) {
                        onDelete(fileToDelete._id || fileToDelete.id);
                        setFileToDelete(null);
                    }
                }}
                title="Remove Document?"
                message={`Are you sure you want to remove "${fileToDelete?.filename}"? It will no longer be available for AI cross-referencing.`}
                confirmText="Yes, Remove"
                isDestructive={true}
            />
        </div>
    );
}

export default DocumentLibrary;
