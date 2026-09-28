import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const quickActions = [
  { to: '/materials', title: 'Upload material', desc: 'Paste notes or upload a file', tone: 'bg-brand-50 text-brand-600' },
  { to: '/flashcards', title: 'Practice flashcards', desc: 'Active recall from saved cards', tone: 'bg-emerald-50 text-emerald-600' },
  { to: '/quizzes', title: 'Take a quiz', desc: 'Test your understanding', tone: 'bg-amber-50 text-amber-600' },
  { to: '/study-plans', title: 'Plan my revision', desc: 'Schedule before your exam', tone: 'bg-violet-50 text-violet-600' },
];

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [matRes, planRes] = await Promise.all([
          api.get('/materials'),
          api.get('/ai/study-plan'),
        ]);
        if (!active) return;

        setRecent(matRes.data.materials.slice(0, 4));
        setPlans(planRes.data.plans.slice(0, 2));
        setStats({
          materials: matRes.data.count,
          flashcards: matRes.data.materials.reduce((a, m) => a + (m.flashcardCount || 0), 0),
          summaries: matRes.data.materials.filter((m) => m.hasSummary).length,
          quizzes: matRes.data.materials.filter((m) => m.hasQuiz).length,
          studyPlans: planRes.data.count,
        });
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: 'Study materials', value: stats?.materials ?? 0, tone: 'text-brand-600' },
    { label: 'AI summaries', value: stats?.summaries ?? 0, tone: 'text-emerald-600' },
    { label: 'Flashcards', value: stats?.flashcards ?? 0, tone: 'text-violet-600' },
    { label: 'Quizzes', value: stats?.quizzes ?? 0, tone: 'text-amber-600' },
    { label: 'Study plans', value: stats?.studyPlans ?? 0, tone: 'text-rose-600' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Welcome back</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Hello, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.year} · {user?.department} · {user?.college}
          </p>
        </div>
        {isAdmin && (
          <Link to="/admin" className="btn-secondary">
            Open admin panel
          </Link>
        )}
      </div>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      {loading ? (
        <Spinner label="Loading your dashboard..." />
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            {cards.map((c) => (
              <div key={c.label} className="card p-5">
                <p className={`text-3xl font-extrabold ${c.tone}`}>{c.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{c.label}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-lg font-bold text-slate-900">Quick actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((a) => (
              <button
                key={a.to}
                onClick={() => navigate(a.to)}
                className="card p-5 text-left transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${a.tone}`}>Action</span>
                <p className="mt-3 font-bold text-slate-900">{a.title}</p>
                <p className="mt-1 text-sm text-slate-500">{a.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-slate-900">Recent study material</h2>
                <Link to="/materials" className="text-sm font-semibold text-brand-600 hover:underline">
                  View all
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm text-slate-500">No study material yet.</p>
                  <Link to="/materials" className="btn-primary mt-4">
                    Upload your first material
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recent.map((m) => (
                    <li key={m._id}>
                      <Link to={`/materials/${m._id}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{m.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {m.subject} · {new Date(m.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          {m.hasSummary && <span className="badge bg-emerald-50 text-emerald-700">Summary</span>}
                          {m.flashcardCount > 0 && <span className="badge bg-brand-50 text-brand-700">{m.flashcardCount} cards</span>}
                          {m.hasQuiz && <span className="badge bg-amber-50 text-amber-700">Quiz</span>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-slate-900">Upcoming exams</h2>
                <Link to="/study-plans" className="text-sm font-semibold text-brand-600 hover:underline">
                  Manage
                </Link>
              </div>
              {plans.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm text-slate-500">No study plan created yet.</p>
                  <Link to="/study-plans" className="btn-primary mt-4">Create a plan</Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {plans.map((p) => {
                    const days = Math.max(0, Math.ceil((new Date(p.examDate) - Date.now()) / 86400000));
                    return (
                      <li key={p._id} className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{p.subject}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(p.examDate).toLocaleDateString()} · {p.availableHoursPerDay} hrs/day
                        </p>
                        <span className={`badge mt-2 ${days <= 3 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                          {days} day{days === 1 ? '' : 's'} left
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
