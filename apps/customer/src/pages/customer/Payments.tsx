import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCustomerPayments, getPaymentReceipt } from '../../api';
import { Payment } from '../../types';

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const statusColor: Record<string, string> = {
  COMPLETED: 'badge-green', PENDING: 'badge-yellow', FAILED: 'badge-red',
  CANCELLED: 'badge-gray', REFUNDED: 'badge-blue',
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCustomerPayments(page)
      .then(r => {
        setPayments(r.data.data.payments || []);
        setTotal(r.data.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const handleReceipt = async (payment: Payment) => {
    if (payment.status !== 'COMPLETED') return;
    setDownloading(payment.id);
    try {
      const r = await getPaymentReceipt(payment.id);
      const blob = new Blob([JSON.stringify(r.data.data, null, 2)], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${payment.id.slice(-8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not download receipt');
    } finally {
      setDownloading(null);
    }
  };

  const totalSpent = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const perPage = 10;
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment History</h1>
        <p className="text-gray-400 mt-1">All your transactions and receipts.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-2xl font-bold text-green-400">{fmt(totalSpent)}</p>
          <p className="text-gray-500 text-xs mt-1">Total Spent</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-gray-500 text-xs mt-1">Total Transactions</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-blue-400">{payments.filter(p => p.status === 'COMPLETED').length}</p>
          <p className="text-gray-500 text-xs mt-1">Successful</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">💳</p>
            <p className="text-gray-400">No payments yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-4 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs text-gray-500 font-medium uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="px-6 py-4 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm text-white font-medium">{p.serviceName || p.description || 'Service'}</p>
                    <p className="text-xs text-gray-500 font-mono">{p.stripeSessionId?.slice(-12)}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <p className="text-sm text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusColor[p.status] || 'badge-gray'}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-white">{fmt(p.amount)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleReceipt(p)}
                        disabled={downloading === p.id}
                        className="text-indigo-400 hover:text-indigo-300 text-xs disabled:opacity-50"
                      >
                        {downloading === p.id ? '…' : '⬇ PDF'}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
