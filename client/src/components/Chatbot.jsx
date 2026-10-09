import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Loader2, Play, Bot, User, Info, RotateCcw, Copy, Check, Sparkles, MessageSquare } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { API_BASE_URL } from '../config';

function FormattedMessage({ text, onTimestampClick }) {
    if (!text) return null;

    const renderInline = (str, lineKey) => {
        const inlineRegex = /(\*\*([^*]+)\*\*|`([^`]+)`|(\[|\()(\d{1,2}):(\d{2})(\]|\)))/g;
        const elements = [];
        let lastIdx = 0;
        let match;

        while ((match = inlineRegex.exec(str)) !== null) {
            if (match.index > lastIdx) {
                elements.push(str.substring(lastIdx, match.index));
            }

            if (match[2]) {
                elements.push(
                    <strong key={`${lineKey}-${match.index}`} className="font-extrabold text-[#f0f4ff]">
                        {match[2]}
                    </strong>
                );
            } else if (match[3]) {
                elements.push(
                    <code key={`${lineKey}-${match.index}`} className="px-1.5 py-0.5 rounded-md bg-blue-950/70 text-blue-300 font-mono text-[11px] sm:text-xs border border-blue-800/40 shadow-sm">
                        {match[3]}
                    </code>
                );
            } else if (match[5] && match[6]) {
                const minutes = parseInt(match[5], 10);
                const seconds = parseInt(match[6], 10);
                const totalSeconds = minutes * 60 + seconds;
                elements.push(
                    <button
                        key={`${lineKey}-${match.index}`}
                        onClick={() => onTimestampClick && onTimestampClick(totalSeconds)}
                        className="inline-flex items-center mx-1 px-2.5 py-0.5 rounded-full bg-blue-600/25 text-blue-300 hover:bg-blue-600 hover:text-white text-[11px] sm:text-xs font-bold border border-blue-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
                        title={`Jump to ${minutes}:${seconds}`}
                    >
                        <Play size={9} className="mr-1 fill-current" />
                        {match[5]}:{match[6]}
                    </button>
                );
            }
            lastIdx = inlineRegex.lastIndex;
        }

        if (lastIdx < str.length) {
            elements.push(str.substring(lastIdx));
        }

        return elements.length > 0 ? elements : str;
    };

    // Group lines into blocks and parse markdown tables
    const rawLines = text.split('\n');
    const blocks = [];
    let i = 0;

    while (i < rawLines.length) {
        const line = rawLines[i];
        const trimmed = line.trim();

        // Check if markdown table row
        if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < rawLines.length && rawLines[i + 1].trim().includes('---')) {
            const tableLines = [trimmed];
            i++;
            // separator line
            tableLines.push(rawLines[i].trim());
            i++;
            // collect subsequent table rows
            while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
                tableLines.push(rawLines[i].trim());
                i++;
            }
            blocks.push({ type: 'table', lines: tableLines });
            continue;
        }

        blocks.push({ type: 'line', text: line });
        i++;
    }

    return (
        <div className="space-y-2 text-[#e2e8f8] text-xs sm:text-[13px] leading-relaxed">
            {blocks.map((block, bIdx) => {
                if (block.type === 'table') {
                    const headerRow = block.lines[0]
                        .split('|')
                        .map(c => c.trim())
                        .filter(c => c.length > 0);
                    const bodyRows = block.lines.slice(2).map(r => 
                        r.split('|').map(c => c.trim()).filter(c => c.length > 0)
                    );

                    return (
                        <div key={bIdx} className="my-2.5 overflow-x-auto rounded-xl border border-blue-900/40 bg-[#080d18] shadow-md">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-blue-900/40 bg-blue-950/40 text-blue-300 font-bold">
                                        {headerRow.map((col, cIdx) => (
                                            <th key={cIdx} className="px-3.5 py-2 whitespace-nowrap">
                                                {renderInline(col, `th-${bIdx}-${cIdx}`)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-900/25">
                                    {bodyRows.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-blue-900/15 transition-colors">
                                            {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="px-3.5 py-2 text-[#c8d8f0]">
                                                    {renderInline(cell, `td-${bIdx}-${rIdx}-${cIdx}`)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }

                const trimmed = block.text.trim();
                if (!trimmed) {
                    return <div key={bIdx} className="h-1" />;
                }
                if (trimmed.startsWith('### ')) {
                    return (
                        <h4 key={bIdx} className="font-bold text-[#f0f4ff] text-sm mt-3 mb-1 tracking-tight">
                            {renderInline(trimmed.substring(4), bIdx)}
                        </h4>
                    );
                }
                if (trimmed.startsWith('## ')) {
                    return (
                        <h3 key={bIdx} className="font-black text-white text-base mt-3.5 mb-1.5 tracking-tight">
                            {renderInline(trimmed.substring(3), bIdx)}
                        </h3>
                    );
                }
                if (trimmed.startsWith('# ')) {
                    return (
                        <h2 key={bIdx} className="font-black text-white text-lg mt-4 mb-2 tracking-tight">
                            {renderInline(trimmed.substring(2), bIdx)}
                        </h2>
                    );
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                        <div key={bIdx} className="flex items-start gap-2 pl-1 my-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                            <div className="flex-1 min-w-0 text-[#e2e8f8]">
                                {renderInline(trimmed.substring(2), bIdx)}
                            </div>
                        </div>
                    );
                }
                if (/^\d+\.\s/.test(trimmed)) {
                    const match = trimmed.match(/^(\d+)\.\s(.*)$/);
                    return (
                        <div key={bIdx} className="flex items-start gap-2 pl-1 my-1">
                            <span className="font-bold text-blue-400 text-xs shrink-0">{match[1]}.</span>
                            <div className="flex-1 min-w-0 text-[#e2e8f8]">
                                {renderInline(match[2], bIdx)}
                            </div>
                        </div>
                    );
                }
                if (trimmed.startsWith('> ')) {
                    return (
                        <blockquote key={bIdx} className="pl-3 border-l-2 border-blue-500 italic text-blue-200/90 my-2 bg-blue-950/40 py-1.5 pr-2 rounded-r-xl">
                            {renderInline(trimmed.substring(2), bIdx)}
                        </blockquote>
                    );
                }
                return (
                    <p key={bIdx} className="leading-relaxed text-[#e2e8f8]">
                        {renderInline(trimmed, bIdx)}
                    </p>
                );
            })}
        </div>
    );
}

const SUGGESTED_PROMPTS = [
    "Summarize the key points in 3 bullets",
    "Identify differences or contradictions across files",
    "List all action items, decisions, and timestamps",
    "What are the main topics discussed in the media?"
];

function Chatbot({ token, onTimestampClick, files = [] }) {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleAskPrompt = async (queryText) => {
        const textToSend = queryText || question;
        if (!textToSend.trim()) return;

        const userMsg = { type: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setQuestion('');
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/chat/`,
                { question: userMsg.text },
                { headers: { Authorization: token } }
            );
            const botMsg = { type: 'bot', text: response.data.answer };
            setMessages(prev => [...prev, botMsg]);

            try {
                const existing = JSON.parse(localStorage.getItem('documind_chat_history') || '[]');
                const newEntry = {
                    id: Date.now(),
                    question: userMsg.text,
                    answer: response.data.answer,
                    timestamp: Date.now(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                };
                localStorage.setItem('documind_chat_history', JSON.stringify([newEntry, ...existing].slice(0, 50)));
            } catch (storageErr) {
                console.error("Failed to save chat history to localStorage:", storageErr);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Is the backend running?' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-170px)] min-h-[500px] rounded-[2rem] border-shining-dark-blue-strong overflow-hidden relative group" style={{ background: '#0f1624' }}>
            
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.05) 0%, transparent 100%)' }} />

            {/* Header */}
            <div className="p-3.5 sm:p-4 flex items-center justify-between relative z-10 border-b border-blue-900/40" style={{ background: 'rgba(8,12,20,0.6)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl border border-blue-500/30 shadow-inner" style={{ background: 'rgba(37,99,235,0.15)' }}>
                        <Bot size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#f0f4ff] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Analyst</h3>
                        <p className="text-[10px] sm:text-[11px] text-blue-400/80 flex items-center gap-1 font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Now
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <button 
                            onClick={() => setShowResetModal(true)}
                            className="p-1.5 rounded-xl hover:bg-white/10 border border-blue-900/40 transition-all text-[#8899bb] hover:text-[#f0f4ff] cursor-pointer group/btn"
                            style={{ background: 'rgba(22,31,51,0.8)' }}
                            title="Start New Chat"
                        >
                            <RotateCcw size={14} className="group-hover/btn:rotate-[-45deg] transition-transform" />
                        </button>
                    )}
                    {files.length > 1 && (
                        <div className="px-2.5 py-0.5 rounded-full border border-blue-500/30" style={{ background: 'rgba(37,99,235,0.15)' }}>
                            <span className="text-[10px] sm:text-[11px] font-bold text-blue-300 uppercase tracking-wider">Multi-Doc</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-transparent relative z-10 no-scrollbar">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-[#8899bb] space-y-4 py-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-shining-dark-blue-subtle animate-pulse" style={{ background: 'rgba(37,99,235,0.1)' }}>
                            <Bot size={28} className="text-blue-500" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm sm:text-base font-bold text-[#f0f4ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {files.length > 1 ? "Cross-Document Comparison Ready" : "How can I help you today?"}
                            </p>
                            <p className="text-xs text-[#8899bb] max-w-[260px] mx-auto leading-relaxed">
                                {files.length > 1 
                                    ? `I have indexed all ${files.length} documents. Ask me to compare, find differences, or verify facts.` 
                                    : "Ask any question about your PDF, audio recording, or video files."}
                            </p>
                        </div>
                        
                        {/* Starter Prompt Chips */}
                        <div className="w-full max-w-sm space-y-2 pt-1">
                            <p className="text-xs font-bold text-[#8899bb] uppercase tracking-widest text-center flex items-center justify-center gap-1">
                                <Sparkles size={11} className="text-blue-500" /> Suggested Prompts
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {SUGGESTED_PROMPTS.slice(0, files.length > 1 ? 4 : 3).map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAskPrompt(prompt)}
                                        className="text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-98 border border-blue-900/40 text-[#8899bb] hover:text-[#f0f4ff] hover:border-blue-700/60"
                                        style={{ background: 'rgba(22,31,51,0.6)' }}
                                    >
                                        "{prompt}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2.5 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.type === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/40' : 'bg-[#161f33] border border-blue-900/50'
                            }`}>
                            {msg.type === 'user' ? <User size={13} className="text-white" /> : <Bot size={13} className="text-blue-500" />}
                        </div>

                        <div className={`relative group/msg max-w-[88%] rounded-2xl p-3.5 shadow-sm ${msg.type === 'user'
                            ? 'text-white rounded-tr-sm text-xs sm:text-[13px] leading-relaxed border border-blue-500/50'
                            : 'text-[#c8d8f0] border-shining-dark-blue rounded-tl-sm text-xs sm:text-[13px]'
                            }`}
                            style={msg.type === 'user' ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.25)' } : { background: 'rgba(22,31,51,0.8)' }}>
                            
                            {msg.type === 'user' ? (
                                msg.text
                            ) : (
                                <>
                                    <FormattedMessage text={msg.text} onTimestampClick={onTimestampClick} />
                                    
                                    {/* Action Bar */}
                                    <div className="flex items-center justify-end gap-2 mt-2.5 pt-2 border-t border-blue-900/30 text-[#8899bb]">
                                        <button
                                            onClick={() => handleCopy(msg.text, idx)}
                                            className="flex items-center gap-1 text-[11px] font-semibold text-[#8899bb] hover:text-[#f0f4ff] transition-colors cursor-pointer py-0.5 px-2 rounded-lg hover:bg-white/5"
                                            title="Copy answer"
                                        >
                                            {copiedIdx === idx ? (
                                                <>
                                                    <Check size={11} className="text-emerald-400" />
                                                    <span className="text-emerald-500">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={11} />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-2.5 animate-in fade-in duration-300">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border border-blue-900/50" style={{ background: '#161f33' }}>
                            <Bot size={13} className="text-blue-500" />
                        </div>
                        <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 border-shining-dark-blue flex items-center gap-2 shadow-sm" style={{ background: 'rgba(22,31,51,0.8)' }}>
                            <div className="flex space-x-1.5">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-xs text-[#8899bb] font-medium ml-1">Analyzing knowledge base...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-blue-900/40 relative z-10" style={{ background: 'rgba(8,12,20,0.8)', backdropFilter: 'blur(12px)' }}>
                <div className="relative flex items-center gap-2 rounded-2xl p-1 border-2 border-blue-900/50 focus-within:border-blue-500/70 transition-all shadow-sm" style={{ background: '#050810', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-[#f0f4ff] px-3 placeholder:text-[#8899bb]/50 h-8"
                        placeholder={files.length > 0 ? "Ask anything about your files..." : "Upload files first to ask questions..."}
                        value={question}
                        disabled={loading}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskPrompt()}
                    />
                    <button
                        onClick={() => handleAskPrompt()}
                        disabled={loading || !question.trim()}
                        className="w-8 h-8 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center border border-blue-500/50 cursor-pointer active:scale-95 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 12px rgba(37,99,235,0.3)' }}
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>

            {/* Reset Chat Confirmation Modal */}
            <ConfirmModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                onConfirm={() => {
                    setMessages([]);
                    setQuestion('');
                }}
                title="Start a New Chat?"
                message="This will clear the current conversation view. Your past queries remain saved in the History tab."
                confirmText="New Chat"
                cancelText="Stay Here"
                isDestructive={false}
            />
        </div>
    );
}

export default Chatbot;




