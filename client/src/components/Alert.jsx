export default function Alert({ type = 'error', children, onClose }) {
  if (!children) return null;

  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info: 'bg-brand-50 border-brand-200 text-brand-800',
  };

  return (
    <div className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      <span className="leading-relaxed">{children}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 font-bold opacity-60 transition hover:opacity-100" aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
