export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <div className={`${s} border-2 border-slate-700 border-t-accent rounded-full animate-spin`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-surface-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm font-mono">Loading...</p>
    </div>
  </div>
);
