import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerAuth } from '../../context/AuthContext';
import { PUBLIC_URL } from '../../config/urls';

const navItems = [
  { to: '/dashboard',       label: 'Dashboard',        icon: '⊞' },
  { to: '/services',        label: 'Services',          icon: '💼' },
  { to: '/payments',        label: 'Payments',          icon: '💳' },
  { to: '/payment-methods', label: 'Payment Methods',   icon: '🪙' },
  { to: '/contact-admin',   label: 'Contact Admin',     icon: '💬' },
  { to: '/profile',         label: 'Profile',           icon: '👤' },
];

export const CustomerLayout = () => {
  const { customer, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = customer?.name
    ? customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'CP';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-none truncate">{customer?.name}</p>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{customer?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <a
          href={PUBLIC_URL}
          target="_blank"
          rel="noreferrer"
          className="nav-link"
        >
          <span className="text-base">🌐</span>
          <span>Public Site</span>
        </a>
        <button
          onClick={handleSignOut}
          className="nav-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <span className="text-base">⏻</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-gray-900 border-r border-gray-800 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 z-50 lg:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center px-4 gap-4 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div className="text-sm font-medium text-gray-300 lg:hidden">Customer Portal</div>
          <div className="flex-1" />
          <span className="text-gray-500 text-xs font-mono hidden sm:block">{customer?.email}</span>
          <span className="badge badge-blue">Customer</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
