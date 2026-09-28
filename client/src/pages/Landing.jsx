import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'AI Summary Generator',
    desc: 'Paste your notes and get a concise revision summary with the most important exam points highlighted.',
    icon: 'M4 6h16M4 10h10M4 14h14M4 18h8',
  },
  {
    title: 'Active Recall Flashcards',
    desc: 'Automatically turn any chapter into question-and-answer cards built for spaced revision.',
    icon: 'M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5',
  },
  {
    title: 'MCQ Quiz Generator',
    desc: 'Test yourself with four-option questions, instant scoring and explanations for every answer.',
    icon: 'M9 9a3 3 0 1 1 4 2.8c-.7.4-1 1-1 1.7M12 17h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
  },
  {
    title: 'Personalised Study Plans',
    desc: 'Enter your exam date and daily hours to receive a day-by-day revision schedule.',
    icon: 'M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  },
];

const STEPS = [
  { n: '01', title: 'Upload your material', desc: 'Paste text or upload a .txt / .md / .csv file of your notes.' },
  { n: '02', title: 'Choose what you need', desc: 'Summary, flashcards, a quiz, or a full study plan - your pick.' },
  { n: '03', title: 'Revise with AI', desc: 'Read, test yourself and follow a plan built around your exam date.' },
];

export default function Landing() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-brand-400 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div className="animate-fade-up">
            <span className="badge bg-white/15 text-brand-50">AI-Powered Learning Platform</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Turn long notes into
              <span className="block text-brand-200">revision-ready material</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-50 sm:text-lg">
              AI StudyBuddy automatically summarises your study material, builds flashcards, generates
              quizzes and creates exam-ready study plans - so you spend less time organising notes and more
              time actually learning.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn bg-white px-6 py-3 text-brand-700 hover:bg-brand-50 focus:ring-white">
                Start learning free
              </Link>
              <Link
                to="/login"
                className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10 focus:ring-white"
              >
                I already have an account
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-100">
              <span>✓ No credit card required</span>
              <span>✓ Works on mobile &amp; desktop</span>
              <span>✓ Secure JWT login</span>
            </div>
          </div>

          <div className="animate-fade-up lg:pl-6">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <div className="rounded-xl bg-white p-5 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <p className="ml-2 text-xs font-semibold text-slate-400">AI StudyBuddy - Materials</p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-bold text-slate-500">STUDY MATERIAL</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">Photosynthesis - Biology</p>
                    <p className="mt-0.5 text-xs text-slate-400">6,248 characters · uploaded just now</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Summary', value: 'Generated', tone: 'text-emerald-600 bg-emerald-50' },
                      { label: 'Flashcards', value: '12 cards', tone: 'text-brand-600 bg-brand-50' },
                      { label: 'Quiz', value: '8 questions', tone: 'text-amber-600 bg-amber-50' },
                      { label: 'Study Plan', value: '7 days left', tone: 'text-violet-600 bg-violet-50' },
                    ].map((row) => (
                      <div key={row.label} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{row.label}</p>
                        <p className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold ${row.tone}`}>{row.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-slate-900 p-3">
                    <p className="text-[11px] font-bold text-slate-400">AI SUMMARY</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      Photosynthesis converts light energy into chemical energy stored as glucose, using
                      chlorophyll inside chloroplasts across two stages: the light-dependent reaction and the
                      Calvin cycle...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="badge bg-brand-50 text-brand-700">Core Features</span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Everything you need to revise faster</h2>
          <p className="mt-3 text-slate-600">
            Built specifically for students who have more syllabus to cover than time to study it.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="badge bg-slate-100 text-slate-600">How it works</span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">From notes to revision in three steps</h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-xl border border-slate-200 p-6">
                <span className="text-4xl font-extrabold text-brand-100">{s.n}</span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="badge bg-emerald-50 text-emerald-700">Built for students</span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Your study space, not another app to manage</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Notes, summaries, flashcards, quizzes and study plans all live in one place. Each piece of
              material you upload can be reused across every AI feature, so nothing gets lost in a folder of
              PDFs you never open again.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Secure registration with encrypted passwords (bcrypt)',
                'Role-based access: students and administrators',
                'Every generated resource is saved for later revision',
                'Built with React, Node.js, Express, MongoDB and Google Gemini',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-900 p-8">
            <h3 className="text-lg font-bold text-white">Project details</h3>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ['Project title', 'AI StudyBuddy - AI assistant for smarter learning and study support'],
                ['Developed by', 'Hasim Rizvi'],
                ['Class', 'B.Sc. Computer Science - 3rd Year'],
                ['College', 'Mohamed Sathak College of Arts and Science'],
                ['Tech stack', 'React · Vite · Node.js · Express · MongoDB · Mongoose · JWT · Google Gemini'],
                ['Architecture', 'MVC pattern with modular RESTful API'],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-slate-800 pb-3 last:border-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</dt>
                  <dd className="mt-0.5 text-slate-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-brand-700">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white">Ready to study smarter?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Create a free account and turn your next chapter into a summary, flashcards and a quiz in under a
            minute.
          </p>
          <Link to="/register" className="btn mt-7 bg-white px-7 py-3 text-brand-700 hover:bg-brand-50 focus:ring-white">
            Create free account
          </Link>
        </div>
      </section>
    </div>
  );
}
