import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Loader2, Play, Bot, User } from 'lucide-react';

function Chatbot({ token, onTimestampClick }) {
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
        <div className="flex flex-col h-[600px] bg-slate-900 rounded-2xl shadow-xl border border-white/10 overflow-hidden ring-1 ring-white/5">
         
            <div className="p-4 bg-slate-800/80 border-b border-white/10 flex items-center gap-3 backdrop-blur-sm">
                <div className="bg-gradient-to-tr from-blue-500 to-cyan-500 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                    <Bot size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-100">AI Assistant</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 opacity-50">
                        <Bot size={48} className="text-slate-700" />
                        <p className="text-sm">Ask anything about your file...</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'user' ? 'bg-indigo-600' : 'bg-slate-700'
                            }`}>
                            {msg.type === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-blue-300" />}
                        </div>

                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'
                            }`}>
                            {msg.type === 'user' ? msg.text : renderMessage(msg.text)}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                            <Bot size={14} className="text-blue-300" />
                        </div>
                        <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-5 py-3 border border-white/5 flex items-center gap-2">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900 border-t border-white/10">
                <div className="relative flex items-center gap-2 bg-slate-800 rounded-xl p-1.5 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all shadow-inner">
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-200 px-4 placeholder:text-slate-500 h-10"
                        placeholder="Type your question..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    />
                    <button
                        onClick={handleAsk}
                        disabled={loading || !question.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chatbot;
