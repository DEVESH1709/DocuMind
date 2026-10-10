import React, { useState, useMemo } from 'react';
import { FileText, Music, Video, Info, Loader2, X, Play, Search, Filter, Sparkles, FolderOpen } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

function DocumentLibrary({ files, loading, onDelete, onSelectMedia, activeMediaId }) {
    const [fileToDelete, setFileToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all' | 'pdf' | 'audio' | 'video'

    const getIcon = (type) => {
        if (type === 'pdf') return <FileText size={18} className="text-rose-400" />;
        if (type === 'audio') return <Music size={18} className="text-cyan-400" />;
        if (type === 'video') return <Video size={18} className="text-indigo-400" />;
        return <FileText size={18} className="text-slate-400" />;
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
            <div className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl border border-blue-900/30 text-center" style={{ background: '#0f1624' }}>
                <Loader2 size={24} className="text-blue-500 animate-spin mb-2" />
                <p className="text-xs text-[#8899bb] font-medium">Loading documents...</p>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl border border-blue-900/30 text-center" style={{ background: '#0f1624' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border border-blue-500/30" style={{ background: 'rgba(37,99,235,0.1)' }}>
                    <FolderOpen size={22} className="text-blue-400" />
                </div>
                <h4 className="text-xs font-bold text-[#f0f4ff]">No files attached yet</h4>
                <p className="text-[11px] text-[#8899bb] mt-1 max-w-[220px] leading-relaxed">
                    Upload documents or media above to start chatting with them.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header: Title + File Count */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#f0f4ff] uppercase tracking-wider">
                        Documents
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-300 border border-blue-500/30" style={{ background: 'rgba(37,99,235,0.15)' }}>
                        {files.length} {files.length === 1 ? 'file' : 'files'}
                    </span>
                </div>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                        Clear filter
                    </button>
                )}
            </div>

            {/* Search Input (100% width, never overflowing) */}
            <div className="relative w-full">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8899bb]" />
                <input
                    type="text"
                    placeholder="Search documents or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-blue-900/50 rounded-xl pl-8.5 pr-7 py-2 text-xs text-[#f0f4ff] placeholder:text-[#8899bb]/50 focus:outline-none focus:border-blue-500/70 focus:shadow-[0_0_12px_rgba(37,99,235,0.25)] transition-all"
                    style={{ background: '#050810' }}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8899bb] hover:text-white cursor-pointer"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {[
                    { id: 'all', label: 'All', count: files.length },
                    { id: 'pdf', label: 'PDFs', count: files.filter(f => f.type === 'pdf' || f.filename.endsWith('.pdf')).length },
                    { id: 'audio', label: 'Audio', count: files.filter(f => f.type === 'audio' || /\.(mp3|wav|m4a)$/i.test(f.filename)).length },
                    { id: 'video', label: 'Video', count: files.filter(f => f.type === 'video' || /\.(mp4|mov|webm)$/i.test(f.filename)).length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterType(tab.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            filterType === tab.id
                                ? 'text-white border border-blue-500/50 shadow-sm font-bold'
                                : 'text-[#8899bb] hover:text-[#f0f4ff] border border-blue-900/40 hover:border-blue-600/50'
                        }`}
                        style={filterType === tab.id ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 10px rgba(37,99,235,0.3)' } : { background: 'rgba(22,31,51,0.6)' }}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${filterType === tab.id ? 'bg-white/20 text-white' : 'text-[#8899bb]'}`} style={filterType === tab.id ? {} : { background: '#050810' }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Multi-Document Hint Pill */}
            {files.length > 1 && (
                <div className="flex items-center gap-2 p-2 rounded-xl border border-blue-500/25 text-xs" style={{ background: 'rgba(37,99,235,0.08)' }}>
                    <Sparkles size={13} className="text-blue-400 shrink-0" />
                    <p className="text-[11px] text-[#c8d8f0] leading-tight">
                        AI cross-referencing all <strong className="text-white">{files.length} documents</strong>.
                    </p>
                </div>
            )}
            
            {/* List of Files (100% width) */}
            <div className="flex flex-col gap-2.5">
                {filteredFiles.map((file, idx) => {
                    const isMedia = ['audio', 'video'].includes(file.type) || (file.filename && /\.(mp4|mp3|wav|m4a)$/i.test(file.filename));
                    const isPlaying = activeMediaId === (file._id || file.id);

                    return (
                        <div 
                            key={file._id || idx} 
                            className="group relative border-shining-dark-blue rounded-2xl p-3 sm:p-3.5 transition-all duration-200 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                            style={{ background: '#0f1624' }}
                        >
                            {/* Delete button (top right) */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFileToDelete(file);
                                }}
                                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-[#8899bb] hover:text-red-400 opacity-60 group-hover:opacity-100 hover:bg-red-500/10 transition-all cursor-pointer border border-transparent hover:border-red-500/30"
                                title="Remove document"
                            >
                                <X size={13} />
                            </button>

                            <div className="flex items-start gap-2.5 pr-6">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-blue-900/40 shrink-0 mt-0.5" style={{ background: 'rgba(8,12,20,0.8)' }}>
                                    {getIcon(file.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-bold text-[#f0f4ff] truncate leading-tight" title={file.filename}>
                                        {file.filename}
                                    </h4>
                                    <p className="text-[11px] text-[#8899bb]/80 mt-1 line-clamp-2 leading-relaxed italic">
                                        {file.summary || "Deep analysis in progress..."}
                                    </p>
                                </div>
                            </div>
                        
                            <div className="mt-2.5 pt-2 border-t border-blue-900/30 flex items-center justify-between">
                             <div className="flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                 <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-[#8899bb]">Indexed & Ready</span>
                             </div>
                             <div className="flex items-center gap-2">
                                {(['audio', 'video'].includes(file.type) || (file.filename && /\.(mp4|mp3|wav|m4a)$/i.test(file.filename))) && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onSelectMedia) onSelectMedia(file);
                                        }}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                                            (activeMediaId === (file._id || file.id))
                                                ? 'text-white border border-blue-500/50'
                                                : 'text-blue-400 hover:text-white border border-blue-600/40'
                                        }`}
                                        style={(activeMediaId === (file._id || file.id)) ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 15px rgba(37,99,235,0.4)' } : { background: 'rgba(37,99,235,0.1)' }}
                                        title="Play in Media Player"
                                    >
                                        <Play size={10} className="fill-current" />
                                        {(activeMediaId === (file._id || file.id)) ? 'Playing' : 'Play'}
                                    </button>
                                )}
                             </div>
                        </div>
                    </div>
                    );
                })}

                {filteredFiles.length === 0 && (
                    <div className="py-6 text-center text-[#8899bb] rounded-2xl border border-blue-900/30" style={{ background: '#0f1624' }}>
                        <Search size={16} className="mx-auto mb-1.5 opacity-40" />
                        <p className="text-xs font-semibold">No documents match "{searchQuery}"</p>
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



