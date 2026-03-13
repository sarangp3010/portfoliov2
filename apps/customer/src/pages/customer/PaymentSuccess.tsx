import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
        <div className="card">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-400 mb-6">
            Your payment has been processed. You'll receive a confirmation email shortly.
          </p>
          {sessionId && (
            <p className="text-xs text-gray-600 font-mono mb-6">Session: {sessionId.slice(-16)}</p>
          )}
          <div className="space-y-3">
            <Link to="/payments" className="btn-primary w-full block py-3">View Payment History</Link>
            <Link to="/dashboard" className="btn-secondary w-full block py-3">Back to Dashboard</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
