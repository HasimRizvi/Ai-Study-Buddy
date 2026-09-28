import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const AI_ACTIONS = [
  {
    key: 'summary',
    label: 'Generate Summary',
    body: {},
    desc: 'Concise revision summary with key points',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    key: 'flashcards',
    label: 'Generate Flashcards',
    body: { count: 8 },
    desc: '8 question-answer cards for recall',
    tone: 'bg-brand-50 text-brand-700 border-brand-200',
  },
  {
    key: 'quiz',
    label: 'Generate Quiz',
    body: { count: 5 },
    desc: '5 MCQs with instant scoring',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
];

export default function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/materials/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const runAI = async (action) => {
    setError('');
    setSuccess('');
    setBusy(action.key);
    try {
      if (action.key === 'summary') {
        const res = await api.post(`/ai/materials/${id}/summarize`);
        setSuccess(res.data.message);
        await load();
      } else if (action.key === 'flashcards') {
        const res = await api.post(`/ai/materials/${id}/flashcards`, action.body);
        setSuccess(res.data.message);
        setFlashIndex(0);
        setFlipped(false);
        await load();
      } else {
        const res = await api.post(`/ai/materials/${id}/quiz`, action.body);
        setSuccess(res.data.message);
        setQuiz(res.data.quiz);
        setAnswers(new Array(res.data.quiz.questions.length).fill(''));
        setResult(null);
        await load();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    if (answers.some((a) => !a)) {
      setError('Please answer every question before submitting');
      return;
    }
    setError('');
    setBusy('submit');
    try {
      const res = await api.post(`/ai/quizzes/${quiz._id}/submit`, { answers });
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  if (loading) return <Spinner label="Loading material..." />;

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-semibold text-slate-700">Material not found</p>
        <Link to="/materials" className="btn-primary mt-4">Back to library</Link>
      </div>
    );
  }

  const { material, summary, flashcards, quizzes } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/materials')} className="text-sm font-semibold text-brand-600 hover:underline">
        &larr; Back to library
      </button>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="badge bg-brand-50 text-brand-700">{material.subject}</span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{material.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {material.content.length} characters · uploaded {new Date(material.createdAt).toLocaleDateString()}
            {material.fileName && ` · ${material.fileName}`}
          </p>
        </div>
      </div>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-slate-900">Original content</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{material.content}</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-slate-900">AI actions</h2>
          {AI_ACTIONS.map((a) => (
            <button
              key={a.key}
              onClick={() => runAI(a)}
              disabled={busy === a.key}
              className={`w-full rounded-xl border p-4 text-left transition hover:shadow-sm disabled:opacity-60 ${a.tone}`}
            >
              <p className="font-bold">{busy === a.key ? 'Generating...' : a.label}</p>
              <p className="mt-0.5 text-xs opacity-80">{a.desc}</p>
            </button>
          ))}

          <div className="card p-4 text-xs leading-relaxed text-slate-500">
            <p className="font-bold text-slate-700">How it works</p>
            <p className="mt-1">
              Your material is sent to the Google Gemini model through a dedicated AI service layer. Every
              generated resource is saved to your account for future revision.
            </p>
          </div>
        </div>
      </div>

      {summary && (
        <section className="card mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">AI Summary</h2>
            <span className="badge bg-emerald-50 text-emerald-700">
              {summary.generatedBy === 'gemini' ? 'Google Gemini' : 'Offline Demo Engine'}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{summary.summary}</p>

          {summary.keyPoints?.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-bold text-slate-800">Key points to remember</h3>
              <ul className="mt-2 space-y-1.5">
                {summary.keyPoints.map((k, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {k}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-xs text-slate-400">
            Generated {new Date(summary.createdAt).toLocaleString()}
          </p>
        </section>
      )}

      {flashcards.length > 0 && (
        <section className="card mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Flashcards ({flashcards.length})</h2>
            <span className="text-xs text-slate-400">
              Card {flashIndex + 1} of {flashcards.length}
            </span>
          </div>

          <div
            onClick={() => setFlipped((v) => !v)}
            className="mt-4 cursor-pointer rounded-xl border border-brand-200 bg-brand-50 p-8 text-center transition hover:bg-brand-100"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-brand-500">
              {flipped ? 'Answer' : 'Question'}
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-800">
              {flipped ? flashcards[flashIndex].answer : flashcards[flashIndex].question}
            </p>
            <p className="mt-4 text-xs text-slate-500">Click to flip</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => {
                setFlashIndex((i) => Math.max(0, i - 1));
                setFlipped(false);
              }}
              disabled={flashIndex === 0}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className={`badge ${flashcards[flashIndex].difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' : flashcards[flashIndex].difficulty === 'Hard' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
              {flashcards[flashIndex].difficulty}
            </span>
            <button
              onClick={() => {
                setFlashIndex((i) => Math.min(flashcards.length - 1, i + 1));
                setFlipped(false);
              }}
              disabled={flashIndex === flashcards.length - 1}
              className="btn-primary"
            >
              Next
            </button>
          </div>
        </section>
      )}

      {quizzes.length > 0 && !quiz && (
        <section className="card mt-8 p-6">
          <h2 className="font-bold text-slate-900">Saved quizzes</h2>
          <ul className="mt-4 space-y-3">
            {quizzes.map((q) => (
              <li key={q._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-800">{q.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {q.questions.length} questions · generated {new Date(q.createdAt).toLocaleDateString()}
                    {q.attempts.length > 0 && ` · best score ${Math.max(...q.attempts.map((a) => a.percentage))}%`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to="/quizzes" className="btn-secondary text-xs">Open in quiz centre</Link>
                  <button
                    onClick={() => {
                      setQuiz(q);
                      setAnswers(new Array(q.questions.length).fill(''));
                      setResult(null);
                    }}
                    className="btn-primary text-xs"
                  >
                    Attempt
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {quiz && (
        <section className="card mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">{quiz.title}</h2>
            <button onClick={() => setQuiz(null)} className="btn-ghost text-xs">Close</button>
          </div>

          {result ? (
            <div className="mt-5">
              <div className="rounded-xl bg-slate-900 p-6 text-center text-white">
                <p className="text-sm text-slate-400">Your score</p>
                <p className="mt-1 text-4xl font-extrabold">
                  {result.score}/{result.total}
                </p>
                <p className="mt-1 text-sm text-slate-300">{result.percentage}% correct</p>
              </div>

              <ul className="mt-6 space-y-4">
                {result.results.map((r, i) => (
                  <li key={i} className={`rounded-lg border p-4 ${r.correct ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
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

              <button
                onClick={() => {
                  setQuiz(null);
                  setResult(null);
                }}
                className="btn-primary mt-6"
              >
                Back to material
              </button>
            </div>
          ) : (
            <form onSubmit={submitQuiz} className="mt-5 space-y-5">
              {quiz.questions.map((q, qi) => (
                <div key={qi} className="rounded-lg border border-slate-200 p-5">
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
              <button disabled={busy === 'submit'} className="btn-primary">
                {busy === 'submit' ? 'Scoring...' : 'Submit answers'}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
