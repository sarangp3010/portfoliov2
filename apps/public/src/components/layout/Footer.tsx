import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="border-t border-slate-800/50 py-12 mt-auto">
    <div className="container-max flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-white">
          <span className="text-accent">&lt;</span>Dev<span className="text-accent">/&gt;</span>
        </span>
        <span className="text-slate-600 text-sm">Full-Stack Engineer</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-slate-500">
        {[['/', 'Profile'], ['/blog', 'Blog'], ['/services', 'Services'], ['/resume', 'Resume']].map(([to, label]) => (
          <Link key={to} to={to} className="hover:text-accent transition-colors">{label}</Link>
        ))}
      </div>
      <p className="text-slate-600 text-xs font-mono">© {new Date().getFullYear()}</p>
    </div>
  </footer>
);
