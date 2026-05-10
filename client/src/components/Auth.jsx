import { useState } from "react";
import axios from "axios";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
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
            if (isLogin) {
                const params = new URLSearchParams();
                params.append('username', formData.email);
                params.append('password', formData.password);

                const response = await axios.post('http://localhost:8000/auth/token', params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                onLoginSuccess(`Bearer ${response.data.access_token}`);
            } else {
                await axios.post('http://localhost:8000/auth/register', {
                    email: formData.email,
                    password: formData.password
                });

                setIsLogin(true);
                setFormData(prev => ({ ...prev, password: '' }));
                setError("Registration successful! Please sign in.");
                return;
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || err.message || "Authentication failed.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-blue-100 shadow-2xl shadow-blue-600/5 relative overflow-hidden animate-in fade-in zoom-in duration-500">
            {/* Subtle decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                    {isLogin ? 'Enter your credentials to access your workspace.' : 'Sign up to start analyzing your documents.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {error && (
                    <div className={`p-4 border-2 rounded-2xl text-sm font-semibold text-center animate-in fade-in slide-in-from-top-2 ${error.includes("successful")
                        ? "bg-green-50 border-green-100 text-green-600"
                        : "bg-red-50 border-red-100 text-red-600"
                        }`}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Get Started')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="mt-8 text-center text-sm">
                <span className="text-slate-500 font-medium">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                >
                    {isLogin ? 'Sign Up Free' : 'Sign In'}
                </button>
            </div>
        </div>
    );
}

export default Auth;

