import { useState } from "react";
import axios from "axios";

import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

function Auth({ onLoginSuccess }) {

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" })
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
        <div className="max-w-md w-full mx-auto bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-2xl font-bold text-white mb-2 text-center">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-center mb-8 text-sm">
                {isLogin ? 'Enter your credentials to access your workspace.' : 'Sign up to start analyzing your documents.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative group">
                        <Mail size={16} className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-slate-900/80 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wider">Password</label>
                    <div className="relative group">
                        <Lock size={16} className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full bg-slate-900/80 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {error && (
                    <div className={`p-3 border rounded-lg text-xs text-center ${error.includes("successful")
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                    {!loading && <ArrowRight size={16} />}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-slate-500">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                >
                    {isLogin ? 'Sign Up' : 'Log In'}
                </button>
            </div>
        </div>
    );
}

export default Auth;
