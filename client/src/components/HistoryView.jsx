import React, { useState, useEffect } from 'react';
import { History, FileText, Music, Video, MessageSquare, ArrowLeft, Trash2, Calendar, Play, Clock, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';

function HistoryView({ files = [], onBackToWorkspace, onSelectMedia, onTimestampClick }) {
    const { success } = useToast();
    const [chatLogs, setChatLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'documents' | 'chat'
    const [showClearModal, setShowClearModal] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('documind_chat_history');
            if (saved) {
                setChatLogs(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Could not load chat history:", e);
        }
    }, []);

    const handleConfirmClear = () => {
        localStorage.removeItem('documind_chat_history');
        setChatLogs([]);
        success("Chat history cleared successfully.", "History Cleared");
    };

    const getIcon = (type) => {
        if (type === 'pdf') return <FileText size={20} className="text-red-500" />;
        if (type === 'audio') return <Music size={20} className="text-blue-600" />;
        if (type === 'video') return <Video size={20} className="text-indigo-600" />;
        return <FileText size={20} className="text-slate-400" />;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "Recently";
        try {
            // Check if seconds or milliseconds
            const date = new Date(timestamp > 1e11 ? timestamp : timestamp * 1000);
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return "Recently";
        }
    };

    const renderClickableText = (text) => {
        if (!text) return text;
        const regex = /(\*\*([^*]+)\*\*|(\[|\()(\d{1,2}):(\d{2})(\]|\)))/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            if (match[2]) {
                // Bold text
                parts.push(
                    <strong key={`bold-${match.index}`} className="font-extrabold text-[#f0f4ff]">
                        {match[2]}
                    </strong>
                );
            } else if (match[4] && match[5]) {
                // Timestamp
                const minutes = parseInt(match[4], 10);
                const seconds = parseInt(match[5], 10);
                const totalSeconds = minutes * 60 + seconds;
                parts.push(
                    <button
                        key={`ts-${match.index}`}
                        onClick={() => {
                            if (onTimestampClick) onTimestampClick(totalSeconds);
                            if (onBackToWorkspace) onBackToWorkspace();
                        }}
                        className="inline-flex items-center mx-1 px-2.5 py-0.5 rounded-full bg-blue-600/25 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                        title={`Jump to ${minutes}:${seconds}`}
                    >
                        <Play size={9} className="mr-1 fill-current" />
                        {match[4]}:{match[5]}
                    </button>
                );
            }
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        return parts.length > 0 ? parts : text;
    };

    const filteredFiles = files.filter(f => 
        (f.filename || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredChats = chatLogs.filter(c => 
        (c.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.answer || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col space-y-4 sm:space-y-6 max-w-[1400px] mx-auto pb-16 animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-900/40 shadow-sm" style={{ background: '#0f1624' }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <button 
                        onClick={onBackToWorkspace}
                        className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-[#8899bb] hover:text-[#f0f4ff] hover:bg-white/10 transition-colors cursor-pointer border border-blue-900/30 shadow-sm shrink-0"
                        style={{ background: 'rgba(22,31,51,0.6)' }}
                        title="Back to Workspace"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <History size={16} className="text-blue-500 shrink-0" />
                            <h2 className="text-base sm:text-2xl font-black text-[#f0f4ff] tracking-tight truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>History & Activity Log</h2>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#8899bb] mt-0.5 truncate">Review all indexed documents and past chatbot Q&A interactions.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8899bb]" />
                        <input 
                            type="text"
                            placeholder="Filter history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-2 border-blue-900/40 rounded-xl pl-8 pr-3 py-1.5 text-xs sm:text-[13px] text-[#f0f4ff] placeholder:text-[#8899bb]/50 focus:outline-none focus:border-blue-500/70 focus:shadow-[0_0_12px_rgba(37,99,235,0.25)] transition-all w-full sm:w-56"
                            style={{ background: '#050810', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}
                        />
                    </div>
                    {chatLogs.length > 0 && (
                        <button 
                            onClick={() => setShowClearModal(true)}
                            className="p-2 rounded-xl text-[#8899bb] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-blue-900/30 shrink-0"
                            style={{ background: 'rgba(22,31,51,0.6)' }}
                            title="Clear Chat Logs"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
                <div className="p-3 sm:p-5 rounded-2xl border-shining-dark-blue flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3.5 text-center sm:text-left" style={{ background: '#0f1624' }}>
                    <div className="p-1.5 sm:p-2.5 rounded-xl border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.25)] text-blue-400 shrink-0" style={{ background: 'rgba(37,99,235,0.15)' }}>
                        <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-base sm:text-2xl font-black text-[#f0f4ff] block leading-tight">{files.length}</span>
                        <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8899bb] truncate">Indexed Files</p>
                    </div>
                </div>
                <div className="p-3 sm:p-5 rounded-2xl border-shining-dark-blue flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3.5 text-center sm:text-left" style={{ background: '#0f1624' }}>
                    <div className="p-1.5 sm:p-2.5 rounded-xl border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.25)] text-indigo-400 shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <Video size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-base sm:text-2xl font-black text-[#f0f4ff] block leading-tight">
                            {files.filter(f => f.type === 'audio' || f.type === 'video' || (f.filename && /\.(mp4|mp3|wav)$/i.test(f.filename))).length}
                        </span>
                        <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8899bb] truncate">Media Files</p>
                    </div>
                </div>
                <div className="p-3 sm:p-5 rounded-2xl border-shining-dark-blue flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3.5 text-center sm:text-left" style={{ background: '#0f1624' }}>
                    <div className="p-1.5 sm:p-2.5 rounded-xl border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-emerald-400 shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                        <MessageSquare size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-base sm:text-2xl font-black text-[#f0f4ff] block leading-tight">{chatLogs.length}</span>
                        <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8899bb] truncate">Q&A Queries</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeTab === 'all' 
                            ? 'text-white border border-blue-500/50' 
                            : 'text-[#8899bb] hover:text-[#f0f4ff] hover:border-blue-600/50 border-shining-dark-blue-subtle'
                    }`}
                    style={activeTab === 'all' ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 15px rgba(37,99,235,0.3)' } : { background: 'rgba(22,31,51,0.6)' }}
                >
                    All Activity
                </button>
                <button 
                    onClick={() => setActiveTab('documents')}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeTab === 'documents' 
                            ? 'text-white border border-blue-500/50' 
                            : 'text-[#8899bb] hover:text-[#f0f4ff] hover:border-blue-600/50 border-shining-dark-blue-subtle'
                    }`}
                    style={activeTab === 'documents' ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 15px rgba(37,99,235,0.3)' } : { background: 'rgba(22,31,51,0.6)' }}
                >
                    Documents ({filteredFiles.length})
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeTab === 'chat' 
                            ? 'text-white border border-blue-500/50' 
                            : 'text-[#8899bb] hover:text-[#f0f4ff] hover:border-blue-600/50 border-shining-dark-blue-subtle'
                    }`}
                    style={activeTab === 'chat' ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 15px rgba(37,99,235,0.3)' } : { background: 'rgba(22,31,51,0.6)' }}
                >
                    Chat Queries ({filteredChats.length})
                </button>
            </div>

            {/* Content Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-y-auto no-scrollbar flex-1 pb-10">
                {/* Documents Column */}
                {(activeTab === 'all' || activeTab === 'documents') && (
                    <div className="space-y-3.5">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8899bb]">Indexed Files</h3>
                            <span className="text-xs text-[#8899bb]">{filteredFiles.length} items</span>
                        </div>
                        {filteredFiles.length === 0 ? (
                            <div className="p-6 rounded-3xl border-shining-dark-blue-subtle text-center text-[#8899bb] text-xs" style={{ background: '#0f1624' }}>
                                No matching documents found.
                            </div>
                        ) : (
                            filteredFiles.map((file, idx) => (
                                <div key={file._id || idx} className="p-4 sm:p-5 rounded-3xl border-shining-dark-blue shadow-sm hover:border-blue-500/70 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all space-y-2.5" style={{ background: '#0f1624' }}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-2xl border border-blue-900/40" style={{ background: 'rgba(8,12,20,0.8)' }}>
                                                {getIcon(file.type)}
                                            </div>
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-bold text-[#f0f4ff] truncate max-w-[160px] sm:max-w-xs" title={file.filename}>{file.filename}</h4>
                                                <div className="flex items-center gap-1.5 text-[11px] text-[#8899bb] mt-0.5">
                                                    <Calendar size={11} />
                                                    <span>{formatDate(file.uploaded_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {(['audio', 'video'].includes(file.type) || (file.filename && /\.(mp4|mp3|wav|m4a)$/i.test(file.filename))) && (
                                            <button 
                                                onClick={() => {
                                                    if (onSelectMedia) onSelectMedia(file);
                                                    if (onBackToWorkspace) onBackToWorkspace();
                                                }}
                                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-blue-400 hover:text-white border border-blue-500/40 hover:border-blue-500/70 text-xs font-bold transition-all cursor-pointer shadow-sm"
                                                style={{ background: 'rgba(37,99,235,0.15)' }}
                                            >
                                                <Play size={9} className="fill-current" />
                                                Play
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#8899bb] p-2.5 rounded-2xl border border-blue-900/30 leading-relaxed italic line-clamp-3" style={{ background: '#050810' }}>
                                        {file.summary || "Summary indexed."}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Chat Column */}
                {(activeTab === 'all' || activeTab === 'chat') && (
                    <div className="space-y-3.5">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8899bb]">Past Chat Answers</h3>
                            <span className="text-xs text-[#8899bb]">{filteredChats.length} records</span>
                        </div>
                        {filteredChats.length === 0 ? (
                            <div className="p-6 rounded-3xl border-shining-dark-blue-subtle text-center text-[#8899bb] text-xs" style={{ background: '#0f1624' }}>
                                No chat queries recorded yet. Ask questions in the workspace to see them here!
                            </div>
                        ) : (
                            filteredChats.map((chat, idx) => (
                                <div key={idx} className="p-4 sm:p-5 rounded-3xl border-shining-dark-blue shadow-sm hover:border-blue-500/70 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all space-y-2.5" style={{ background: '#0f1624' }}>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-lg line-clamp-1 max-w-[75%]" title={chat.question} style={{ background: 'rgba(37,99,235,0.15)' }}>
                                            Q: {chat.question}
                                        </span>
                                        <div className="flex items-center gap-1 text-[11px] text-[#8899bb]">
                                            <Clock size={10} />
                                            <span>{chat.time || "Recent"}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs sm:text-[13px] text-[#c8d8f0] p-3 rounded-2xl border border-blue-900/30 leading-relaxed" style={{ background: '#050810' }}>
                                        {renderClickableText(chat.answer)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleConfirmClear}
                title="Clear Chat History?"
                message="Are you sure you want to clear your saved question-and-answer interactions? This will remove all local records."
                confirmText="Yes, Clear All"
                isDestructive={true}
            />
        </div>
    );
}

export default HistoryView;


