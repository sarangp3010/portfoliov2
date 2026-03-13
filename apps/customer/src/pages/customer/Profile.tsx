import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useCustomerAuth } from '../../context/AuthContext';
import { updateCustomerProfile } from '../../api';

export default function Profile() {
  const { customer, refresh } = useCustomerAuth();
  const [form, setForm] = useState({ name: customer?.name || '', phone: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: { name?: string; phone?: string } = {};
      if (form.name !== customer?.name) payload.name = form.name;
      if (form.phone) payload.phone = form.phone;
      if (Object.keys(payload).length === 0) { setSaved(true); setLoading(false); return; }
      await updateCustomerProfile(payload);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = customer?.name
    ? customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'CP';

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account settings.</p>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
          {initials}
        </div>
        <div>
          <p className="text-white font-semibold">{customer?.name}</p>
          <p className="text-gray-400 text-sm">{customer?.email}</p>
          <span className="badge badge-blue mt-1">{customer?.provider || 'local'}</span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
        )}
        {saved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            ✓ Profile updated successfully
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={form.name} onChange={set('name')} className="input" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={customer?.email || ''} className="input opacity-60 cursor-not-allowed" disabled />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="label">Phone <span className="text-gray-600">(for SMS notifications)</span></label>
            <input type="tel" value={form.phone} onChange={set('phone')} className="input" placeholder={customer?.phone || '+1 555 000 0000'} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
