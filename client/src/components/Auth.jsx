import { useState } from "react";
import axios from "axios";
import { Mail, Lock, ArrowRight, Loader2, X } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../config";

function Auth({ onLoginSuccess, initialIsLogin = true, onClose }) {
    const { success, error: toastError } = useToast();
    const [isLogin, setIsLogin] = useState(initialIsLogin);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const cleanEmail = formData.email.trim();
            if (isLogin) {
                const params = new URLSearchParams();
                params.append('username', cleanEmail);
                params.append('password', formData.password);

                const response = await axios.post(`${API_BASE_URL}/auth/token`, params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                success("Welcome to DocuMind! Loading your workspace...", "Signed In");
                onLoginSuccess(`Bearer ${response.data.access_token}`);
            } else {
                await axios.post(`${API_BASE_URL}/auth/register`, {
                    email: cleanEmail,
                    password: formData.password
                });

                setIsLogin(true);
                setFormData(prev => ({ ...prev, password: '' }));
                success("Account created successfully! Please sign in with your password.", "Registration Complete");
                return;
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || err.message || "Authentication failed.";
            setError(msg);
            toastError(msg, isLogin ? "Sign In Failed" : "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto p-7 sm:p-8 rounded-3xl border-shining-dark-blue-strong relative overflow-hidden animate-in fade-in zoom-in duration-500" style={{ background: 'rgba(15,22,36,0.95)', backdropFilter: 'blur(20px)' }}>
            {onClose && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 sm:p-2.5 rounded-2xl text-[#8899bb] hover:text-white hover:bg-blue-600/20 hover:border-blue-500/50 active:scale-90 transition-all cursor-pointer z-50 border border-blue-900/40 shadow-lg"
                    style={{ background: 'rgba(22,31,51,0.9)' }}
                    aria-label="Close auth dialog"
                    title="Close"
                >
                    <X size={18} />
                </button>
            )}
            {/* Subtle decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />

            <div className="text-center mb-6 relative z-10">
                <h2 className="text-xl sm:text-2xl font-black text-[#f0f4ff] mb-1.5 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-[#8899bb] text-xs sm:text-sm font-medium">
                    {isLogin ? 'Enter your credentials to access your workspace.' : 'Sign up to start analyzing your documents.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
                <div className="space-y-1">
                    <label className="block text-[#f0f4ff] text-xs font-bold uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8899bb] group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full border-2 border-blue-900/40 rounded-2xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-[#f0f4ff] focus:outline-none focus:border-blue-500/70 focus:shadow-[0_0_15px_rgba(37,99,235,0.25)] transition-all placeholder:text-[#8899bb]/50"
                            style={{ background: '#050810', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-[#f0f4ff] text-xs font-bold uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8899bb] group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full border-2 border-blue-900/40 rounded-2xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-[#f0f4ff] focus:outline-none focus:border-blue-500/70 focus:shadow-[0_0_15px_rgba(37,99,235,0.25)] transition-all placeholder:text-[#8899bb]/50"
                            style={{ background: '#050810', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 border-2 rounded-2xl text-xs font-semibold text-center animate-in fade-in slide-in-from-top-2 border-rose-500/30 text-rose-300"
                        style={{ background: 'rgba(244,63,94,0.1)' }}>
                        <p>{error}</p>
                        {!isLogin && error.toLowerCase().includes("already exists") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(true);
                                    setError("");
                                }}
                                className="mt-1.5 inline-block text-blue-400 hover:text-blue-300 underline font-bold cursor-pointer"
                            >
                                Click here to Sign In instead
                            </button>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2 border border-blue-500/50"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Get Started')}
                    {!loading && <ArrowRight size={16} />}
                </button>
            </form>

            <div className="mt-5 text-center text-xs relative z-10">
                <span className="text-[#8899bb] font-medium">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                >
                    {isLogin ? 'Sign Up Free' : 'Sign In'}
                </button>
            </div>
        </div>
    );
}

export default Auth;




