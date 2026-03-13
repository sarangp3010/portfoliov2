/**
 * NOTE: This Navbar/PublicLayout is a monolith remnant in the admin app.
 * It is not mounted by App.tsx — the admin app uses AdminLayout exclusively.
 * Kept for reference only.
 */
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PUBLIC_URL } from '../../config/urls';

const links = [
  { to: '/', label: 'Profile' },
  { to: '/blog', label: 'Blog' },
  { to: '/services', label: 'Services' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/resume', label: 'Resume' },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-surface-950/90 backdrop-blur-xl border-b border-slate-800/50 shadow-xl shadow-black/20' : 'bg-transparent'}`}>
        <div className="container-max flex items-center justify-between h-16">
          <a href={PUBLIC_URL} className="font-display font-bold text-xl text-white group">
            <span className="text-accent">&lt;</span>
            <span>Dev</span>
            <span className="text-accent">/&gt;</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'text-accent bg-accent/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Already on admin subdomain — no cross-app link needed */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <motion.svg animate={{ rotate: open ? 90 : 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </motion.svg>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 inset-x-0 z-40 bg-surface-950/98 backdrop-blur-xl border-b border-slate-800 p-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'text-accent bg-accent/10' : 'text-slate-400'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
