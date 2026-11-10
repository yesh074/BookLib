import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Sparkles, ArrowRight, ShieldCheck, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, loginAsDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🎓');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const avatarOptions = ['🎓', '🧠', '📚', '🔬', '🚀', '💻', '💡', '🧙'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your name.');
        await register(name.trim(), email.trim(), password, avatar);
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemo();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Top Header Banner */}
        <div className="p-6 pb-4 bg-gradient-to-br from-indigo-900 via-indigo-950 to-stone-950 text-white relative overflow-hidden">
          {/* Ambient Sheen */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            {/* 3D Mini Book Icon */}
            <div
              className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-lg backdrop-blur-xs"
              style={{
                boxShadow: '0 8px 16px -2px rgba(99, 102, 241, 0.4), inset 2px 0 4px rgba(255,255,255,0.3)',
              }}
            >
              <span>{isRegister ? avatar : '📖'}</span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>BookMind AI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                  Scholar Auth
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                {isRegister ? 'Create your personal learning library account' : 'Welcome back to your knowledge library'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-black/30 p-1 rounded-xl mt-5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                !isRegister ? 'bg-white text-stone-900 font-semibold shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                isRegister ? 'bg-white text-stone-900 font-semibold shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Quick Demo Login Option */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 border border-amber-500/30 dark:border-amber-400/20 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-between group transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span>One-Click Demo Scholar (Alex Rivera)</span>
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Instant Access <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
            <span className="bg-white dark:bg-stone-900 px-3 text-[10px] font-mono text-stone-400 uppercase tracking-widest absolute">
              or continue with email
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* If Register: Name & Avatar */}
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Leonardo da Vinci"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Choose Scholar Avatar
                  </label>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {avatarOptions.map(emoji => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setAvatar(emoji)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                          avatar === emoji
                            ? 'bg-indigo-600 text-white scale-110 shadow-sm'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="scholar@bookmind.ai"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-lg bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Scholar Account' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
