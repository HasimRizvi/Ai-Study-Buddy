export default function Spinner({ fullScreen = false, label = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );

  if (!fullScreen) return content;

  return <div className="flex min-h-[70vh] items-center justify-center">{content}</div>;
}
