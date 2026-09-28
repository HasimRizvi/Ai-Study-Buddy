import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function Admin() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id, action, payload, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setError('');
    setSuccess('');
    setBusy(`${action}-${id}`);
    try {
      const res = await api.put(`/admin/users/${id}/${action}`, payload);
      setSuccess(res.data.message);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('Delete this user and all of their study material permanently?')) return;
    setError('');
    setSuccess('');
    setBusy(`delete-${id}`);
    try {
      const res = await api.delete(`/admin/users/${id}`);
      setSuccess(res.data.message);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  if (loading) return <Spinner label="Loading admin statistics..." />;

  const stats = data?.stats;

  const cards = [
    { label: 'Registered users', value: stats?.users ?? 0, tone: 'text-brand-600' },
    { label: 'Study materials', value: stats?.materials ?? 0, tone: 'text-slate-700' },
    { label: 'AI summaries', value: stats?.summaries ?? 0, tone: 'text-emerald-600' },
    { label: 'Flashcards', value: stats?.flashcards ?? 0, tone: 'text-violet-600' },
    { label: 'Quizzes', value: stats?.quizzes ?? 0, tone: 'text-amber-600' },
    { label: 'Study plans', value: stats?.studyPlans ?? 0, tone: 'text-rose-600' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="badge bg-amber-100 text-amber-800">Administrator</span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin Control Panel</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage registered users, monitor activity and oversee AI service usage.
          </p>
        </div>
        <button onClick={load} className="btn-secondary">Refresh</button>
      </div>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className={`text-3xl font-extrabold ${c.tone}`}>{c.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">AI service status</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {stats?.aiEngine?.live
              ? 'Live Google Gemini API is connected and generating content.'
              : 'No Gemini key configured - the built-in Offline Demo Engine is serving all AI requests.'}
          </p>
        </div>
        <span className={`badge ${stats?.aiEngine?.live ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
          {stats?.aiEngine?.engine === 'gemini' ? 'Google Gemini' : 'Offline Demo Engine'}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Registered users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last login</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.users || []).map((u) => {
                  const isSelf = u._id === user?.id;
                  return (
                    <tr key={u._id}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-brand-50 text-brand-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-5 py-3">
                        {isSelf ? (
                          <span className="text-xs text-slate-400">Your account</span>
                        ) : (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => act(u._id, 'status', { isActive: !u.isActive })}
                              disabled={busy === `status-${u._id}`}
                              className="btn-ghost px-2 py-1 text-xs"
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => act(u._id, 'role', { role: u.role === 'admin' ? 'student' : 'admin' })}
                              disabled={busy === `role-${u._id}`}
                              className="btn-ghost px-2 py-1 text-xs"
                            >
                              Make {u.role === 'admin' ? 'Student' : 'Admin'}
                            </button>
                            <button
                              onClick={() => removeUser(u._id)}
                              disabled={busy === `delete-${u._id}`}
                              className="btn-ghost px-2 py-1 text-xs text-rose-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Recent system activity</h2>
          </div>
          <ul className="max-h-[520px] divide-y divide-slate-100 overflow-auto">
            {(data?.activities || []).map((a) => (
              <li key={a._id} className="px-5 py-3">
                <p className="text-sm font-semibold text-slate-800">{a.action.replace(/_/g, ' ')}</p>
                <p className="text-xs text-slate-500">
                  {a.userId?.name || 'System'} {a.resource ? `· ${a.resource}` : ''}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{new Date(a.createdAt).toLocaleString()}</p>
              </li>
            ))}
            {(data?.activities || []).length === 0 && (
              <li className="px-5 py-12 text-center text-sm text-slate-500">No activity recorded yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
