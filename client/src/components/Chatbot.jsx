import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Loader2, Play, Bot, User, Info, RotateCcw } from 'lucide-react';

function Chatbot({ token, onTimestampClick, files = [] }) {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleNewChat = () => {
        if (messages.length > 0) {
            setMessages([]);
            setQuestion('');
        }
    };

    const handleAsk = async () => {
        if (!question.trim()) return;

        const userMsg = { type: 'user', text: question };
        setMessages(prev => [...prev, userMsg]);
        setQuestion('');
        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:8000/chat/',
                { question: userMsg.text },
                { headers: { Authorization: token } }
            );
            const botMsg = { type: 'bot', text: response.data.answer };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Is the backend running?' }]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = (text) => {
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
                    onClick={() => onTimestampClick(totalSeconds)}
                    className="inline-flex items-center mx-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-semibold border border-blue-500/30 transition-colors cursor-pointer"
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

    return (
        <div className="flex flex-col h-[650px] bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-blue-50/50 overflow-hidden relative group">
            
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent pointer-events-none" />

            <div className="p-5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-inner">
                        <Bot size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight">AI Analyst</h3>
                        <p className="text-[10px] text-blue-100 flex items-center gap-1 font-bold uppercase tracking-widest opacity-80">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live Now
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleNewChat}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-white cursor-pointer group/btn"
                        title="New Chat"
                    >
                        <RotateCcw size={16} className="group-hover/btn:rotate-[-45deg] transition-transform" />
                    </button>
                    {files.length > 1 && (
                        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Multi-Doc</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent relative z-10 scrollbar-thin scrollbar-thumb-blue-100 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center border border-blue-100 animate-pulse">
                            <Bot size={40} className="text-blue-200" />
                        </div>
                        <div className="text-center space-y-3">
                             <p className="text-lg font-bold text-slate-800">
                                 {files.length > 1 ? "Ready for Comparison" : "How can I help?"}
                             </p>
                             <p className="text-sm text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                                 {files.length > 1 
                                     ? `I've analyzed your ${files.length} documents. Ask me to compare or find data across them.` 
                                     : "Ask anything about your document, audio, or video files."}
                             </p>
                        </div>
                        
                        {files.length > 1 && (
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl max-w-[260px] shadow-lg shadow-blue-600/20 transform hover:-translate-y-1 transition-transform">
                                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Info size={12} /> Expert Suggestion
                                </p>
                                <p className="text-xs text-white leading-relaxed">
                                    "Explain the main differences between all uploaded files."
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.type === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-white border border-slate-100'
                            }`}>
                            {msg.type === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-blue-600" />}
                        </div>

                        <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[13px] leading-relaxed shadow-sm ${msg.type === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                            }`}>
                            {msg.type === 'user' ? msg.text : renderMessage(msg.text)}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3 animate-in fade-in duration-300">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                            <Bot size={16} className="text-blue-600" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3.5 border border-slate-100 flex items-center gap-2 shadow-sm">
                            <div className="flex space-x-1.5">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white/50 backdrop-blur-md border-t border-slate-100 relative z-10">
                <div className="relative flex items-center gap-2 bg-white rounded-2xl p-2 border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all shadow-sm">
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-700 px-4 placeholder:text-slate-400 h-10"
                        placeholder="Type your question..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    />
                    <button
                        onClick={handleAsk}
                        disabled={loading || !question.trim()}
                        className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chatbot;
