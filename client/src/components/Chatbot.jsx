import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Loader2, Play, Bot, User, Info, RotateCcw, Copy, Check, Sparkles, MessageSquare } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { API_BASE_URL } from '../config';

function FormattedMessage({ text, onTimestampClick }) {
    const lines = text.split('\n');

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
                elements.push(<strong key={`${lineKey}-${match.index}`} className="font-bold text-slate-900">{match[2]}</strong>);
            } else if (match[3]) {
                elements.push(
                    <code key={`${lineKey}-${match.index}`} className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] border border-blue-100">
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
                        onClick={() => onTimestampClick(totalSeconds)}
                        className="inline-flex items-center mx-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white text-[11px] font-bold border border-blue-200 transition-all cursor-pointer shadow-sm active:scale-95"
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

    return (
        <div className="space-y-2 text-slate-700 text-xs sm:text-[13px] leading-relaxed">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    return <div key={idx} className="h-1" />;
                }
                if (trimmed.startsWith('### ')) {
                    return (
                        <h4 key={idx} className="font-bold text-slate-900 text-sm mt-2 mb-1 tracking-tight">
                            {renderInline(trimmed.substring(4), idx)}
                        </h4>
                    );
                }
                if (trimmed.startsWith('## ')) {
                    return (
                        <h3 key={idx} className="font-black text-slate-900 text-base mt-2.5 mb-1 tracking-tight">
                            {renderInline(trimmed.substring(3), idx)}
                        </h3>
                    );
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                        <div key={idx} className="flex items-start gap-2 pl-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">{renderInline(trimmed.substring(2), idx)}</div>
                        </div>
                    );
                }
                if (/^\d+\.\s/.test(trimmed)) {
                    const match = trimmed.match(/^(\d+)\.\s(.*)$/);
                    return (
                        <div key={idx} className="flex items-start gap-2 pl-1">
                            <span className="font-bold text-blue-600 text-xs shrink-0">{match[1]}.</span>
                            <div className="flex-1 min-w-0">{renderInline(match[2], idx)}</div>
                        </div>
                    );
                }
                if (trimmed.startsWith('> ')) {
                    return (
                        <blockquote key={idx} className="pl-3 border-l-2 border-blue-500 italic text-slate-600 my-1 bg-blue-50/40 py-1 rounded-r-lg">
                            {renderInline(trimmed.substring(2), idx)}
                        </blockquote>
                    );
                }
                return (
                    <p key={idx} className="leading-relaxed">
                        {renderInline(trimmed, idx)}
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
        <div className="flex flex-col h-[calc(100vh-170px)] min-h-[500px] bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-blue-50/50 overflow-hidden relative group">
            
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 flex items-center justify-between relative z-10 text-white">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-inner">
                        <Bot size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight">AI Analyst</h3>
                        <p className="text-[10px] text-blue-100 flex items-center gap-1 font-bold uppercase tracking-widest opacity-80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Now
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <button 
                            onClick={() => setShowResetModal(true)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-white cursor-pointer group/btn"
                            title="Start New Chat"
                        >
                            <RotateCcw size={15} className="group-hover/btn:rotate-[-45deg] transition-transform" />
                        </button>
                    )}
                    {files.length > 1 && (
                        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Multi-Doc</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-transparent relative z-10 no-scrollbar">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-5 py-6">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center border border-blue-100 animate-pulse">
                            <Bot size={32} className="text-blue-600" />
                        </div>
                        <div className="text-center space-y-1.5">
                            <p className="text-base font-bold text-slate-800">
                                {files.length > 1 ? "Cross-Document Comparison Ready" : "How can I help you today?"}
                            </p>
                            <p className="text-xs text-slate-400 max-w-[260px] mx-auto leading-relaxed">
                                {files.length > 1 
                                    ? `I have indexed all ${files.length} documents. Ask me to compare, find differences, or verify facts.` 
                                    : "Ask any question about your PDF, audio recording, or video files."}
                            </p>
                        </div>
                        
                        {/* Starter Prompt Chips */}
                        <div className="w-full max-w-sm space-y-2 pt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center flex items-center justify-center gap-1">
                                <Sparkles size={11} className="text-amber-500" /> Suggested Prompts
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {SUGGESTED_PROMPTS.slice(0, files.length > 1 ? 4 : 3).map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAskPrompt(prompt)}
                                        className="text-left px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-98"
                                    >
                                        "{prompt}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.type === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-white border border-slate-100'
                            }`}>
                            {msg.type === 'user' ? <User size={15} className="text-white" /> : <Bot size={15} className="text-blue-600" />}
                        </div>

                        <div className={`relative group/msg max-w-[88%] rounded-2xl p-4 shadow-sm ${msg.type === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm text-xs sm:text-[13px] leading-relaxed'
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                            }`}>
                            
                            {msg.type === 'user' ? (
                                msg.text
                            ) : (
                                <>
                                    <FormattedMessage text={msg.text} onTimestampClick={onTimestampClick} />
                                    
                                    {/* Action Bar */}
                                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100 text-slate-400">
                                        <button
                                            onClick={() => handleCopy(msg.text, idx)}
                                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer py-0.5 px-2 rounded-lg hover:bg-slate-50"
                                            title="Copy answer"
                                        >
                                            {copiedIdx === idx ? (
                                                <>
                                                    <Check size={12} className="text-emerald-500" />
                                                    <span className="text-emerald-600">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} />
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
                    <div className="flex gap-3 animate-in fade-in duration-300">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                            <Bot size={15} className="text-blue-600" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100 flex items-center gap-2 shadow-sm">
                            <div className="flex space-x-1.5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-xs text-slate-400 font-medium ml-1">Analyzing knowledge base...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 sm:p-5 bg-white/70 backdrop-blur-md border-t border-slate-100 relative z-10">
                <div className="relative flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100/60 transition-all shadow-sm">
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-slate-800 px-3.5 placeholder:text-slate-400 h-9"
                        placeholder={files.length > 0 ? "Ask anything about your files..." : "Upload files first to ask questions..."}
                        value={question}
                        disabled={loading}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskPrompt()}
                    />
                    <button
                        onClick={() => handleAskPrompt()}
                        disabled={loading || !question.trim()}
                        className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center shadow-md shadow-blue-600/20 cursor-pointer active:scale-95 shrink-0"
                    >
                        <Send size={16} />
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

