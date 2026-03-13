import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCustomerPayments, getServicePlans, getDevProfile } from '../../api';
import { Payment, ServicePlan } from '../../types';
import { useCustomerAuth } from '../../context/AuthContext';
import { PUBLIC_URL } from '../../config/urls';

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const statusColor: Record<string, string> = {
  COMPLETED: 'badge-green', PENDING: 'badge-yellow', FAILED: 'badge-red',
  CANCELLED: 'badge-gray', REFUNDED: 'badge-blue',
};

export default function Dashboard() {
  const { customer } = useCustomerAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [devProfile, setDevProfile] = useState<{ githubUrl?: string; linkedinUrl?: string; websiteUrl?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCustomerPayments(1).then(r => setPayments(r.data.data.payments || [])),
      getServicePlans().then(r => setPlans(r.data.data || [])),
      getDevProfile().then(r => setDevProfile(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const totalSpend = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const completedCount = payments.filter(p => p.status === 'COMPLETED').length;
  const recentPayments = payments.slice(0, 5);

  const stats = [
    { label: 'Total Spent', value: fmt(totalSpend), icon: '💰', color: 'text-green-400' },
    { label: 'Payments', value: completedCount, icon: '💳', color: 'text-blue-400' },
    { label: 'Services Available', value: plans.length, icon: '💼', color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Welcome back, {customer?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 mt-1">Here's an overview of your account.</p>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-800" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Payments</h2>
            <Link to="/payments" className="text-indigo-400 hover:text-indigo-300 text-sm">View all →</Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No payments yet. <Link to="/services" className="text-indigo-400 hover:underline">Browse services →</Link></p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium truncate max-w-[180px]">{p.serviceName || p.description || 'Service'}</p>
                    <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${statusColor[p.status] || 'badge-gray'}`}>{p.status}</span>
                    <span className="text-sm font-semibold text-white">{fmt(p.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links + Dev Profile */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/services" className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <span>💼</span><span className="text-sm text-gray-200">Browse Service Plans</span>
              </Link>
              <Link to="/payments" className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <span>📋</span><span className="text-sm text-gray-200">Payment History</span>
              </Link>
              <Link to="/contact-admin" className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <span>✉️</span><span className="text-sm text-gray-200">Contact Admin</span>
              </Link>
            </div>
          </div>

          {devProfile && (
            <div className="card">
              <h2 className="font-semibold text-white mb-3">Developer Links</h2>
              <div className="flex flex-wrap gap-2">
                {/* View Portfolio — cross-app link to public subdomain */}
                <a href={PUBLIC_URL}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-sm text-indigo-300 hover:text-white transition-colors">
                  <span>🌐</span> View Portfolio
                </a>
                {devProfile.githubUrl && (
                  <a href={devProfile.githubUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
                    <span>⬛</span> GitHub
                  </a>
                )}
                {devProfile.linkedinUrl && (
                  <a href={devProfile.linkedinUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
                    <span>🔵</span> LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
