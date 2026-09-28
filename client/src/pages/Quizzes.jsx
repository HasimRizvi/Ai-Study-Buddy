import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ai/quizzes');
      setQuizzes(data.quizzes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = (quiz) => {
    setActive(quiz);
    setAnswers(new Array(quiz.questions.length).fill(''));
    setResult(null);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (answers.some((a) => !a)) {
      setError('Please answer all questions before submitting');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await api.post(`/ai/quizzes/${active._id}/submit`, { answers });
      setResult(res.data);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading quizzes..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <button onClick={() => setActive(null)} className={active ? 'text-sm font-semibold text-brand-600 hover:underline' : 'hidden'}>
        &larr; All quizzes
      </button>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      {!active ? (
        <>
          <h1 className="text-3xl font-bold text-slate-900">Quiz Centre</h1>
          <p className="mt-1 text-sm text-slate-500">
            Self-assess your understanding with AI-generated multiple-choice questions.
          </p>

          {quizzes.length === 0 ? (
            <div className="card mt-8 px-6 py-16 text-center">
              <p className="font-semibold text-slate-700">No quizzes yet</p>
              <p className="mt-1 text-sm text-slate-500">Open a study material and generate a quiz to begin.</p>
              <Link to="/materials" className="btn-primary mt-4">Go to study materials</Link>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {quizzes.map((q) => {
                const best = q.attempts.length ? Math.max(...q.attempts.map((a) => a.percentage)) : null;
                return (
                  <div key={q._id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900">{q.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {q.questions.length} questions · {q.materialId?.subject || 'General'} ·{' '}
                        {q.attempts.length} attempt{q.attempts.length === 1 ? '' : 's'}
                        {best !== null && ` · best ${best}%`}
                      </p>
                    </div>
                    <button onClick={() => open(q)} className="btn-primary">
                      {q.attempts.length ? 'Retake quiz' : 'Start quiz'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{active.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{active.questions.length} questions · 1 mark each</p>

          {result ? (
            <div className="mt-8">
              <div className="rounded-2xl bg-slate-900 p-8 text-center text-white">
                <p className="text-sm text-slate-400">Final score</p>
                <p className="mt-2 text-5xl font-extrabold">
                  {result.score}/{result.total}
                </p>
                <p className="mt-2 text-lg text-slate-300">{result.percentage}%</p>
                <p className="mt-1 text-sm text-slate-400">
                  {result.percentage >= 80
                    ? 'Excellent work. You have a strong grasp of this topic.'
                    : result.percentage >= 50
                    ? 'Good attempt. Revise the summary and retake the quiz.'
                    : 'Revise the material carefully and try again.'}
                </p>
              </div>

              <ul className="mt-6 space-y-4">
                {result.results.map((r, i) => (
                  <li key={i} className={`rounded-lg border p-5 ${r.correct ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                    <p className="font-semibold text-slate-800">{i + 1}. {r.question}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Your answer: <span className="font-semibold">{r.yourAnswer || 'Not answered'}</span>
                    </p>
                    {!r.correct && (
                      <p className="text-sm text-slate-600">
                        Correct answer: <span className="font-semibold text-emerald-700">{r.correctAnswer}</span>
                      </p>
                    )}
                    {r.explanation && <p className="mt-1 text-xs text-slate-500">{r.explanation}</p>}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setActive(null)} className="btn-secondary">All quizzes</button>
                <button
                  onClick={() => {
                    setAnswers(new Array(active.questions.length).fill(''));
                    setResult(null);
                  }}
                  className="btn-primary"
                >
                  Retake quiz
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-5">
              {active.questions.map((q, qi) => (
                <div key={qi} className="card p-5">
                  <p className="font-semibold text-slate-800">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm transition ${
                          answers[qi] === opt
                            ? 'border-brand-500 bg-brand-50 font-semibold text-brand-800'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q${qi}`}
                          value={opt}
                          checked={answers[qi] === opt}
                          onChange={() => {
                            const next = [...answers];
                            next[qi] = opt;
                            setAnswers(next);
                          }}
                          className="accent-brand-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={busy} className="btn-primary">
                {busy ? 'Scoring...' : 'Submit answers'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
