import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { login } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await login(email, password);
      const { token, user } = r.data.data;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      setUser(user);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Admin Login</title></Helmet>
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.06) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-5">
              <span className="text-2xl">🔒</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-slate-500 text-sm">Sign in with your admin credentials</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="admin@portfolio.dev" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
          </div>
          <p className="text-center text-slate-600 text-xs mt-6">
            Protected admin area. Unauthorized access prohibited.
          </p>
        </motion.div>
      </div>
    </>
  );
}
