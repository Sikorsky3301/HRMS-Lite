export function Card({ children, className = '', title }) {
  return (
    <div
      className={`bg-white/95 rounded-2xl shadow-md border border-slate-200/80 overflow-hidden backdrop-blur-sm ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-6 text-slate-900">{children}</div>
    </div>
  );
}
