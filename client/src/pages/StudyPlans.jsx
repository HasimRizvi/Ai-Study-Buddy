import { useEffect, useState } from 'react';
import api from '../services/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const defaultDate = () => {
  const d = new Date(Date.now() + 7 * 86400000);
  return d.toISOString().slice(0, 10);
};

export default function StudyPlans() {
  const [plans, setPlans] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({
    subject: '',
    examDate: defaultDate(),
    availableHoursPerDay: 2,
    weakAreas: '',
    materialId: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [planRes, matRes] = await Promise.all([api.get('/ai/study-plan'), api.get('/materials')]);
      setPlans(planRes.data.plans);
      setMaterials(matRes.data.materials);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const payload = {
        ...form,
        availableHoursPerDay: Number(form.availableHoursPerDay),
        weakAreas: form.weakAreas,
        materialId: form.materialId || undefined,
      };
      const { data } = await api.post('/ai/study-plan', payload);
      setSuccess(data.message);
      setForm({ ...form, subject: '', weakAreas: '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this study plan?')) return;
    try {
      await api.delete(`/ai/study-plan/${id}`);
      setSuccess('Study plan deleted');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner label="Loading study plans..." />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Personalised Study Plans</h1>
      <p className="mt-1 text-sm text-slate-500">
        Give the AI your exam date and available hours, and it will build a day-by-day revision schedule.
      </p>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <form onSubmit={submit} className="card mt-6 grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label" htmlFor="sp-subject">Subject</label>
          <input
            id="sp-subject"
            className="input"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="e.g. Data Structures"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="sp-date">Exam date</label>
          <input
            id="sp-date"
            type="date"
            className="input"
            value={form.examDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="sp-hours">Hours available per day</label>
          <input
            id="sp-hours"
            type="number"
            min="0.5"
            max="16"
            step="0.5"
            className="input"
            value={form.availableHoursPerDay}
            onChange={(e) => setForm({ ...form, availableHoursPerDay: e.target.value })}
            required
          />
        </div>

        <div className="lg:col-span-2">
          <label className="label" htmlFor="sp-weak">Weak areas (comma separated, optional)</label>
          <input
            id="sp-weak"
            className="input"
            value={form.weakAreas}
            onChange={(e) => setForm({ ...form, weakAreas: e.target.value })}
            placeholder="e.g. Recursion, Graph traversal, Time complexity"
          />
        </div>

        <div>
          <label className="label" htmlFor="sp-material">Link study material (optional)</label>
          <select
            id="sp-material"
            className="input"
            value={form.materialId}
            onChange={(e) => setForm({ ...form, materialId: e.target.value })}
          >
            <option value="">No material linked</option>
            {materials.map((m) => (
              <option key={m._id} value={m._id}>
                {m.subject} - {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3">
          <button disabled={busy} className="btn-primary">
            {busy ? 'Building your plan...' : 'Generate study plan'}
          </button>
        </div>
      </form>

      {plans.length === 0 ? (
        <div className="card mt-8 px-6 py-16 text-center">
          <p className="font-semibold text-slate-700">No study plans yet</p>
          <p className="mt-1 text-sm text-slate-500">Fill the form above to generate your first revision schedule.</p>
        </div>
      ) : (
        <div className="mt-10 space-y-5">
          {plans.map((p) => {
            const days = Math.max(0, Math.ceil((new Date(p.examDate) - Date.now()) / 86400000));
            const isOpen = expanded === p._id;
            return (
              <div key={p._id} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{p.subject}</h2>
                      <span className={`badge ${days <= 3 ? 'bg-rose-50 text-rose-700' : days <= 7 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {days} day{days === 1 ? '' : 's'} to exam
                      </span>
                      <span className="badge bg-slate-100 text-slate-600">
                        {p.generatedBy === 'gemini' ? 'Google Gemini' : 'Offline Demo Engine'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Exam on {new Date(p.examDate).toLocaleDateString()} · {p.availableHoursPerDay} hrs/day ·{' '}
                      {p.dailyTasks.length} daily task{p.dailyTasks.length === 1 ? '' : 's'}
                    </p>
                    {p.weakAreas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.weakAreas.map((w) => (
                          <span key={w} className="badge bg-brand-50 text-brand-700">{w}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setExpanded(isOpen ? null : p._id)} className="btn-secondary text-xs">
                      {isOpen ? 'Hide plan' : 'View plan'}
                    </button>
                    <button onClick={() => remove(p._id)} className="btn-ghost text-xs text-rose-600">Delete</button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Full schedule</h3>
                      <pre className="mt-2 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-200">
                        {p.studyPlan}
                      </pre>
                    </div>

                    {p.dailyTasks.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Day-by-day tasks</h3>
                        <ul className="mt-2 max-h-[420px] space-y-2 overflow-auto pr-1">
                          {p.dailyTasks.map((d) => (
                            <li key={d.day} className="rounded-lg border border-slate-200 p-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-800">Day {d.day}</p>
                                {d.duration && <span className="badge bg-slate-100 text-slate-600">{d.duration}</span>}
                              </div>
                              {d.date && (
                                <p className="text-xs text-slate-400">{new Date(d.date).toLocaleDateString()}</p>
                              )}
                              <p className="mt-1 text-sm font-medium text-brand-700">{d.focus}</p>
                              <ul className="mt-1.5 space-y-1">
                                {(d.tasks || []).map((t, i) => (
                                  <li key={i} className="flex gap-2 text-xs text-slate-600">
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                                    {t}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
