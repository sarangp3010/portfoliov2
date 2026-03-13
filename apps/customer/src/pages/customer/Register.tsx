import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { customerRegister, getOAuthUrl } from '../../api';
import { useCustomerAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useCustomerAuth();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, ...(form.phone ? { phone: form.phone } : {}) };
      const r = await customerRegister(payload);
      signIn(r.data.data.token, r.data.data.customer);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'microsoft') => {
    try {
      const r = await getOAuthUrl(provider);
      window.location.href = r.data.data.url;
    } catch {
      setError(`Failed to connect to ${provider}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-1">Start working with us today</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} className="input" placeholder="John Doe" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={set('password')} className="input" placeholder="Min. 8 characters" required />
            </div>
            <div>
              <label className="label">Phone <span className="text-gray-600">(optional – for SMS notifications)</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')} className="input" placeholder="+1 555 000 0000" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">or sign up with</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['google', 'github', 'microsoft'] as const).map(provider => (
              <button key={provider} onClick={() => handleOAuth(provider)}
                className="flex items-center justify-center gap-2 p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-300 hover:text-white">
                <span>{provider === 'google' ? '🔵' : provider === 'github' ? '⬛' : '🟦'}</span>
                <span className="capitalize">{provider}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
