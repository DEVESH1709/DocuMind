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
            <div className="flex flex-col items-center justify-center p-20 rounded-[2rem] border border-blue-900/30 shadow-xl" style={{ background: '#0f1624' }}>
                <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                <p className="text-[#8899bb] font-medium">Preparing your library...</p>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 rounded-[2rem] border border-blue-900/30 shadow-xl text-center" style={{ background: '#0f1624' }}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/30" style={{ background: 'rgba(37,99,235,0.1)' }}>
                    <FileText size={32} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-[#f0f4ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your library is empty</h3>
                <p className="text-sm text-[#8899bb] max-w-xs mx-auto mt-2 leading-relaxed">
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
                    <h2 className="text-xl sm:text-2xl font-black text-[#f0f4ff] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Document Library</h2>
                    <p className="text-xs sm:text-sm text-[#8899bb]">Manage and explore your knowledge base</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8899bb]" />
                        <input
                            type="text"
                            placeholder="Filter library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-2 border-blue-900/50 rounded-xl pl-8 pr-3 py-1.5 text-xs sm:text-[13px] text-[#f0f4ff] placeholder:text-[#8899bb]/50 focus:outline-none focus:border-blue-500/70 focus:shadow-[0_0_12px_rgba(37,99,235,0.25)] shadow-sm w-40 sm:w-52 transition-all"
                            style={{ background: '#050810' }}
                        />
                    </div>
                    <div className="px-2.5 py-1 text-white text-xs font-bold rounded-xl shadow-md border border-blue-500/50 whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 12px rgba(37,99,235,0.3)' }}>
                        {files.length} {files.length === 1 ? 'File' : 'Files'}
                    </div>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
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
                                ? 'text-white border border-blue-500/50'
                                : 'text-[#8899bb] hover:text-[#f0f4ff] border border-blue-900/40 hover:border-blue-600/50'
                        }`}
                        style={filterType === tab.id ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 15px rgba(37,99,235,0.3)' } : { background: 'rgba(22,31,51,0.6)' }}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${filterType === tab.id ? 'bg-white/20 text-white' : 'text-[#8899bb]'}`} style={filterType === tab.id ? {} : { background: '#050810' }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Multi-Document Banner */}
            {files.length > 1 && (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center gap-4 border-shining-dark-blue-strong p-4 sm:p-5 rounded-3xl shadow-xl" style={{ background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(12px)' }}>
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-blue-500/50 shrink-0" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 12px rgba(37,99,235,0.4)' }}>
                            <Info size={20} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#f0f4ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Multi-Document Analysis Active</h4>
                            <p className="text-xs text-[#8899bb] mt-0.5 leading-relaxed">
                                Our AI is cross-referencing all <span className="font-bold text-blue-400">{files.length} documents</span>. 
                                Ask the chat to compare, spot differences, or locate common points.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Grid of Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFiles.map((file, idx) => (
                    <div 
                        key={file._id || idx} 
                        className="group relative border-shining-dark-blue rounded-3xl p-4 sm:p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                        style={{ background: '#0f1624' }}
                    >
                        <button 
                            onClick={() => setFileToDelete(file)}
                            className="absolute top-4 right-4 p-1.5 rounded-xl text-[#8899bb] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer border border-blue-900/40 shadow-sm"
                            style={{ background: 'rgba(22,31,51,0.8)' }}
                            title="Remove document"
                        >
                            <X size={14} />
                        </button>

                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-blue-900/40 group-hover:border-blue-500/60 group-hover:scale-105 transition-all duration-300 shadow-sm shrink-0" style={{ background: 'rgba(8,12,20,0.8)' }}>
                                {getIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-[#f0f4ff] truncate pr-8" title={file.filename}>
                                    {file.filename}
                                </h4>
                                <p className="text-xs text-[#8899bb]/80 mt-1 line-clamp-2 leading-relaxed italic">
                                    {file.summary || "Deep analysis in progress..."}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-3.5 border-t border-blue-900/30 flex items-center justify-between">
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
                ))}

                {filteredFiles.length === 0 && (
                    <div className="col-span-full py-10 text-center text-[#8899bb] rounded-3xl border border-blue-900/30" style={{ background: '#0f1624' }}>
                        <Search size={20} className="mx-auto mb-2 opacity-40" />
                        <p className="text-xs sm:text-sm font-semibold">No documents match "{searchQuery}"</p>
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



