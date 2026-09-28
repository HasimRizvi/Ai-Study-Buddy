import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('text');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const [textForm, setTextForm] = useState({ title: '', subject: '', content: '' });
  const [fileForm, setFileForm] = useState({ title: '', subject: '', file: null });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/materials');
      setMaterials(data.materials);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitText = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const { data } = await api.post('/materials', textForm);
      setTextForm({ title: '', subject: '', content: '' });
      setSuccess(data.message);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitFile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fileForm.file) {
      setError('Please choose a file to upload');
      return;
    }

    const fd = new FormData();
    fd.append('title', fileForm.title || fileForm.file.name);
    fd.append('subject', fileForm.subject);
    fd.append('file', fileForm.file);

    setBusy(true);
    try {
      const { data } = await api.post('/materials/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileForm({ title: '', subject: '', file: null });
      setSuccess(data.message);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this study material and all its AI resources?')) return;
    try {
      await api.delete(`/materials/${id}`);
      setSuccess('Study material deleted');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = materials.filter((m) =>
    search ? `${m.title} ${m.subject}`.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Study Materials</h1>
      <p className="mt-1 text-sm text-slate-500">
        Add your notes once, then generate summaries, flashcards, quizzes and study plans from them.
      </p>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <div className="card mt-6 p-6">
        <div className="flex gap-1 border-b border-slate-200">
          {[
            { key: 'text', label: 'Paste text' },
            { key: 'file', label: 'Upload file' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === t.key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'text' ? (
          <form onSubmit={submitText} className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="t-title">Title</label>
                <input
                  id="t-title"
                  className="input"
                  value={textForm.title}
                  onChange={(e) => setTextForm({ ...textForm, title: e.target.value })}
                  placeholder="e.g. Photosynthesis - Biology"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="t-subject">Subject</label>
                <input
                  id="t-subject"
                  className="input"
                  value={textForm.subject}
                  onChange={(e) => setTextForm({ ...textForm, subject: e.target.value })}
                  placeholder="e.g. Biology"
                  required
                />
              </div>
              <p className="text-xs text-slate-400">
                Minimum 30 characters. Longer material produces better AI output.
              </p>
            </div>

            <div className="lg:col-span-2">
              <label className="label" htmlFor="t-content">Content</label>
              <textarea
                id="t-content"
                className="input h-56 resize-y font-mono text-[13px] leading-relaxed"
                value={textForm.content}
                onChange={(e) => setTextForm({ ...textForm, content: e.target.value })}
                placeholder="Paste your lecture notes, textbook paragraphs or article text here..."
                required
              />
            </div>

            <div className="lg:col-span-3">
              <button disabled={busy} className="btn-primary">
                {busy ? 'Saving...' : 'Save study material'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitFile} className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="f-title">Title (optional)</label>
              <input
                id="f-title"
                className="input"
                value={fileForm.title}
                onChange={(e) => setFileForm({ ...fileForm, title: e.target.value })}
                placeholder="Defaults to file name"
              />
            </div>
            <div>
              <label className="label" htmlFor="f-subject">Subject</label>
              <input
                id="f-subject"
                className="input"
                value={fileForm.subject}
                onChange={(e) => setFileForm({ ...fileForm, subject: e.target.value })}
                placeholder="e.g. Computer Science"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="f-file">File</label>
              <input
                id="f-file"
                type="file"
                accept=".txt,.md,.csv,.json"
                className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-700"
                onChange={(e) => setFileForm({ ...fileForm, file: e.target.files[0] })}
                required
              />
            </div>
            <div className="sm:col-span-3">
              <p className="text-xs text-slate-400">Supported formats: .txt, .md, .csv, .json · Max 5 MB</p>
              <button disabled={busy} className="btn-primary mt-3">
                {busy ? 'Uploading...' : 'Upload file'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Your library <span className="text-sm font-medium text-slate-400">({filtered.length})</span>
        </h2>
        <input
          className="input sm:max-w-xs"
          placeholder="Search by title or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner label="Loading your library..." />
      ) : filtered.length === 0 ? (
        <div className="card mt-6 px-6 py-16 text-center">
          <p className="font-semibold text-slate-700">No study material found</p>
          <p className="mt-1 text-sm text-slate-500">Add your first material above to unlock AI features.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <div key={m._id} className="card flex flex-col p-5 transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="badge bg-brand-50 text-brand-700">{m.subject}</span>
                  <h3 className="mt-2 truncate font-bold text-slate-900">{m.title}</h3>
                </div>
                <button
                  onClick={() => remove(m._id)}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {m.content.slice(0, 140)}...
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.hasSummary && <span className="badge bg-emerald-50 text-emerald-700">Summary</span>}
                {m.flashcardCount > 0 && <span className="badge bg-violet-50 text-violet-700">{m.flashcardCount} cards</span>}
                {m.hasQuiz && <span className="badge bg-amber-50 text-amber-700">Quiz</span>}
                {m.sourceType === 'file' && <span className="badge bg-slate-100 text-slate-600">{m.fileName}</span>}
              </div>

              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-xs text-slate-400">
                  {new Date(m.createdAt).toLocaleDateString()} · {m.content.length} chars
                </span>
                <Link to={`/materials/${m._id}`} className="btn-primary py-1.5 text-xs">
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
