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
        const regex = /(\[|\()(\d{1,2}):(\d{2})(\]|\))/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            const minutes = parseInt(match[2], 10);
            const seconds = parseInt(match[3], 10);
            const totalSeconds = minutes * 60 + seconds;
            parts.push(
                <button
                    key={match.index}
                    onClick={() => {
                        if (onTimestampClick) onTimestampClick(totalSeconds);
                        if (onBackToWorkspace) onBackToWorkspace();
                    }}
                    className="inline-flex items-center mx-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold transition-colors cursor-pointer"
                    title={`Jump to ${minutes}:${seconds}`}
                >
                    <Play size={10} className="mr-1 fill-current" />
                    {match[2]}:{match[3]}
                </button>
            );
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
        <div className="h-full flex flex-col space-y-6 max-w-[1400px] mx-auto pb-16 animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBackToWorkspace}
                        className="p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer border border-slate-100 shadow-sm"
                        title="Back to Workspace"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <History size={20} className="text-blue-600" />
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">History & Activity Log</h2>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Review all indexed documents and past chatbot Q&A interactions.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Filter history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all w-48 sm:w-64"
                        />
                    </div>
                    {chatLogs.length > 0 && (
                        <button 
                            onClick={() => setShowClearModal(true)}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer border border-slate-100"
                            title="Clear Chat Logs"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <span className="text-2xl font-black text-slate-900">{files.length}</span>
                        <p className="text-xs font-semibold text-slate-500">Indexed Files</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                        <Video size={24} />
                    </div>
                    <div>
                        <span className="text-2xl font-black text-slate-900">
                            {files.filter(f => f.type === 'audio' || f.type === 'video' || (f.filename && /\.(mp4|mp3|wav)$/i.test(f.filename))).length}
                        </span>
                        <p className="text-xs font-semibold text-slate-500">Transcribed Media</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <span className="text-2xl font-black text-slate-900">{chatLogs.length}</span>
                        <p className="text-xs font-semibold text-slate-500">Q&A Queries</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'all' 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                    }`}
                >
                    All Activity
                </button>
                <button 
                    onClick={() => setActiveTab('documents')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'documents' 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                    }`}
                >
                    Documents ({filteredFiles.length})
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'chat' 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                    }`}
                >
                    Chat Queries ({filteredChats.length})
                </button>
            </div>

            {/* Content Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto no-scrollbar flex-1 pb-10">
                {/* Documents Column */}
                {(activeTab === 'all' || activeTab === 'documents') && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Indexed Files</h3>
                            <span className="text-xs text-slate-400">{filteredFiles.length} items</span>
                        </div>
                        {filteredFiles.length === 0 ? (
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400 text-xs">
                                No matching documents found.
                            </div>
                        ) : (
                            filteredFiles.map((file, idx) => (
                                <div key={file._id || idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                                                {getIcon(file.type)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 truncate max-w-xs">{file.filename}</h4>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                                    <Calendar size={12} />
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
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                                            >
                                                <Play size={10} className="fill-current" />
                                                Play
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100/70 leading-relaxed italic line-clamp-3">
                                        {file.summary || "Summary indexed."}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Chat Column */}
                {(activeTab === 'all' || activeTab === 'chat') && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Past Chat Answers</h3>
                            <span className="text-xs text-slate-400">{filteredChats.length} records</span>
                        </div>
                        {filteredChats.length === 0 ? (
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400 text-xs">
                                No chat queries recorded yet. Ask questions in the workspace to see them here!
                            </div>
                        ) : (
                            filteredChats.map((chat, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                            Q: {chat.question}
                                        </span>
                                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                            <Clock size={11} />
                                            <span>{chat.time || "Recent"}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
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